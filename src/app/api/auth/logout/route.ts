import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: "auth-token",
    path: "/",
  });

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/login", requestUrl.origin);

  return NextResponse.redirect(redirectUrl.toString());
}
