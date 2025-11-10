import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

export const createRecipe = mutation({
  args: {
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
    isAiGenerated: v.optional(v.boolean()),
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

    const recipeId = await ctx.db.insert("recipes", {
      ...args,
      authorId: userId,
      isApproved: profile.isAdmin || false, // Auto-approve for admins
      isPublic: true,
      averageRating: 0,
      ratingsCount: 0,
      favoritesCount: 0,
      commentsCount: 0,
      currentVersion: 1,
    });

    // Create initial version
    await ctx.db.insert("recipeVersions", {
      recipeId,
      version: 1,
      title: args.title,
      description: args.description,
      ingredients: args.ingredients,
      steps: args.steps,
      cuisine: args.cuisine,
      tags: args.tags,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      servings: args.servings,
      difficulty: args.difficulty,
      images: args.images,
      editedBy: userId,
      changeNote: "Initial version",
    });

    return recipeId;
  },
});

export const updateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    steps: v.optional(v.array(v.string())),
    cuisine: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    changeNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // Check permissions
    if (recipe.authorId !== userId && !profile?.isAdmin) {
      throw new Error("Not authorized to edit this recipe");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.ingredients !== undefined) updates.ingredients = args.ingredients;
    if (args.steps !== undefined) updates.steps = args.steps;
    if (args.cuisine !== undefined) updates.cuisine = args.cuisine;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.prepTime !== undefined) updates.prepTime = args.prepTime;
    if (args.cookTime !== undefined) updates.cookTime = args.cookTime;
    if (args.servings !== undefined) updates.servings = args.servings;
    if (args.difficulty !== undefined) updates.difficulty = args.difficulty;
    if (args.images !== undefined) updates.images = args.images;

    // Increment version
    const newVersion = recipe.currentVersion + 1;
    updates.currentVersion = newVersion;

    await ctx.db.patch(args.recipeId, updates);

    // Create new version record
    await ctx.db.insert("recipeVersions", {
      recipeId: args.recipeId,
      version: newVersion,
      title: args.title || recipe.title,
      description: args.description || recipe.description,
      ingredients: args.ingredients || recipe.ingredients,
      steps: args.steps || recipe.steps,
      cuisine: args.cuisine || recipe.cuisine,
      tags: args.tags || recipe.tags,
      prepTime: args.prepTime || recipe.prepTime,
      cookTime: args.cookTime || recipe.cookTime,
      servings: args.servings || recipe.servings,
      difficulty: args.difficulty || recipe.difficulty,
      images: args.images || recipe.images,
      editedBy: userId,
      changeNote: args.changeNote || "Recipe updated",
    });

    return args.recipeId;
  },
});

export const getRecipe = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      return null;
    }

    // Get author profile
    const authorProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", recipe.authorId))
      .unique();

    // Get image URLs
    const imageUrls = await Promise.all(
      recipe.images.map(async (imageId) => {
        const url = await ctx.storage.getUrl(imageId);
        return { id: imageId, url };
      })
    );

    return {
      ...recipe,
      author: authorProfile,
      imageUrls,
    };
  },
});

export const listRecipes = query({
  args: {
    paginationOpts: paginationOptsValidator,
    cuisine: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    authorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.authorId) {
      results = await ctx.db
        .query("recipes")
        .withIndex("by_author", (q) => q.eq("authorId", args.authorId!))
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db
        .query("recipes")
        .withIndex("by_approved", (q) => q.eq("isApproved", true))
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const recipesWithDetails = await Promise.all(
      results.page.map(async (recipe) => {
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", recipe.authorId))
          .unique();

        const imageUrls = await Promise.all(
          recipe.images.slice(0, 1).map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return { id: imageId, url };
          })
        );

        return {
          ...recipe,
          author: authorProfile,
          imageUrls,
        };
      })
    );

    return {
      ...results,
      page: recipesWithDetails,
    };
  },
});

export const searchRecipes = query({
  args: {
    searchTerm: v.string(),
    cuisine: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("recipes")
      .withSearchIndex("search_recipes", (q) => {
        let searchQuery = q.search("title", args.searchTerm);
        if (args.cuisine) {
          searchQuery = searchQuery.eq("cuisine", args.cuisine);
        }
        return searchQuery.eq("isApproved", true).eq("isPublic", true);
      });

    const results = await query.paginate(args.paginationOpts);

    const recipesWithDetails = await Promise.all(
      results.page.map(async (recipe) => {
        const authorProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", recipe.authorId))
          .unique();

        const imageUrls = await Promise.all(
          recipe.images.slice(0, 1).map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return { id: imageId, url };
          })
        );

        return {
          ...recipe,
          author: authorProfile,
          imageUrls,
        };
      })
    );

    return {
      ...results,
      page: recipesWithDetails,
    };
  },
});

export const toggleFavorite = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_recipe", (q) => 
        q.eq("userId", userId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (existing) {
      // Remove favorite
      await ctx.db.delete(existing._id);
      
      // Update count
      const recipe = await ctx.db.get(args.recipeId);
      if (recipe) {
        await ctx.db.patch(args.recipeId, {
          favoritesCount: Math.max(0, (recipe.favoritesCount || 0) - 1),
        });
      }
      
      return false;
    } else {
      // Add favorite
      await ctx.db.insert("favorites", {
        userId,
        recipeId: args.recipeId,
      });
      
      // Update count
      const recipe = await ctx.db.get(args.recipeId);
      if (recipe) {
        await ctx.db.patch(args.recipeId, {
          favoritesCount: (recipe.favoritesCount || 0) + 1,
        });
      }
      
      return true;
    }
  },
});

export const rateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_recipe", (q) => 
        q.eq("userId", userId).eq("recipeId", args.recipeId)
      )
      .unique();

    if (existing) {
      // Update existing rating
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        review: args.review,
      });
    } else {
      // Create new rating
      await ctx.db.insert("ratings", {
        userId,
        recipeId: args.recipeId,
        rating: args.rating,
        review: args.review,
      });
    }

    // Recalculate average rating
    const allRatings = await ctx.db
      .query("ratings")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    await ctx.db.patch(args.recipeId, {
      averageRating,
      ratingsCount: allRatings.length,
    });

    return averageRating;
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
