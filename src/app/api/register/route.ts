import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { SendVerificationEmail } from "../../../compensators/sendVerificationEmail";
import { NextRequest as Request, NextResponse as response } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    // If username already exists in database and is verified, the first if condition works and closes the operation of this POST request
    const existingUsingVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    const verifyCode = Math.floor(Math.random() * 900000 + 100000).toString()
    if (existingUsingVerifiedByUsername) {
      return response.json(
        {
          success: false,
          message: "username is already taken",
        },
        { status: 400 }
      );
    }

    // Checks whether the user with this email exists without the isVerified part
    const existingUserByEmail = await UserModel.findOne({
      email,
    });

    // if user with the email exists?
    if (existingUserByEmail) {
      // If user with this email exists and is verified, the code stops and finishes the process
      if (existingUserByEmail.isVerified) {
        return response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // If no user exists, means register, so encrypt password first
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // to register, create an expiry date for OTP

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    // sending verification email
    const emailResponse = await SendVerificationEmail(
      email,
      verifyCode,
      username
    );
    if (!emailResponse.success) {
      return response.json(
        {
          success: false,
          message: emailResponse.message || "Error sending verification email",
        },
        { status: 500 }
      );
    }

    return response.json(
      {
        success: true,
        message: "User Registration successful. Please Verify Email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user", error);
    return response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
