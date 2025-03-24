import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input.jsx";
import { Label } from "#root/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Link } from "#root/components/Link.jsx";

import {
  mockCategories,
  addCategory,
} from "#root/pages/dashboard/categories/store";
import { usePageContext } from "vike-react/usePageContext";

export default function CreateCategory() {
  const [category, setCategory] = useState("Men");
  const [subcategories, setSubcategories] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategories) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newCategory = {
        id: String(Date.now()),
        name: category,
        imageUrl: imagePreview,
        subcategories: subcategories
          .split(", ")
          .filter(Boolean)
          .map((name) => ({
            id: String(Date.now()) + Math.random(),
            name,
            products: [],
          })),
      };

      const categoryToAdd = {
        ...newCategory,
        imageUrl: newCategory.imageUrl || undefined,
      };

      addCategory(categoryToAdd);

      console.log("Category created:", categoryToAdd);

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        const pageContext = usePageContext();
        const { urlPathname } = pageContext;
        window.location.href = urlPathname;
      }, 1000);
    }, 500);
  };

  return (
    <Card className="max-w-md mt-0 lg:mt-16 mx-auto p-6">
      <CardHeader>
        <CardTitle>Create Category</CardTitle>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="bg-green-100 p-4 rounded text-green-800 text-center">
            Category created successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category Name</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategories">
                Subcategories (comma separated)
              </Label>
              <Input
                id="subcategories"
                value={subcategories}
                onChange={(e) => setSubcategories(e.target.value)}
                placeholder="T-shirts, Pants, Shoes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  Upload
                </Button>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" asChild>
                <Link href="/dashboard/categories">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || !subcategories}>
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
