import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { useState } from "react";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      {/* Top accent bar */}
      <div className="bg-blue-900 h-1"></div>
      
      {/* Main navbar */}
      <div className="bg-gradient-to-r from-red-700 to-red-600">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-15">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-red-100 transition-colors">
              <span className="text-2xl">🍳</span>
              <span className="text-xl font-bold">Cookwise</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`text-white hover:text-red-100 transition-colors font-medium ${
                  isActive("/") ? "border-b-2 border-white pb-1" : ""
                }`}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`text-white hover:text-red-100 transition-colors font-medium ${
                  isActive("/create") ? "border-b-2 border-white pb-1" : ""
                }`}
              >
                Create
              </Link>
              <Link
                to="/ai-recipe"
                className={`text-white hover:text-red-100 transition-colors font-medium ${
                  isActive("/ai-recipe") ? "border-b-2 border-white pb-1" : ""
                }`}
              >
                AI Chef
              </Link>
              
              {loggedInUser?.profile?.isAdmin && (
                <Link
                  to="/admin"
                  className={`text-white hover:text-red-100 transition-colors font-medium ${
                    isActive("/admin") ? "border-b-2 border-white pb-1" : ""
                  }`}
                >
                  Admin
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative group">
                <Link
                  to={`/profile/${loggedInUser?.profile?.username}`}
                  className="flex items-center space-x-2 text-white hover:text-red-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {loggedInUser?.profile?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block font-medium">
                    {loggedInUser?.profile?.username}
                  </span>
                </Link>
              </div>

              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                🔍
              </button>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}
