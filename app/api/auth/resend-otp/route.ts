import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateOTP, sendOTPEmail, sendPasswordResetOTP } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, type = "email_verification" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gravitas");
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 });
    }

    await db.collection("verification_tokens").deleteMany({
      identifier: normalizedEmail,
      type,
    });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection("verification_tokens").insertOne({
      identifier: normalizedEmail,
      token: otp,
      type,
      expires,
      createdAt: new Date(),
    });

    if (type === "email_verification") {
      await sendOTPEmail(normalizedEmail, user.name || "User", otp);
    } else {
      await sendPasswordResetOTP(normalizedEmail, user.name || "User", otp);
    }

    return NextResponse.json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend verification code" }, { status: 500 });
  }
}
