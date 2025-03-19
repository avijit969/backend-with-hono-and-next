import { createUser, loginUser } from "@/controllers/users.controller";
import { connectDB } from "@/db";
import { Hono } from "hono";
const user = new Hono();
connectDB();
user.get("/", (c) => {
  return c.json({
    message: "Hello from user route",
  });
});
user.post("/create-user", createUser);
user.post("/login-user", loginUser);
user.get("/get-user", (c) => {
  console.log(c.get("jwtPayload"));
  return c.json(c.get("jwtPayload"));
});

export default user;
