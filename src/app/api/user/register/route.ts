import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.text();

  const res = await fetch(process.env.API_URL + "Register", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: body,
  });

  return res;
}
