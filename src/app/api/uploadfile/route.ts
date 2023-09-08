import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export async function POST(
  req: NextRequest
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token !== null) {
    const signedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET ?? "key", {
      algorithm: "HS256",
    });

    const form = await req.formData();

    const res = await fetch(process.env.API_URL + "file/OnPostUploadAsync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${signedToken}`,
      },
      body: form,
    });

    return res;
  }

  return NextResponse.error();
}
