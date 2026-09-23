import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, otp, type = "email_verification" } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gravitas");
    const normalizedEmail = email.toLowerCase().trim();

    const tokenDoc = await db.collection("verification_tokens").findOne({
      identifier: normalizedEmail,
      token: otp,
      type,
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: "Invalid verification code. Please check and try again." }, { status: 400 });
    }

    if (new Date() > new Date(tokenDoc.expires)) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    if (type === "email_verification") {
      await db.collection("users").updateOne(
        { email: normalizedEmail },
        { $set: { emailVerified: new Date(), updatedAt: new Date() } }
      );
    }

    // Delete used token
    await db.collection("verification_tokens").deleteOne({ _id: tokenDoc._id });

    return NextResponse.json({
      message: type === "email_verification" ? "Email verified successfully" : "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
