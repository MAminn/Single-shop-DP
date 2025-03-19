import { useState, useEffect } from "react";
import { Link } from "#root/components/Link.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import { Button } from "#root/components/ui/button";

import { mockCategories, deleteCategory } from "./store";
import type { Category } from "./store";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories([...mockCategories]);
  }, []);

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));

    deleteCategory(id);
  };

  return (
    <Card className="p-6 w-full mx-auto flex-1">
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage your product categories</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/create">Add Category</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Add your first category to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.subcategories.join(", ")}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/categories/${category.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
