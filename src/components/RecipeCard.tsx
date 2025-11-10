import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

interface Recipe {
  _id: string;
  title: string;
  description?: string;
  cuisine?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  averageRating?: number;
  ratingsCount?: number;
  favoritesCount?: number;
  imageUrls: Array<{ id: string; url: string | null }>;
  author?: {
    username: string;
    avatarUrl?: string;
  };
  isAiGenerated?: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const toggleFavorite = useMutation(api.recipes.toggleFavorite);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await toggleFavorite({ recipeId: recipe._id as any });
      setIsFavorited(result);
      toast.success(result ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const imageUrl = recipe.imageUrls[0]?.url;

  return (
    <Link to={`/recipe/${recipe._id}`} className="group">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍽️
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
          >
            <span className={`text-lg ${isFavorited ? "text-red-500" : "text-gray-400"}`}>
              {isFavorited ? "❤️" : "🤍"}
            </span>
          </button>

          {/* AI Badge */}
          {recipe.isAiGenerated && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              🤖 AI
            </div>
          )}

          {/* Cuisine Badge */}
          {recipe.cuisine && (
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
              {recipe.cuisine}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
            {recipe.title}
          </h3>
          
          {recipe.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Recipe Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              {totalTime > 0 && (
                <span className="flex items-center">
                  ⏱️ {totalTime}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center">
                  👥 {recipe.servings}
                </span>
              )}
            </div>
            
            {recipe.averageRating && recipe.ratingsCount && recipe.ratingsCount > 0 && (
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">⭐</span>
                <span>{recipe.averageRating.toFixed(1)}</span>
                <span className="ml-1">({recipe.ratingsCount})</span>
              </div>
            )}
          </div>

          {/* Author */}
          {recipe.author && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-medium text-red-600">
                  {recipe.author.username[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-600">
                  by {recipe.author.username}
                </span>
              </div>
              
              {recipe.favoritesCount && recipe.favoritesCount > 0 && (
                <span className="text-sm text-gray-500 flex items-center">
                  ❤️ {recipe.favoritesCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
