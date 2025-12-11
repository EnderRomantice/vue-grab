#!/usr/bin/env node
import { startServer } from "./server.js";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
startServer(port).catch(console.error);
