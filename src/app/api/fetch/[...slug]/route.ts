import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: Array<string> } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = params.slug.join('/');

  if (token !== null) {
    const signedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET ?? "key", {
      algorithm: "HS256",
    });
    const res = await fetch(process.env.API_URL + path, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${signedToken}`,
      },
    });

    return res;
  }

  return NextResponse.error();
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: Array<string> } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const path = params.slug.join('/');
  const body = await req.text();

  if (token !== null) {
    const signedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET ?? "key", {
      algorithm: "HS256",
    });
    const res = await fetch(process.env.API_URL + path, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${signedToken}`,
      },
      body: body
    });

    return res;
  }

  return NextResponse.error();
}
