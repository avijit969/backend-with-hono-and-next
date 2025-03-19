import {
  createUser,
  getUser,
  loginUser,
  logoutUser,
} from "@/controllers/users.controller";
import { connectDB } from "@/db";
import { verifyJwt } from "@/helpers/verifyJwt";
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
user.get("/logout-user", verifyJwt, logoutUser);
user.get("/get-user", verifyJwt, getUser);

export default user;
