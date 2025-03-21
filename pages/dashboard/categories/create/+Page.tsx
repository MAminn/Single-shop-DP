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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategories) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newCategory = {
        id: String(Date.now()),
        name: category,
        subcategories: subcategories
          .split(", ")
          .filter(Boolean)
          .map((name) => ({
            id: String(Date.now()) + Math.random(),
            name,
            products: [],
          })),
      };

      addCategory(newCategory);

      console.log("Category created:", newCategory);

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
    <Card className="max-w-md mx-auto p-6">
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
