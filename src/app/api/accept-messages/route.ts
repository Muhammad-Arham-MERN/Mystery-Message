import { getServerSession } from "next-auth";
import { AuthOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { UserRoundIcon } from "lucide-react";


export async function POST(request: Request) {
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

  const UserId = user._id;
  const {messageAcceptOrNot} = await request.json();

  try {
    const updateMessageAcceptanceStatusAndUser =
      await UserModel.findByIdAndUpdate(
        UserId,
        { isAcceptingMessage: messageAcceptOrNot },
        { new: true }
      );
    if (!updateMessageAcceptanceStatusAndUser) {
      console.error("failed to find user to update message acceptance status", updateMessageAcceptanceStatusAndUser);
      return Response.json(
        {
          success: false,
          message: "failed to find user to update message acceptance status",
        },
        { status: 401 }
      );
    }
    console.log(
      `this is updated user: ${updateMessageAcceptanceStatusAndUser}`
    );
    return Response.json(
      {
        success: true,
        message: `User message acceptance status updated: ${messageAcceptOrNot} `,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("failed to update user message acceptance status");
    return Response.json(
      {
        success: false,
        message: "failed to update user message acceptance status",
      },
      { status: 500 }
    );
  }
}

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

  const UserId = user._id;

  try {
    const user = await UserModel.findById(UserId);
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessages: user.isAcceptingMessage 
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch user message acceptance status",
      },
      { status: 500 }
    );
  }
}
