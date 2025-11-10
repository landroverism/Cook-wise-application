import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RecipeCard } from "../components/RecipeCard";
import { useSearchParams } from "react-router-dom";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCuisine, setSelectedCuisine] = useState("");

  const results = useQuery(
    api.recipes.searchRecipes,
    searchTerm.trim()
      ? {
          searchTerm: searchTerm.trim(),
          cuisine: selectedCuisine || undefined,
          paginationOpts: { numItems: 20, cursor: null },
        }
      : "skip"
  );

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const cuisines = [
    "Italian", "Mexican", "Asian", "American", "Mediterranean", 
    "Indian", "French", "Thai", "Japanese", "Chinese"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Recipes</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for recipes, ingredients, or cooking techniques..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              🔍 Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
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

      {/* Results */}
      {!searchTerm.trim() ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start Your Search</h2>
          <p className="text-gray-600">
            Enter a search term to find delicious recipes from our community
          </p>
        </div>
      ) : results === undefined ? (
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
      ) : results.page.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any recipes matching "{searchTerm}"
            {selectedCuisine && ` in ${selectedCuisine} cuisine`}.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Using different keywords</li>
              <li>Checking your spelling</li>
              <li>Removing cuisine filters</li>
              <li>Searching for ingredients instead of dish names</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Found {results.page.length} recipe{results.page.length !== 1 ? "s" : ""} for "{searchTerm}"
              {selectedCuisine && ` in ${selectedCuisine} cuisine`}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.page.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>

          {!results.isDone && (
            <div className="text-center mt-12">
              <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Load More Results
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
