"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const generateRecipe = action({
  args: {
    ingredients: v.array(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    cuisinePreference: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Create hash for caching
    const ingredientsHash = args.ingredients.sort().join(",").toLowerCase();
    
    // Check cache first
    const cached: any = await ctx.runQuery(internal.aiCache.getCachedRecipe, {
      ingredientsHash,
    });
    
    if (cached) {
      // Update usage count
      await ctx.runMutation(internal.aiCache.updateCacheUsage, {
        cacheId: cached._id,
      });
      return cached.generatedRecipe;
    }

    // Generate new recipe using Groq
    const prompt = `Generate a detailed recipe using these ingredients: ${args.ingredients.join(", ")}.

Requirements:
- Use ONLY the provided ingredients (you can suggest common pantry items like salt, pepper, oil)
- Include prep time and cook time in minutes
- Provide 4-6 servings
- Include basic nutritional estimates
${args.dietaryRestrictions ? `- Follow these dietary restrictions: ${args.dietaryRestrictions}` : ""}
${args.cuisinePreference ? `- Style: ${args.cuisinePreference} cuisine` : ""}
${args.difficulty ? `- Difficulty level: ${args.difficulty}` : ""}

Format the response as JSON with this structure:
{
  "title": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "nutrition": {
    "calories": 350,
    "protein": "25g",
    "carbs": "40g",
    "fat": "12g"
  }
}`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a professional chef and recipe developer. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from Groq API");
      }

      // Parse the JSON response
      let recipe;
      try {
        recipe = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipe = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid JSON response from AI");
        }
      }

      // Validate recipe structure
      if (!recipe.title || !recipe.ingredients || !recipe.steps) {
        throw new Error("Invalid recipe structure from AI");
      }

      // Cache the result
      await ctx.runMutation(internal.aiCache.cacheRecipe, {
        ingredientsHash,
        ingredients: args.ingredients,
        generatedRecipe: recipe,
      });

      return recipe;
    } catch (error) {
      console.error("AI recipe generation error:", error);
      throw new Error("Failed to generate recipe. Please try again.");
    }
  },
});
