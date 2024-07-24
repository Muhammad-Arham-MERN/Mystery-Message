import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

//check code is correct
//check code is not expired

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    
    const user = await UserModel.findOne({
      username: decodeURIComponent(username),
    });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 500 }
      );
    }
    if (user.isVerified === true){
      return Response.json(
        {
          success: false,
          message: "User Already Verified, redirecting ...",
        },
        { status: 402 }
      );
    }
    const codeIsNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    const codeIsCorrect = code === user.verifyCode;

    if (codeIsCorrect && codeIsNotExpired) {
      user.isVerified = true;
      await user.save()
      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    } else if (!codeIsNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code expired, please register again",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code entered",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("error verifying user", error);
    return Response.json(
      {
        success: false,
        message: "error verifying user",
      },
      { status: 400 }
    );
  }
}
