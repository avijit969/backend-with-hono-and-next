import {
  createUser,
  deleteUser,
  getUser,
  loginUser,
  logoutUser,
  updateAvatar,
  updateUser,
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
user.patch("/update-avatar", verifyJwt, updateAvatar);
user.patch("/update-user", verifyJwt, updateUser);
user.delete("/delete-user", verifyJwt, deleteUser);

export default user;
