import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles extending auth
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    bio: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    isAdmin: v.optional(v.boolean()),
    followersCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  // Recipes with versioning support
  recipes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    cuisine: v.optional(v.string()),
    tags: v.array(v.string()),
    prepTime: v.optional(v.number()), // in minutes
    cookTime: v.optional(v.number()), // in minutes
    servings: v.optional(v.number()),
    difficulty: v.optional(v.string()), // "easy", "medium", "hard"
    images: v.array(v.id("_storage")),
    authorId: v.id("users"),
    isApproved: v.boolean(),
    isPublic: v.boolean(),
    averageRating: v.optional(v.number()),
    ratingsCount: v.optional(v.number()),
    favoritesCount: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
    currentVersion: v.number(),
    isAiGenerated: v.optional(v.boolean()),
  })
    .index("by_author", ["authorId"])
    .index("by_approved", ["isApproved"])
    .index("by_public", ["isPublic"])
    .index("by_cuisine", ["cuisine"])
    .index("by_rating", ["averageRating"])
    .searchIndex("search_recipes", {
      searchField: "title",
      filterFields: ["cuisine", "isApproved", "isPublic"],
    }),

  // Recipe versions for history tracking
  recipeVersions: defineTable({
    recipeId: v.id("recipes"),
    version: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    cuisine: v.optional(v.string()),
    tags: v.array(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    images: v.array(v.id("_storage")),
    editedBy: v.id("users"),
    changeNote: v.optional(v.string()),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_recipe_version", ["recipeId", "version"]),

  // User favorites
  favorites: defineTable({
    userId: v.id("users"),
    recipeId: v.id("recipes"),
  })
    .index("by_user", ["userId"])
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),

  // Recipe ratings
  ratings: defineTable({
    userId: v.id("users"),
    recipeId: v.id("recipes"),
    rating: v.number(), // 1-5
    review: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),

  // Comments with threading support
  comments: defineTable({
    recipeId: v.id("recipes"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")), // for threading
    isApproved: v.boolean(),
    repliesCount: v.optional(v.number()),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"])
    .index("by_recipe_approved", ["recipeId", "isApproved"]),

  // Follow system
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "comment", "rating", "follow", "recipe_approved"
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()), // recipe/comment/user ID
    actionUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),

  // AI recipe cache
  aiRecipeCache: defineTable({
    ingredientsHash: v.string(),
    ingredients: v.array(v.string()),
    generatedRecipe: v.object({
      title: v.string(),
      ingredients: v.array(v.string()),
      steps: v.array(v.string()),
      prepTime: v.optional(v.number()),
      cookTime: v.optional(v.number()),
      servings: v.optional(v.number()),
      nutrition: v.optional(v.object({
        calories: v.optional(v.number()),
        protein: v.optional(v.string()),
        carbs: v.optional(v.string()),
        fat: v.optional(v.string()),
      })),
    }),
    usageCount: v.number(),
  })
    .index("by_hash", ["ingredientsHash"]),

  // Content reports
  reports: defineTable({
    reporterId: v.id("users"),
    contentType: v.string(), // "recipe", "comment"
    contentId: v.string(),
    reason: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "pending", "reviewed", "resolved"
    reviewedBy: v.optional(v.id("users")),
    reviewNote: v.optional(v.string()),
  })
    .index("by_reporter", ["reporterId"])
    .index("by_content", ["contentType", "contentId"])
    .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
