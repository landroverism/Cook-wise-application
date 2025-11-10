import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProfile = mutation({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // Check if username is taken
    const existingUsername = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    return await ctx.db.insert("profiles", {
      userId,
      username: args.username,
      bio: args.bio,
      followersCount: 0,
      followingCount: 0,
      isAdmin: false,
    });
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Check username availability if changing
    if (args.username && args.username !== profile.username) {
      const existingUsername = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .unique();

      if (existingUsername) {
        throw new Error("Username already taken");
      }
    }

    const updates: any = {};
    if (args.username !== undefined) updates.username = args.username;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.avatar !== undefined) updates.avatar = args.avatar;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) {
      return null;
    }

    // Get avatar URL if exists
    let avatarUrl = null;
    if (profile.avatar) {
      avatarUrl = await ctx.storage.getUrl(profile.avatar);
    }

    return {
      ...profile,
      avatarUrl,
    };
  },
});

export const getProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!profile) {
      return null;
    }

    // Get avatar URL if exists
    let avatarUrl = null;
    if (profile.avatar) {
      avatarUrl = await ctx.storage.getUrl(profile.avatar);
    }

    // Get user data
    const user = await ctx.db.get(profile.userId);

    return {
      ...profile,
      avatarUrl,
      user,
    };
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
