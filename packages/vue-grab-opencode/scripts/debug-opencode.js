import { createOpencodeClient } from "@opencode-ai/sdk";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Point to node_modules/.bin in the package root
const binPath = path.resolve(__dirname, "../node_modules/.bin");

// Ensure local binary is in PATH
const envPath = process.env.PATH || process.env.Path || "";
const newPath = `${binPath}${path.delimiter}${envPath}`;
process.env.PATH = newPath;
if (process.platform === "win32") {
    process.env.Path = newPath;
}

// Mock of the server logic from src/server.ts
async function localCreateOpencodeServer(options = {}) {
    options = Object.assign({
        hostname: "127.0.0.1",
        port: 0, // Dynamic port to avoid conflicts
        timeout: 5000,
    }, options);

    const opencodeBin = process.platform === "win32"
        ? path.join(binPath, "opencode.cmd")
        : path.join(binPath, "opencode");

    console.log(`[Debug] Spawning Opencode Server: ${opencodeBin}`);

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
        windowsHide: true,
        shell: false
    });

    const url = await new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            reject(new Error(`Timeout waiting for server to start after ${options.timeout}ms`));
        }, options.timeout);

        let output = "";
        proc.stdout?.on("data", (chunk) => {
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

        proc.stderr?.on("data", (chunk) => {
            output += chunk.toString();
            // Don't log stderr by default to keep output clean, unless needed
        });

        proc.on("exit", (code) => {
            clearTimeout(id);
            let msg = `Server exited with code ${code}`;
            if (output.trim()) {
                msg += `\nServer output: ${output}`;
            }
            reject(new Error(msg));
        });

        proc.on("error", (error) => {
            clearTimeout(id);
            reject(error);
        });
    });

    return {
        url,
        close() {
            proc.kill();
        },
    };
}

async function run() {
    let server;
    try {
        console.log("\n--- Starting Debug Session ---");
        
        // 1. Start Server
        console.log("1. Starting Opencode Server...");
        server = await localCreateOpencodeServer();
        console.log(`✅ Server started successfully at ${server.url}`);

        // 2. Create Client
        console.log("2. Creating Client...");
        const client = createOpencodeClient({
            baseUrl: server.url,
        });
        console.log("✅ Client created.");

        // 3. Test Auth
        console.log("3. Testing Auth Configuration...");
        const provider = process.env.DEBUG_PROVIDER || "openai";
        const apiKey = process.env.DEBUG_API_KEY || "sk-dummy-key";

        console.log(`   Provider: ${provider}`);
        console.log(`   API Key: ${apiKey.substring(0, 8)}...`);

        await client.auth.set({
            path: { id: provider },
            body: { type: "api", key: apiKey },
        });

        console.log("✅ Auth configured successfully!");
        console.log("   (Note: 'Auth configured' means the server accepted the key. It does not validate the key with the provider yet.)");
        
        console.log("\n✅✅✅ DIAGNOSIS RESULT: PASS ✅✅✅");
        console.log("The Opencode server can start and accept auth configuration.");
        console.log("If you still see errors in the app, check:");
        console.log("1. Is the vue-grab-opencode server running?");
        console.log("2. Is the browser connecting to the right port (6567)?");
        console.log("3. Are the API Key and Provider correct?");

    } catch (err) {
        console.error("\n❌❌❌ DIAGNOSIS RESULT: FAIL ❌❌❌");
        console.error("Error details:", err);
    } finally {
        if (server) {
            console.log("\nClosing server...");
            server.close();
        }
    }
}

run();
