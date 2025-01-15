import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { User, AuthenticatedResponse } from "./types";

export async function auth(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  const prisma = new PrismaClient();

  if (!token) {
    return null;
  }

  try {
    const { userId } = verify(token.value, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getUser(): Promise<AuthenticatedResponse> {
  const user = await auth();
  return { user };
}
