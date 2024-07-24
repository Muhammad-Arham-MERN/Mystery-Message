import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET() {
    await dbConnect()
  const homePgUsers = await UserModel.aggregate([
    {
      $match: {
        isVerified:true
      },
    },
    {
        $project: {
          _id: 0,
          username: 1,
          isAcceptingMessage: 1,
        },
      },
  ]);

  if (!homePgUsers) {
    return Response.json(
      {
        success: false,
        message: "Error fetching users, pelase try again later",
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      success: false,
      users: homePgUsers,
    },
    { status: 200 }
  );
}
