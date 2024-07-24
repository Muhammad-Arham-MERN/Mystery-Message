import { getServerSession } from "next-auth";
import { AuthOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

export async function DELETE(request: NextRequest) {
  const extractedMsgId = request.nextUrl.pathname.split("/").pop()
  const messageDelId = new mongoose.Types.ObjectId(extractedMsgId)

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
  try {
    const updatedUser = await UserModel.updateOne(
      {_id: user._id},
      {$pull: {messages: {_id: messageDelId}}}
    )
    if (updatedUser.modifiedCount == 0){
      return Response.json(
        {
          success: false,
          message: "Error deleting message",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "message deleted successfuly",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to delete message",
      },
      { status: 500 }
    );
  }

}
