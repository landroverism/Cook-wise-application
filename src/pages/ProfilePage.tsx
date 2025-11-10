import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RecipeCard } from "../components/RecipeCard";

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  
  const profile = useQuery(
    api.profiles.getProfileByUsername,
    username ? { username } : "skip"
  );
  
  const userRecipes = useQuery(
    api.recipes.listRecipes,
    profile?.userId
      ? {
          paginationOpts: { numItems: 12, cursor: null },
          authorId: profile.userId,
        }
      : "skip"
  );

  if (profile === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-48"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
        <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
              {profile.isAdmin && (
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}

            <div className="flex space-x-6 text-sm text-gray-500">
              <div>
                <span className="font-semibold text-gray-900">
                  {userRecipes?.page.length || 0}
                </span>{" "}
                recipes
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {profile.followersCount || 0}
                </span>{" "}
                followers
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {profile.followingCount || 0}
                </span>{" "}
                following
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Follow
            </button>
            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {profile.username}'s Recipes
          </h2>
          <div className="text-sm text-gray-500">
            {userRecipes?.page.length || 0} recipes
          </div>
        </div>

        {userRecipes === undefined ? (
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
        ) : userRecipes.page.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Yet</h3>
            <p className="text-gray-600">
              {profile.username} hasn't shared any recipes yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userRecipes.page.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
