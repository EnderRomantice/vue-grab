import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { spawn } from "node:child_process";
import { createOpencodeClient } from "@opencode-ai/sdk";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PORT } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const binPath = path.resolve(__dirname, "../node_modules/.bin");

// Ensure local binary is in PATH
const envPath = process.env.PATH || process.env.Path || "";
const newPath = `${binPath}${path.delimiter}${envPath}`;
process.env.PATH = newPath;
if (process.platform === "win32") {
    process.env.Path = newPath; // Ensure both are set on Windows
}

console.log(`[VueGrab] Added to PATH: ${binPath}`);

// --- Local SDK Overrides to fix Windows Spawn Issue ---
async function localCreateOpencodeServer(options: any = {}) {
    options = Object.assign({
        hostname: "127.0.0.1",
        port: 0,
        timeout: 5000,
    }, options);

    const opencodeBin = process.platform === "win32"
        ? path.join(binPath, "opencode.cmd")
        : path.join(binPath, "opencode");

    console.log(`[VueGrab] Spawning Opencode Server: ${opencodeBin}`);

    const isWin = process.platform === 'win32';
    let spawnCmd = opencodeBin;
    let spawnArgs = [`serve`, `--hostname=${options.hostname}`, `--port=${options.port}`];

    if (isWin) {
        spawnCmd = "cmd";
        spawnArgs = ["/c", opencodeBin, ...spawnArgs];
    }

    const proc = spawn(spawnCmd, spawnArgs, {
        signal: options.signal,
        env: {
            ...process.env,
            OPENCODE_CONFIG_CONTENT: JSON.stringify(options.config ?? {}),
        },
        windowsHide: true, // Hide window if possible
        shell: false // Explicit path, no shell needed
    });

    const url = await new Promise<string>((resolve, reject) => {
        const id = setTimeout(() => {
            reject(new Error(`Timeout waiting for server to start after ${options.timeout}ms`));
        }, options.timeout);

        let output = "";
        proc.stdout?.on("data", (chunk: any) => {
            output += chunk.toString();
            const lines = output.split("\n");
            for (const line of lines) {
                if (line.startsWith("opencode server listening")) {
                    const match = line.match(/on\s+(https?:\/\/[^\s]+)/);
                    if (!match) {
                        throw new Error(`Failed to parse server url from output: ${line}`);
                    }
                    clearTimeout(id);
                    resolve(match[1]);
                    return;
                }
            }
        });

        proc.stderr?.on("data", (chunk: any) => {
            output += chunk.toString();
        });

        proc.on("exit", (code: any) => {
            clearTimeout(id);
            let msg = `Server exited with code ${code}`;
            if (output.trim()) {
                msg += `\nServer output: ${output}`;
            }
            reject(new Error(msg));
        });

        proc.on("error", (error: any) => {
            clearTimeout(id);
            reject(error);
        });
        
        if (options.signal) {
            options.signal.addEventListener("abort", () => {
                clearTimeout(id);
                reject(new Error("Aborted"));
            });
        }
    });

    return {
        url,
        close() {
            proc.kill();
        },
    };
}

async function localCreateOpencode(options: any = {}) {
    const server = await localCreateOpencodeServer(options);
    const client = createOpencodeClient({
        baseUrl: server.url,
    });
    return {
        client,
        server,
    };
}

interface VueGrabRequest {
  prompt: string;
  locator: any;
  htmlSnippet: string;
  agentConfig?: {
      provider?: string;
      model?: string;
      apiKey?: string;
  };
}

const app = new Hono();

app.use("/*", cors());

app.post("/api/code-edit", async (c) => {
  let body: VueGrabRequest;
  try {
    body = await c.req.json<VueGrabRequest>();
  } catch (e) {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { prompt, locator, htmlSnippet, agentConfig } = body;

  // Configure auth if provided
  if (agentConfig?.apiKey && agentConfig?.provider) {
      try {
          console.log(`[VueGrab] Configuring auth for provider: ${agentConfig.provider}`);
          // Log obscured key for debugging
          const keyPreview = agentConfig.apiKey.length > 8 ? `${agentConfig.apiKey.slice(0, 4)}...${agentConfig.apiKey.slice(-4)}` : "***";
          console.log(`[VueGrab] API Key: ${keyPreview}`);

          console.log("[VueGrab] Attempting to create Opencode client...");
          const { client } = await localCreateOpencode();
          console.log("[VueGrab] Client created. Setting auth...");
          
          await client.auth.set({
              path: { id: agentConfig.provider },
              body: { type: "api", key: agentConfig.apiKey },
          });
          console.log(`[VueGrab] Auth configured successfully for ${agentConfig.provider}.`);
      } catch (err: any) {
          console.error("[VueGrab] Failed to configure auth. Error details:", {
              message: err.message,
              stack: err.stack,
              cause: err.cause,
              code: err.code,
              path: process.env.PATH
          });
          return c.json({ 
              error: "Failed to configure auth", 
              details: err.message,
              envPath: process.env.PATH 
          }, 500);
      }
  } else {
      console.log("[VueGrab] No auth configuration provided in request.");
  }

  let filePath = "";
  if (locator && locator.vue && Array.isArray(locator.vue)) {
       const compWithFile = locator.vue.find((c: any) => c.file);
       if (compWithFile) filePath = compWithFile.file;
  }

  const contextData = `Target File: ${filePath}\nLocator: ${JSON.stringify(locator, null, 2)}\nHTML Snippet:\n${htmlSnippet}`;
  const fullPrompt = `
You are an expert code editor.
Your task is to modify the code in the "Target File" based on the "User Request".
You MUST use the file editing tools to apply changes to the "Target File" immediately.
Do NOT ask for clarification. Do NOT explain what you are going to do. JUST EDIT THE CODE.
If you need to output text, please use Chinese.

Target File: ${filePath}

User Request: ${prompt}

Context:
${contextData}
`;

  console.log("Full Prompt:", fullPrompt);

  const spawnCwd = process.cwd();

  return streamSSE(c, async (stream) => {
    console.log("[VueGrab] Starting opencode process...");
    console.log(`[VueGrab] Target file: ${filePath}`);
    console.log(`[VueGrab] Working directory: ${spawnCwd}`);

    const model = agentConfig?.model || 'deepseek/deepseek-v3.2';
    console.log(`[VueGrab] Using model: ${model}`);

    const isWin = process.platform === 'win32';
    // Use absolute path for robustness
    const opencodeBin = process.platform === "win32"
        ? path.join(binPath, "opencode.cmd")
        : path.join(binPath, "opencode");

    let cmd, args;
    if (isWin) {
        // Use cmd /c to run opencode on Windows to avoid popup windows
        cmd = 'cmd';
        args = ['/c', opencodeBin, 'run', '--format', 'json', '--model', model, '--agent', 'build'];
    } else {
        cmd = opencodeBin;
        args = ['run', '--format', 'json', '--model', model, '--agent', 'build'];
    }

    const proc = spawn(cmd, args, {
        env: process.env,
        shell: false,
        cwd: spawnCwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
    });

    proc.on('error', (err) => {
        console.error("[VueGrab] Failed to start opencode:", err);
        stream.writeSSE({ event: 'error', data: JSON.stringify({ message: "Failed to start opencode" }) });
        stream.close();
    });

    proc.stdout.on('data', (data) => {
        const text = data.toString();
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                stream.writeSSE({ data: line });
            }
        }
    });

    proc.stderr.on('data', (data) => {
        console.error("[VueGrab] Opencode error output:", data.toString());
    });

    const exitPromise = new Promise<void>((resolve) => {
        proc.on('close', (code) => {
            console.log(`[VueGrab] Opencode process exited with code ${code}`);
            if (code !== 0) {
                 stream.writeSSE({ event: 'error', data: JSON.stringify({ message: `Opencode process exited abnormally with code ${code}` }) });
            } else {
                 stream.writeSSE({ event: 'done', data: 'Process completed' });
            }
            resolve();
        });
    });

    if (proc.stdin) {
        proc.stdin.write(fullPrompt);
        proc.stdin.end();
    }

    await exitPromise;
  });
});

serve({
  fetch: app.fetch,
  port: DEFAULT_PORT,
}, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});
