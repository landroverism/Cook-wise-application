import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RecipeCard } from "../components/RecipeCard";
import { Link } from "react-router-dom";
import { useState } from "react";

export function HomePage() {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  
  const recipes = useQuery(api.recipes.listRecipes, {
    paginationOpts: { numItems: 12, cursor: null },
    cuisine: selectedCuisine || undefined,
  });

  const cuisines = [
    "Italian", "Mexican", "Asian", "American", "Mediterranean", 
    "Indian", "French", "Thai", "Japanese", "Chinese"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Cookwise
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8">
            Discover amazing recipes, share your culinary creations, and get AI-powered cooking suggestions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Share a Recipe
            </Link>
            <Link
              to="/ai-recipe"
              className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Try AI Chef
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Recipe Generator</h3>
          <p className="text-gray-600">
            Input your ingredients and let our AI create personalized recipes just for you.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
          <p className="text-gray-600">
            Share recipes, rate dishes, and connect with fellow food enthusiasts.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
          <p className="text-gray-600">
            Find recipes by ingredients, cuisine, dietary needs, or cooking time.
          </p>
        </div>
      </div>

      {/* Recipe Filters */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Recipes</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCuisine("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCuisine
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Cuisines
          </button>
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCuisine === cuisine
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      {recipes === undefined ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.page.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            {selectedCuisine 
              ? `No ${selectedCuisine} recipes available yet.`
              : "Be the first to share a recipe with the community!"
            }
          </p>
          <Link
            to="/create"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Share Your Recipe
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.page.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* Load More */}
      {recipes && !recipes.isDone && (
        <div className="text-center mt-12">
          <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Load More Recipes
          </button>
        </div>
      )}
    </div>
  );
}
