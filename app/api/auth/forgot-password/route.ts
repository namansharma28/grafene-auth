import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateOTP, sendPasswordResetOTP } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gravitas");
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      // Return 200 for security so we don't leak user existence
      return NextResponse.json(
        { message: "If an account exists with this email, reset instructions have been sent." },
        { status: 200 }
      );
    }

    await db.collection("verification_tokens").deleteMany({
      identifier: normalizedEmail,
      type: "password_reset",
    });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.collection("verification_tokens").insertOne({
      identifier: normalizedEmail,
      token: otp,
      type: "password_reset",
      expires,
      createdAt: new Date(),
    });

    try {
      await sendPasswordResetOTP(normalizedEmail, user.name || "User", otp);
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr);
      return NextResponse.json({ error: "Failed to send reset email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "Password reset instructions sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
