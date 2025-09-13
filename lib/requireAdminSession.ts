import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { AuthOptions, Session } from "next-auth";

// NOTE: file [...nextauth] kamu JS, jadi cast ke AuthOptions agar cocok di TS
import { authOptions as rawAuthOptions } from "../pages/api/auth/[...nextauth]";

export type AdminSession = Session & {
  user: NonNullable<Session["user"]> & {
    isAdmin?: boolean;
    role?: string;
    permissions?: string[];
  };
};

export async function requireAdminSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AdminSession | null> {
  const authOptions = (rawAuthOptions as unknown) as AuthOptions;

  const session = (await getServerSession(
    req,
    res,
    authOptions
  )) as AdminSession | null;

  if (!session || !session.user?.isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session;
}
