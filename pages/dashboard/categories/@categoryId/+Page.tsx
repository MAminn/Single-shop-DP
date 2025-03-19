import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input.jsx";
import { Label } from "#root/components/ui/label";
import { Link } from "#root/components/Link.jsx";

import { mockCategories, updateCategory } from "../store";
import type { Category } from "../store";

export default function EditCategory() {
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categoryId = window.location.pathname.split("/").pop() || "";

  useEffect(() => {
    const foundCategory = mockCategories.find((c) => c.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      setSubcategories(foundCategory.subcategories.join(", "));
    }
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const updatedCategoryData = {
        ...category,
        subcategories: subcategories.split(", ").filter(Boolean),
      };

      updateCategory(updatedCategoryData);

      console.log("Category updated:", updatedCategoryData);

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        window.location.href = "/dashboard/categories";
      }, 1000);
    }, 500);
  };

  if (!category) {
    return <div className="p-6">Loading category...</div>;
  }

  return (
    <Card className="max-w-md mx-auto p-6">
      <CardHeader>
        <CardTitle>Edit Category - {category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="bg-green-100 p-4 rounded text-green-800 text-center">
            Category updated successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subcategories">
                Subcategories (comma separated)
              </Label>
              <Input
                id="subcategories"
                value={subcategories}
                onChange={(e) => setSubcategories(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" asChild>
                <Link href="/dashboard/categories">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || !subcategories}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
