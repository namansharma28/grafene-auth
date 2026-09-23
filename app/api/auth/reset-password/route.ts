import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, email, password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gravitas");

    const query: Record<string, string> = { type: "password_reset", token };
    if (email) {
      query.identifier = email.toLowerCase().trim();
    }

    const tokenDoc = await db.collection("verification_tokens").findOne(query);

    if (!tokenDoc) {
      return NextResponse.json({ error: "Invalid or expired reset token/OTP code" }, { status: 400 });
    }

    if (new Date() > new Date(tokenDoc.expires)) {
      return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.collection("users").updateOne(
      { email: tokenDoc.identifier },
      {
        $set: {
          password: hashedPassword,
          emailVerified: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Delete token after successful use
    await db.collection("verification_tokens").deleteOne({ _id: tokenDoc._id });

    return NextResponse.json({ message: "Password reset successfully. You can now sign in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
