import { MongoClient, Db } from "mongodb";
import { ENV } from './_core/env';

// Types derived from previous MySQL schema to maintain compatibility
export interface User {
  _id?: any;
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface InsertUser extends Partial<User> {
  openId: string;
}

export interface DiscordUser {
  _id?: any;
  discordId: string;
  username: string;
  discriminator: string;
  email?: string | null;
  avatar?: string | null;
  status: "pending" | "verified" | "failed";
  errorMessage?: string | null;
  verifiedAt?: Date | null;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertDiscordUser extends Partial<DiscordUser> {
  discordId: string;
}

let _client: MongoClient | null = null;

export async function getDb(): Promise<Db | null> {
  const dbUrl = ENV.databaseUrl;
  if (!_client && dbUrl) {
    try {
      _client = new MongoClient(dbUrl);
      await _client.connect();
    } catch (error) {
      console.warn("[Database] Failed to connect to MongoDB:", error);
      _client = null;
    }
  }
  return _client ? _client.db() : null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateSet: any = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach(field => {
      if (user[field] !== undefined) {
        updateSet[field] = user[field] ?? null;
      }
    });

    if (user.lastSignedIn !== undefined) {
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      updateSet.role = 'admin';
    }

    if (!updateSet.lastSignedIn) {
      updateSet.lastSignedIn = new Date();
    }

    await db.collection("users").updateOne(
      { openId: user.openId },
      {
        $set: updateSet,
        $setOnInsert: { createdAt: new Date(), updatedAt: new Date() }
      },
      { upsert: true }
    );

    // Always update updatedAt on update
    await db.collection("users").updateOne(
      { openId: user.openId },
      { $set: { updatedAt: new Date() } }
    );

  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.collection("users").findOne({ openId });
  return result as User | null || undefined;
}

export async function upsertDiscordUser(data: InsertDiscordUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert Discord user: database not available");
    return;
  }

  try {
    const updateSet = {
      username: data.username,
      discriminator: data.discriminator,
      email: data.email,
      avatar: data.avatar,
      status: data.status,
      errorMessage: data.errorMessage,
      verifiedAt: data.verifiedAt,
      userId: data.userId,
      updatedAt: new Date(),
    };

    await db.collection("discordUsers").updateOne(
      { discordId: data.discordId },
      {
        $set: updateSet,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("[Database] Failed to upsert Discord user:", error);
    throw error;
  }
}

export async function getDiscordUserByDiscordId(discordId: string): Promise<DiscordUser | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get Discord user: database not available");
    return undefined;
  }

  try {
    const result = await db.collection("discordUsers").findOne({ discordId });
    return result as DiscordUser | null || undefined;
  } catch (error) {
    console.error("[Database] Failed to get Discord user:", error);
    throw error;
  }
}

export async function getVerifiedDiscordUsers(): Promise<DiscordUser[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get verified Discord users: database not available");
    return [];
  }

  try {
    const result = await db
      .collection("discordUsers")
      .find({ status: "verified" })
      .sort({ verifiedAt: -1 })
      .toArray();
    return result as DiscordUser[];
  } catch (error) {
    console.error("[Database] Failed to get verified Discord users:", error);
    throw error;
  }
}
