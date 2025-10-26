import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    return null;
  }

  return user._id;
}

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    gender: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      ...args,
    });

    return userId;
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return null;
    }

    return user;
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

export const updateUserPreferences = mutation({
  args: {
    gender: v.optional(v.string()),
    weightUnit: v.optional(v.union(v.literal("lbs"), v.literal("kgs"))),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const updates: {
      gender?: string;
      weightUnit?: "lbs" | "kgs";
    } = {};

    if (args.gender !== undefined) {
      updates.gender = args.gender;
    }
    if (args.weightUnit !== undefined) {
      updates.weightUnit = args.weightUnit;
    }

    await ctx.db.patch(userId, updates);

    return { success: true };
  },
});
