import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { RecipePage } from "./pages/RecipePage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SearchPage } from "./pages/SearchPage";
import { AIRecipePage } from "./pages/AIRecipePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProfileSetup } from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Content />
      </Router>
      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        {!loggedInUser?.profile ? (
          <ProfileSetup />
        ) : (
          <>
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/recipe/:id" element={<RecipePage />} />
                <Route path="/create" element={<CreateRecipePage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/ai-recipe" element={<AIRecipePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-red-700 to-red-600 text-white">
            <div className="bg-blue-900 h-2"></div>
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-3xl font-bold">🍳 Cookwise</h1>
                  <p className="text-red-100 hidden md:block">Share, Discover, Create Amazing Recipes</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Cookwise</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Join our vibrant cooking community to share recipes, discover new flavors, and get AI-powered cooking suggestions.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-8">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">🤖</span>
                    AI Recipe Generation
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">👥</span>
                    Community Sharing
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">⭐</span>
                    Recipe Ratings
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">🔍</span>
                    Smart Search
                  </div>
                </div>
              </div>
              <SignInForm />
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gray-100 py-6">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>&copy; 2024 Cookwise. Made with ❤️ for food lovers everywhere.</p>
            </div>
          </footer>
        </div>
      </Unauthenticated>
    </>
  );
}
