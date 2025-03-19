import { sign } from "hono/jwt";
const generateAccessToken = async (user: any) => {
  const payload = {
    _id: user._id,
    exp:
      Math.floor(Date.now() / 1000) +
      60 * 60 * 24 * Number(process.env.ACCESS_TOKEN_EXPIRY),
  };
  return sign(payload, process.env.ACCESS_TOKEN_SECRET as string);
};

export { generateAccessToken };
