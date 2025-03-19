import { Context } from "hono";
import { getCookie } from "hono/cookie";

const getToken = (c: Context) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return getCookie(c, "accessToken");
};
export { getToken };
