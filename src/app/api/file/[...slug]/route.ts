import { NextRequest, NextResponse } from "next/server";
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: Array<string> } }
) {
  if (process.env.API_ASSET_URL) {
    const path = params.slug.join("/");
    const endpoint = process.env.API_ASSET_URL + path;
    const res = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    return res;
  }

  return NextResponse.error();
}
