import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const getCachedRecipe = internalQuery({
  args: { ingredientsHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiRecipeCache")
      .withIndex("by_hash", (q) => q.eq("ingredientsHash", args.ingredientsHash))
      .unique();
  },
});

export const cacheRecipe = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiRecipeCache", {
      ingredientsHash: args.ingredientsHash,
      ingredients: args.ingredients,
      generatedRecipe: args.generatedRecipe,
      usageCount: 1,
    });
  },
});

export const updateCacheUsage = internalMutation({
  args: { cacheId: v.id("aiRecipeCache") },
  handler: async (ctx, args) => {
    const cache = await ctx.db.get(args.cacheId);
    if (cache) {
      await ctx.db.patch(args.cacheId, {
        usageCount: cache.usageCount + 1,
      });
    }
  },
});
