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

You must respond with ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):
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

    // Check if API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not configured. Please set it in your Convex environment variables.\n" +
        "Run: npx convex env set GROQ_API_KEY your_api_key_here\n" +
        "Or see SETUP_GROQ.md for detailed instructions."
      );
    }

    // Use a reliable Groq model for recipe generation
    // Available models from Groq docs: 
    // - llama-3.1-8b-instant (fast, good for real-time)
    // - llama-3.3-70b-versatile (more capable, slightly slower)
    // - llama-4-scout-17b-16e-instruct (multimodal)
    // - openai/gpt-oss-20b (OpenAI compatible)
    const model = "llama-3.1-8b-instant"; // Fast, reliable model for recipe generation
    console.log(`Making Groq API request with model: ${model}, API key present: ${!!apiKey}`);

    try {
      // Prepare the request body
      // Note: response_format with json_object helps ensure structured JSON responses
      const requestBody = {
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a professional chef and recipe developer. You MUST respond with valid JSON only, no additional text or explanations. Return ONLY the JSON object, no markdown code blocks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000, // Increased to allow for detailed recipes
        response_format: { type: "json_object" } as const, // Force JSON response format
      };

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        console.error("Groq API error response:", errorData);
        const errorMsg = typeof errorData === 'object' && errorData.error 
          ? errorData.error.message || JSON.stringify(errorData.error)
          : String(errorData);
        throw new Error(`Groq API error (${response.status}): ${errorMsg}`);
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
      
      // Preserve the original error message for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error && error.stack ? error.stack : String(error);
      
      console.error("Full error details:", errorDetails);
      
      // Throw the actual error message instead of a generic one
      throw new Error(`Failed to generate recipe: ${errorMessage}`);
    }
  },
});
