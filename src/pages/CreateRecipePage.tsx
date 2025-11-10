import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export function CreateRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const aiRecipe = location.state?.aiRecipe;

  const [title, setTitle] = useState(aiRecipe?.title || "");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState(
    aiRecipe?.ingredients?.join("\n") || ""
  );
  const [steps, setSteps] = useState(
    aiRecipe?.steps?.join("\n") || ""
  );
  const [cuisine, setCuisine] = useState("");
  const [tags, setTags] = useState("");
  const [prepTime, setPrepTime] = useState(aiRecipe?.prepTime || "");
  const [cookTime, setCookTime] = useState(aiRecipe?.cookTime || "");
  const [servings, setServings] = useState(aiRecipe?.servings || "");
  const [difficulty, setDifficulty] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createRecipe = useMutation(api.recipes.createRecipe);
  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !ingredients.trim() || !steps.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images
      const imageIds = [];
      for (const image of images) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        
        if (!result.ok) {
          throw new Error("Failed to upload image");
        }
        
        const { storageId } = await result.json();
        imageIds.push(storageId);
      }

      // Create recipe
      const recipeId = await createRecipe({
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients: ingredients.split('\n').map(ing => ing.trim()).filter(ing => ing),
        steps: steps.split('\n').map(step => step.trim()).filter(step => step),
        cuisine: cuisine || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        difficulty: difficulty || undefined,
        images: imageIds,
        isAiGenerated: !!aiRecipe,
      });

      toast.success("Recipe created successfully!");
      navigate(`/recipe/${recipeId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {aiRecipe ? "Save AI Recipe" : "Share Your Recipe"}
          </h1>
          <p className="text-gray-600">
            {aiRecipe 
              ? "Review and customize your AI-generated recipe before saving"
              : "Share your culinary creation with the Cookwise community"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy recipe title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your recipe, its origin, or what makes it special"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="">Select cuisine</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Asian">Asian</option>
                  <option value="American">American</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Indian">Indian</option>
                  <option value="French">French</option>
                  <option value="Thai">Thai</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="15"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="30"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="healthy, quick, vegetarian (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients *
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Enter each ingredient on a new line&#10;2 cups flour&#10;1 tsp salt&#10;3 eggs"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter each ingredient on a separate line
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions *
              </label>
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="Enter each step on a new line&#10;Preheat oven to 350°F&#10;Mix dry ingredients in a bowl&#10;Add wet ingredients and stir"
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter each step on a separate line
              </p>
            </div>

            {/* Images */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  📷 Upload Photos
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Upload up to 5 photos (max 5MB each)
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Recipe...
                  </span>
                ) : (
                  "🍳 Share Recipe"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
