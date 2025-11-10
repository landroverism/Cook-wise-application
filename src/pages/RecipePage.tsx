import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showRatingForm, setShowRatingForm] = useState(false);

  const recipe = useQuery(api.recipes.getRecipe, id ? { recipeId: id as any } : "skip");
  const toggleFavorite = useMutation(api.recipes.toggleFavorite);
  const rateRecipe = useMutation(api.recipes.rateRecipe);

  if (recipe === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h1>
        <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleFavorite = async () => {
    try {
      const result = await toggleFavorite({ recipeId: recipe._id as any });
      toast.success(result ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await rateRecipe({
        recipeId: recipe._id as any,
        rating,
        review: review.trim() || undefined,
      });
      toast.success("Rating submitted successfully!");
      setShowRatingForm(false);
      setRating(0);
      setReview("");
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {recipe.isAiGenerated && (
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  🤖 AI Generated
                </span>
              )}
              {recipe.cuisine && (
                <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                  {recipe.cuisine}
                </span>
              )}
            </div>
            <button
              onClick={handleFavorite}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">🤍</span>
              <span>Save</span>
            </button>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
          
          {recipe.description && (
            <p className="text-xl text-gray-600 mb-6">{recipe.description}</p>
          )}

          {/* Recipe Info */}
          <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
            {totalTime > 0 && (
              <div className="flex items-center">
                <span className="mr-2">⏱️</span>
                <span>Total: {totalTime} minutes</span>
              </div>
            )}
            {recipe.prepTime && (
              <div className="flex items-center">
                <span className="mr-2">🥄</span>
                <span>Prep: {recipe.prepTime}m</span>
              </div>
            )}
            {recipe.cookTime && (
              <div className="flex items-center">
                <span className="mr-2">🔥</span>
                <span>Cook: {recipe.cookTime}m</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                <span>Serves {recipe.servings}</span>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
            )}
          </div>

          {/* Rating and Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {recipe.averageRating && recipe.ratingsCount && recipe.ratingsCount > 0 && (
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl mr-2">⭐</span>
                  <span className="text-lg font-semibold">{recipe.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({recipe.ratingsCount} reviews)</span>
                </div>
              )}
              
              {recipe.author && (
                <Link
                  to={`/profile/${recipe.author.username}`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-medium text-red-600">
                    {recipe.author.username[0].toUpperCase()}
                  </div>
                  <span>by {recipe.author.username}</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setShowRatingForm(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              ⭐ Rate Recipe
            </button>
          </div>
        </div>

        {/* Images */}
        {recipe.imageUrls && recipe.imageUrls.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipe.imageUrls.map((image, index) => (
                image.url && (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={`${recipe.title} - Image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                )
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              🛒 Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">•</span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              👨‍🍳 Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4 mt-1 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rating Form Modal */}
        {showRatingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate this Recipe</h3>
              
              <form onSubmit={handleRating} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? "text-yellow-500" : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review (Optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your thoughts about this recipe..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Submit Rating
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatingForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
