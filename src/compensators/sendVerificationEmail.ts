import { resend } from "@/lib/resend";
import VerificationEmail from "@/../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiTypes";

export async function SendVerificationEmail(
  email: string,
  verifyCode: string,
  username: string
): Promise<ApiResponse> {
  console.log("Sending verification email to:", email); // Add this line for debugging
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Mystery Messenger Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    console.log("Email sent successfully to:", email); // Add this line for debugging
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Error sending email" };
  }
}
