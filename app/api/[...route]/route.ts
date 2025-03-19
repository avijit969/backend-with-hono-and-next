import { Hono } from "hono";
import { handle } from "hono/vercel";
import userRoute from "@/routes/user.routes";
import type { JwtVariables } from "hono/jwt";
import tripRoter from "@/routes/trip.routes";
type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>().basePath("/api");
app.route("/user", userRoute);
app.route("/trip", tripRoter);
export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
