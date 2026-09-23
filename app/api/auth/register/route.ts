import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gravitas");
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.collection("users").findOne({ email: normalizedEmail });

    if (existingUser && existingUser.emailVerified && existingUser.password) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let userId = existingUser?._id;

    if (!existingUser) {
      const insertResult = await db.collection("users").insertOne({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: null,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = insertResult.insertedId;
    } else {
      await db.collection("users").updateOne(
        { _id: existingUser._id },
        {
          $set: {
            name,
            password: hashedPassword,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Delete any old verification tokens for this email & type
    await db.collection("verification_tokens").deleteMany({
      identifier: normalizedEmail,
      type: "email_verification",
    });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.collection("verification_tokens").insertOne({
      identifier: normalizedEmail,
      token: otp,
      type: "email_verification",
      expires,
      createdAt: new Date(),
    });

    try {
      await sendOTPEmail(normalizedEmail, name, otp);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      return NextResponse.json(
        { error: "Account created, but failed to send verification email. Please try resending code." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Account created successfully. Please check your email for the verification code.",
      userId: userId ? userId.toString() : "",
      email: normalizedEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
