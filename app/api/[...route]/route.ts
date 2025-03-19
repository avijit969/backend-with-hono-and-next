import { Hono } from "hono";
import { handle } from "hono/vercel";
import userRoute from "@/routes/user.routes";
import { connectDB } from "@/db";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { verifyJwt } from "@/helpers/verifyJwt";
type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>().basePath("/api");

app.route("/user", userRoute);
export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
