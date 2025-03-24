import { useState, useEffect } from "react";
import { Link } from "#root/components/Link.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { PlusCircle, Settings, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#root/components/ui/dialog";
import { Input } from "#root/components/ui/input.jsx";
import { Label } from "#root/components/ui/label";

import { mockCategories, addCategory, deleteCategory } from "./store";
import type { Category } from "./store";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  useEffect(() => {
    setCategories([...mockCategories]);
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: newCategoryName.trim(),
      subcategories: [],
    };

    addCategory(newCategory);
    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setIsAddDialogOpen(false);
  };

  const handleDeleteCategory = (category: Category) => {
    deleteCategory(category.id);
    setCategories(categories.filter((c) => c.id !== category.id));
    setCategoryToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 w-full h-full mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-col gap-2 items-center lg:items-start">
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-slate-500">Manage your product categories</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="relative group">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{category.name}</CardTitle>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/categories/${category.id}`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(category)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {category.subcategories.length} subcategories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {category.imageUrl && (
                <div className="mb-4">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <ul className="space-y-1">
                {category.subcategories.slice(0, 3).map((subcategory) => (
                  <li key={subcategory.id} className="text-sm">
                    {subcategory.name} ({subcategory.products.length} products)
                  </li>
                ))}
                {category.subcategories.length > 3 && (
                  <li className="text-sm text-slate-500">
                    +{category.subcategories.length - 3} more...
                  </li>
                )}
                {category.subcategories.length === 0 && (
                  <li className="text-sm text-slate-500 italic">
                    No subcategories yet
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/categories/${category.id}`}>
                  Manage Subcategories
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-slate-50">
            <p className="text-slate-500 mb-4">No categories found</p>
            <Button asChild>
              <Link href="/dashboard/categories/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Category
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Men, Women, Kids, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This will also delete all subcategories
              and remove product associations.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                categoryToDelete && handleDeleteCategory(categoryToDelete)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
