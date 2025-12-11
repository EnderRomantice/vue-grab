import net from "node:net";
import { exec } from "node:child_process";
import { createOpencode } from "@opencode-ai/sdk";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { serve } from "@hono/node-server";
import pc from "picocolors";
import { DEFAULT_PORT } from "./constants.js";

const OPENCODE_PORT = 4096;

const VERSION = process.env.VERSION ?? "0.0.0";

export interface OpencodeAgentOptions {
  model?: string;
  agent?: string;
  directory?: string;
}

interface VueGrabRequest {
  prompt: string;
  locator: any;
  htmlSnippet: string;
  agentConfig?: {
    model?: string;
  };
}

export interface AgentContext<T = OpencodeAgentOptions> {
  content: string;
  prompt: string;
  options?: T;
}

interface OpencodeInstance {
  client: Awaited<ReturnType<typeof createOpencode>>["client"];
  server: Awaited<ReturnType<typeof createOpencode>>["server"];
}

let opencodeInstance: OpencodeInstance | null = null;

const getOpencodeClient = async () => {
  if (!opencodeInstance) {
    const instance = await createOpencode({
      hostname: "127.0.0.1",
      port: OPENCODE_PORT,
    });
    opencodeInstance = instance;
  }
  return opencodeInstance.client;
};

const executeOpencodePrompt = async (
  prompt: string,
  options?: OpencodeAgentOptions,
  onStatus?: (text: string) => void,
): Promise<void> => {
  const client = await getOpencodeClient();

  onStatus?.("Thinking...");

  const sessionResponse = await client.session.create({
    body: { title: "Vue Grab Session" },
  });

  if (sessionResponse.error || !sessionResponse.data) {
    throw new Error("Failed to create session");
  }

  const sessionId = sessionResponse.data.id;

  const modelConfig = options?.model
    ? {
        providerID: options.model.split("/")[0],
        modelID: options.model.split("/")[1] || options.model,
      }
    : undefined;

  const promptResponse = await client.session.prompt({
    path: { id: sessionId },
    body: {
      ...(modelConfig && { model: modelConfig }),
      parts: [{ type: "text", text: prompt }],
    },
  });

  if (promptResponse.data?.parts) {
    for (const part of promptResponse.data.parts) {
      if (part.type === "text" && part.text) {
        onStatus?.(part.text);
      }
    }
  }
};

export const createServer = (): Hono => {
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

    let componentName = "";
    let filePath = "";
    
    if (locator && locator.vue && Array.isArray(locator.vue)) {
      const comp = locator.vue.find((c: any) => c.name || c.file);
      if (comp) {
        componentName = comp.name || "";
        filePath = comp.file || "";
      }
    }

    const componentInfo = componentName || filePath || "Unknown component";
    
    // Build content similar to react-grab format
    const locatorJSON = JSON.stringify(locator, null, 2);
    const content = `Vue Component: ${componentInfo}

Element HTML:
${htmlSnippet}

Component Locator:
${locatorJSON}`;

    const formattedPrompt = `
User Request: ${prompt}

Context:
${content}
`;

    c.header('X-Accel-Buffering', 'no');
    c.header('Cache-Control', 'no-cache');
    c.header('Content-Type', 'text/event-stream');
    c.header('Connection', 'keep-alive');
    
    return streamSSE(c, async (stream) => {
      try {
        await executeOpencodePrompt(
          formattedPrompt,
          { 
            model: agentConfig?.model,
            agent: 'edit'
          },
          (text) => {
            stream
              .writeSSE({
                data: text,
                event: "status",
              })
              .catch(() => {});
          }
        );

        await stream.writeSSE({
          data: "Completed successfully",
          event: "status",
        });
        await stream.writeSSE({ data: "", event: "done" });
       } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        await stream.writeSSE({
          data: `Error: ${errorMessage}`,
          event: "error",
        });
        await stream.writeSSE({ data: "", event: "done" });
      }
    });
  });

  app.post("/agent", async (c) => {
    const requestBody = await c.req.json<AgentContext<OpencodeAgentOptions>>();
    const { content, prompt, options } = requestBody;

    const formattedPrompt = `
User Request: ${prompt}

Context:
${content}
`;

    c.header('X-Accel-Buffering', 'no');
    c.header('Cache-Control', 'no-cache');
    c.header('Content-Type', 'text/event-stream');
    c.header('Connection', 'keep-alive');

    return streamSSE(c, async (stream) => {
      try {
        await executeOpencodePrompt(
          formattedPrompt,
          options,
          (text) => {
            stream
              .writeSSE({
                data: text,
                event: "status",
              })
              .catch(() => {});
          }
        );

        await stream.writeSSE({
          data: "Completed successfully",
          event: "status",
        });
        await stream.writeSSE({ data: "", event: "done" });
       } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        await stream.writeSSE({
          data: `Error: ${errorMessage}`,
          event: "error",
        });
        await stream.writeSSE({ data: "", event: "done" });
      }
    });
  });

  app.get("/health", (c) => {
    return c.json({ status: "ok", provider: "opencode" });
  });

  return app;
};

const isPortInUse = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const netServer = net.createServer();
    netServer.once("error", () => resolve(true));
    netServer.once("listening", () => {
      netServer.close();
      resolve(false);
    });
    netServer.listen(port);
  });

const killProcessOnPort = async (port: number): Promise<boolean> => {
  const isWindows = process.platform === "win32";
  
  try {
    if (isWindows) {
      const { stdout } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
          if (error && !stdout) reject(error);
          else resolve({ stdout, stderr });
        });
      });
      
      const lines = stdout.trim().split("\n");
      const pids = new Set<string>();
      for (const line of lines) {
        const match = line.trim().match(/:(\d+)\s+.*LISTENING\s+(\d+)/);
        if (match) {
          pids.add(match[2]);
        }
      }
      
      for (const pid of pids) {
        await new Promise<void>((resolve, reject) => {
          exec(`taskkill /PID ${pid} /F`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
      return pids.size > 0;
    } else {
      const { stdout } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        exec(`lsof -ti:${port}`, (error, stdout, stderr) => {
          if (error && !stdout) reject(error);
          else resolve({ stdout, stderr });
        });
      });
      
      const pids = stdout.trim().split("\n").filter(pid => pid.trim());
      for (const pid of pids) {
        await new Promise<void>((resolve, reject) => {
          exec(`kill -9 ${pid}`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
      return pids.length > 0;
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
  return false;
};

export const startServer = async (port: number = DEFAULT_PORT) => {
  if (await isPortInUse(port)) {
    console.log(`${pc.yellow(`Port ${port} is in use`)} ${pc.dim('(attempting to kill process)')}`);
    
    const killed = await killProcessOnPort(port);
    
    if (killed) {
      console.log(`${pc.green(`Successfully killed process on port ${port}`)}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`${pc.yellow(`No process killed or unable to kill process on port ${port}`)}`);
    }
    
    if (await isPortInUse(port)) {
      console.error(`${pc.red(`Port ${port} is still in use after cleanup attempt`)}`);
      console.error(`${pc.dim('Please free the port manually and try again.')}`);
      return;
    }
  }

  // Check Opencode port
  if (await isPortInUse(OPENCODE_PORT)) {
    console.log(`${pc.yellow(`Opencode port ${OPENCODE_PORT} is in use`)} ${pc.dim('(attempting to kill process)')}`);
    const killed = await killProcessOnPort(OPENCODE_PORT);
    if (killed) {
      console.log(`${pc.green(`Successfully killed process on port ${OPENCODE_PORT}`)}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`${pc.yellow(`No process killed or unable to kill process on port ${OPENCODE_PORT}`)}`);
    }
  }

  const honoApplication = createServer();
  serve({ fetch: honoApplication.fetch, port });
  console.log(`${pc.green("Vue Grab")} ${pc.gray(VERSION)} ${pc.dim("(Opencode)")}`);
  console.log(`- Local:    ${pc.cyan(`http://localhost:${port}`)}`);
};

