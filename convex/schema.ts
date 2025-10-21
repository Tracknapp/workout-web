import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const User = {
  email: v.string(),
  clerkId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  profilePicture: v.optional(v.string()),
  gender: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable(User)
    .index("byClerkId", ["clerkId"])
    .index("byEmail", ["email"]),
});
