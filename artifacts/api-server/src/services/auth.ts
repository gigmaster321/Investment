import bcrypt from "bcryptjs";
import type { PublicUser, User } from "@workspace/db";

const SALT_ROUNDS = 12;

/** Lazy-load the DB module so the server starts even without DATABASE_URL. */
async function getDb() {
  try {
    return await import("@workspace/db");
  } catch {
    const err = new Error("Database not configured. Set DATABASE_URL.");
    (err as any).code = "DB_UNAVAILABLE";
    throw err;
  }
}

export function toPublicUser(user: User): PublicUser {
  const { password: _pw, ...pub } = user;
  return pub;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function registerUser(data: {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<PublicUser> {
  const { db, usersTable } = await getDb();
  const { eq } = await import("drizzle-orm");

  const [byEmail] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, data.email))
    .limit(1);
  if (byEmail) throw Object.assign(new Error("EMAIL_EXISTS"), { code: "EMAIL_EXISTS" });

  const [byUsername] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, data.username))
    .limit(1);
  if (byUsername)
    throw Object.assign(new Error("USERNAME_EXISTS"), { code: "USERNAME_EXISTS" });

  const hashed = await hashPassword(data.password);

  const [user] = await db
    .insert(usersTable)
    .values({
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      phone: data.phone ?? null,
      password: hashed,
      role: "user",
      email_verified: false,
      account_status: "active",
    })
    .returning();

  return toPublicUser(user);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<PublicUser> {
  const { db, usersTable } = await getDb();
  const { eq } = await import("drizzle-orm");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user)
    throw Object.assign(new Error("INVALID_CREDENTIALS"), {
      code: "INVALID_CREDENTIALS",
    });

  const valid = await verifyPassword(password, user.password);
  if (!valid)
    throw Object.assign(new Error("INVALID_CREDENTIALS"), {
      code: "INVALID_CREDENTIALS",
    });

  if (user.account_status !== "active")
    throw Object.assign(new Error("ACCOUNT_INACTIVE"), {
      code: "ACCOUNT_INACTIVE",
      status: user.account_status,
    });

  return toPublicUser(user);
}

export async function getUserById(id: number): Promise<PublicUser | null> {
  const { db, usersTable } = await getDb();
  const { eq } = await import("drizzle-orm");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return user ? toPublicUser(user) : null;
}
