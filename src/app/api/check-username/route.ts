import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { ApiResponse } from "@/types/ApiTypes";
import { AxiosError } from "axios";
import { AccumulatorOperator } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import React from "react";

export async function GET(request: NextRequest) {
  await dbConnect();
  const sendMsgUrl = new URL(request.url);
  const getUsername = sendMsgUrl.searchParams.get("username")
  try {
    const findUser = await UserModel.aggregate([
      {
        $match: {
          username: getUsername,
        },
      },
    ]);
    // console.log(findUser);
    if (findUser.length == 0) {
      return NextResponse.json(
        {
          success: false,
          message: false,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: true,
      },
      { status: 200 }
    );
  } catch (error) {
    error as AxiosError;
    return NextResponse.json(
      {
        success: false,
        message: "Error occured checking username existence",
      },
      { status: 500 }
    );
  }
}
