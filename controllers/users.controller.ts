import { generateAccessToken } from "@/helpers/generateTokents";
import hashPassword from "@/helpers/hashPassword";
import { isPasswordCorrect } from "@/helpers/verifyHashPassword";
import { User } from "@/models/model.users";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
const createUser = async (c: Context) => {
  const { username, email, password } = await c.req.json();
  if (!username || !email || !password) {
    return c.json({
      message: "All fields are required",
      status: 400,
    });
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return c.json({
      message: "User already exists with the same username or email",
      status: 400,
      success: false,
    });
  }
  //  hash password
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  const createdUser = await User.findById(user._id).select("-password");
  return c.json({
    message: "User created successfully",
    data: createdUser,
    status: 201,
    success: true,
  });
};

const loginUser = async (c: Context) => {
  const { username, password } = await c.req.json();
  console.log(username, password);
  if (!username || !password) {
    return c.json({
      message: "All fields are required",
      status: 400,
    });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return c.json({
      message: "User not found",
      status: 404,
    });
  }
  const isPasswordRight = await isPasswordCorrect(password, user.password);
  if (!isPasswordRight) {
    return c.json({
      message: "Invalid credentials",
      status: 401,
    });
  }
  //   generate access token
  const accessToken = await generateAccessToken(user);
  //   set access token in cookie
  setCookie(c, "accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * Number(process.env.ACCESS_TOKEN_EXPIRY),
  });
  return c.json({
    message: "Login successful",
    data: {
      username: user.username,
      email: user.email,
      id: user._id,
      fullanme: user.fullanme,
      avatar: user.avatar,
      accessToken: accessToken,
    },
    status: 200,
  });
};

export { createUser, loginUser };
