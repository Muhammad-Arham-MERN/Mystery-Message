import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import GoogleProvider from "next-auth/providers/google";

export const AuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env?.GOOGLE_ID ?? "",
      clientSecret: process.env?.GOOGLE_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          username: profile.email.split('@')[0], // Derive username from email
          image: profile.picture,
        };
      },
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any): Promise<any> {
        console.log("user credentials received upon login",credentials)
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error("User not found");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account before signing in");
          }
          const passwordCompare = await bcrypt.compare(
            credentials.password,
            user.password as string
          );
          if (passwordCompare) {
            return user;
          } else {
            throw new Error("Password did not match");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({user,account,email,profile}) {
      await dbConnect()
      const existingUserCheck = await UserModel.findOne({
        email: user.email
      })
      
      if (!existingUserCheck){
        try {
          const verifyCode = Math.floor(Math.random() * 900000 + 100000).toString()
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1);
          const createNewUser = new UserModel({
            username: user.name || user.username,
            email: user.email,
            password: null,
            verifyCode: verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: true,
            isOAuth: true,
            isAcceptingMessage: true,
            messages: []
          })
          await createNewUser.save()
        } catch (error) {
          console.log(error)
        }
      }
      
      return true
    },

    //jwt and session manipulation
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
};
