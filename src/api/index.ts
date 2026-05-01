import { Hono } from "hono";
import { cors } from "hono/cors";

import authRouter from './auth';
import projectRouter from './projects'
import adminRouter from './admin'
import chatRouter from './chat'

import { handleError } from "@/utils";
import { serveStatic } from '@hono/node-server/serve-static'; 

const app = new Hono();

app.notFound((c) => c.text("Route not found"));
app.onError(handleError)

app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.get("/health", (c) => c.text("Surviving Bro!"));

app.get('/script', serveStatic({ path: './public/script.js' }));
  
app.route("/api/auth", authRouter);
app.route("/api/project", projectRouter);
app.route("/api/chat", chatRouter)
app.route("/api/admin", adminRouter);

export default app;
