import { spawn } from 'node:child_process';

console.log("Testing opencode run with stdin...");

const proc = spawn('opencode', ['run', '--format', 'json'], {
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdout.on('data', (data) => {
    console.log(`STDOUT: ${data}`);
});

proc.stderr.on('data', (data) => {
    console.log(`STDERR: ${data}`);
});

proc.on('close', (code) => {
    console.log(`Exited with ${code}`);
});

// Try writing to stdin
proc.stdin.write("Hello, who are you?");
proc.stdin.end();
