import nextAuth from "next-auth";
import { AuthOptions } from "./options";

const handler = nextAuth(AuthOptions)

export {handler as GET, handler as POST}