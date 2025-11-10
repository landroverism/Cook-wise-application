import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

export function AIRecipePage() {
  const [ingredients, setIngredients] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [cuisinePreference, setCuisinePreference] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);

  const generateRecipe = useAction(api.ai.generateRecipe);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ingredients.trim()) {
      toast.error("Please enter some ingredients");
      return;
    }

    const ingredientList = ingredients
      .split(",")
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    if (ingredientList.length === 0) {
      toast.error("Please enter valid ingredients");
      return;
    }

    setIsGenerating(true);
    try {
      const recipe = await generateRecipe({
        ingredients: ingredientList,
        dietaryRestrictions: dietaryRestrictions || undefined,
        cuisinePreference: cuisinePreference || undefined,
        difficulty: difficulty || undefined,
      });
      
      setGeneratedRecipe(recipe);
      toast.success("Recipe generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate recipe");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedRecipe(null);
    setIngredients("");
    setDietaryRestrictions("");
    setCuisinePreference("");
    setDifficulty("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🤖 AI Recipe Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tell us what ingredients you have, and our AI chef will create a personalized recipe just for you!
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {!generatedRecipe ? (
          /* Input Form */
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Ingredients */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  What ingredients do you have? *
                </label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Enter ingredients separated by commas (e.g., chicken, rice, onions, garlic, tomatoes)"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Separate multiple ingredients with commas
                </p>
              </div>

              {/* Optional Preferences */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <select
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                    <option value="dairy-free">Dairy-Free</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Preference
                  </label>
                  <select
                    value={cuisinePreference}
                    onChange={(e) => setCuisinePreference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">Any</option>
                    <option value="Italian">Italian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Asian">Asian</option>
                    <option value="American">American</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Indian">Indian</option>
                    <option value="French">French</option>
                    <option value="Thai">Thai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">Any</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isGenerating || !ingredients.trim()}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Generating Recipe...
                    </span>
                  ) : (
                    "🤖 Generate Recipe"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Generated Recipe Display */
          <div className="space-y-8">
            {/* Recipe Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">{generatedRecipe.title}</h2>
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  🤖 AI Generated
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 text-blue-100">
                {generatedRecipe.prepTime && (
                  <div className="flex items-center">
                    <span className="mr-2">⏱️</span>
                    Prep: {generatedRecipe.prepTime}m
                  </div>
                )}
                {generatedRecipe.cookTime && (
                  <div className="flex items-center">
                    <span className="mr-2">🔥</span>
                    Cook: {generatedRecipe.cookTime}m
                  </div>
                )}
                {generatedRecipe.servings && (
                  <div className="flex items-center">
                    <span className="mr-2">👥</span>
                    Serves: {generatedRecipe.servings}
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Ingredients */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  🛒 Ingredients
                </h3>
                <ul className="space-y-2">
                  {generatedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  👨‍🍳 Instructions
                </h3>
                <ol className="space-y-4">
                  {generatedRecipe.steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-4 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Nutrition Info */}
            {generatedRecipe.nutrition && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  📊 Nutritional Information (Estimated)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedRecipe.nutrition.calories && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {generatedRecipe.nutrition.calories}
                      </div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                  )}
                  {generatedRecipe.nutrition.protein && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedRecipe.nutrition.protein}
                      </div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                  )}
                  {generatedRecipe.nutrition.carbs && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {generatedRecipe.nutrition.carbs}
                      </div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                  )}
                  {generatedRecipe.nutrition.fat && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {generatedRecipe.nutrition.fat}
                      </div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create"
                state={{ aiRecipe: generatedRecipe }}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
              >
                💾 Save as My Recipe
              </Link>
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                🔄 Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
