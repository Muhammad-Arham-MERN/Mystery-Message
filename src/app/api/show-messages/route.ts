import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(AuthOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    console.error("User session failed or expired");
    return Response.json(
      {
        success: false,
        message: "User session failed or expired",
      },
      { status: 500 }
    );
  }

  
  const UserId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([
      {
        $match: { _id: UserId },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: { _id: "$_id", messages: { $push: "$messages" } },
      },
    ]);
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found to display messages",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`Error showing messages to dashboard ${error}`)
    return Response.json(
      {
        success: false,
        message: "error displaying messages",
      },
      { status: 500 }
    );
  }
}
