import { uploadOnCloudinary } from "@/utils/cloudinary";
import { Hono } from "hono";

const uploadRouter = new Hono();

uploadRouter.post("/file", async (c) => {
  try {
    const { file } = await c.req.parseBody();

    const response = await uploadOnCloudinary(file as File);
    return c.json(response, 200);
  } catch (error) {
    return c.json({ message: "Upload failed", status: 500 }, 500);
  }
});

export default uploadRouter;
