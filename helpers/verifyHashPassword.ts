import bcrypt from "bcryptjs";
const isPasswordCorrect = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
export { isPasswordCorrect };
