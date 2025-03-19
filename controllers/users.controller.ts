import { generateAccessToken } from "@/helpers/generateTokents";
import hashPassword from "@/helpers/hashPassword";
import { isPasswordCorrect } from "@/helpers/verifyHashPassword";
import { User } from "@/models/user.model";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
const createUser = async (c: Context) => {
  try {
    const { username, email, password, fullname } = await c.req.json();
    if (!username || !email || !password || !fullname) {
      return c.json(
        {
          message: "All fields are required",
          status: 400,
        },
        400
      );
    }
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return c.json(
        {
          message: "User already exists with the same username or email",
          status: 400,
          success: false,
        },
        400
      );
    }
    //  hash password
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullname,
    });
    const createdUser = await User.findById(user._id).select("-password");
    return c.json(
      {
        message: "User created successfully",
        data: createdUser,
        status: 201,
        success: true,
      },
      201
    );
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};

const loginUser = async (c: Context) => {
  const { username, password } = await c.req.json();
  console.log(username, password);
  if (!username || !password) {
    return c.json(
      {
        message: "All fields are required",
        status: 400,
      },
      400
    );
  }
  const user = await User.findOne({ username });
  if (!user) {
    return c.json(
      {
        message: "User not found",
        status: 404,
      },
      404
    );
  }
  const isPasswordRight = await isPasswordCorrect(password, user.password);
  if (!isPasswordRight) {
    return c.json(
      {
        message: "Invalid credentials",
        status: 400,
      },
      400
    );
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
      fullname: user.fullname,
      avatar: user.avatar,
      accessToken: accessToken,
    },
    status: 200,
  });
};

const logoutUser = async (c: Context) => {
  deleteCookie(c, "accessToken");
  return c.json({
    message: "user Logout successful",
    status: 200,
  });
};
const getUser = async (c: Context) => {
  const { _id } = c.get("user");
  const user = await User.findById(_id).select("-password");
  if (!user)
    return c.json({ message: "User not found", status: 404, success: false });
  return c.json({
    message: "User found successfully",
    data: user,
    status: 200,
    success: true,
  });
};
const updateAvatar = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const body = await c.req.parseBody();
    const file = body.avatar as File;

    if (!file) {
      return c.json({ message: "No file uploaded", status: 400 });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadOnCloudinary(file);

    if (!imageUrl) {
      return c.json({ message: "Upload failed", status: 500 });
    }

    // Update user avatar in the database
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $set: {
          avatar: imageUrl.secure_url,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    return c.json(
      {
        message: "Avatar updated successfully",
        data: updatedUser,
        status: 200,
        sucess: true,
      },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: "Server error", status: 500 }, 500);
  }
};

const updateUser = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    console.log(_id);
    const body = await c.req.parseBody();
    const { fullname, username, email } = body;
    const userFounded = await User.findById(_id);
    if (!userFounded) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }
    if (!fullname && !username && !email) {
      return c.json({ message: "No fields to update", status: 400 }, 400);
    }
    const usernameAndEmailAlreadyExists = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (usernameAndEmailAlreadyExists) {
      return c.json(
        {
          message: "Username already exists try with another one",
          status: 400,
        },
        400
      );
    }
    let imageUrl = userFounded.avatar;
    if (body.avatar) {
      imageUrl = await uploadOnCloudinary(body.avatar as File);
      if (!imageUrl) {
        return c.json({ message: "Upload failed", status: 500 }, 500);
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $set: {
          fullname: fullname || userFounded.fullname,
          username: username || userFounded.username,
          email: email || userFounded.email,
          avatar: imageUrl.secure_url,
        },
      },
      { new: true }
    );

    return c.json(
      {
        message: "User updated successfully",
        data: updatedUser,
        status: 200,
        sucess: true,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
const deleteUser = async (c: Context) => {
  try {
    const { _id } = c.get("user");
    const userFounded = await User.findById(_id);
    if (!userFounded) {
      return c.json({ message: "User not found", status: 404 }, 404);
    }
    const deletedUser = await User.findByIdAndDelete(_id);
    return c.json(
      {
        message: "User deleted successfully",
        data: deletedUser,
        status: 200,
        sucess: true,
      },
      200
    );
  } catch (error: any) {
    return c.json({ message: error.message, status: 500 }, 500);
  }
};
export {
  createUser,
  loginUser,
  getUser,
  logoutUser,
  updateAvatar,
  updateUser,
  deleteUser,
};
