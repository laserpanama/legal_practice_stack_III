import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySession } from "./auth";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = opts.req.headers.cookie;
    const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
    const sessionToken = cookies[COOKIE_NAME];

    if (sessionToken) {
      const session = await verifySession(sessionToken);
      if (session) {
        user = await db.getUserByOpenId(session.userId);
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
