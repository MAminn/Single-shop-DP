import { useState, useEffect } from "react";
import { Link } from "#root/components/Link.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input.jsx";
import { Label } from "#root/components/ui/label";
import { PlusCircle, ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#root/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";

import {
  findCategory,
  updateCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../store";
import type { Category, Subcategory } from "../store";
import { usePageContext } from "vike-react/usePageContext";

export default function CategoryDetail() {
  const [category, setCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const pageContext = usePageContext();
  const { urlPathname } = pageContext;

  const categoryId = urlPathname.split("/").pop() || "";

  useEffect(() => {
    setIsLoading(true);
    const foundCategory = findCategory(categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      setEditedCategoryName(foundCategory.name);
    }
    setIsLoading(false);
  }, [categoryId]);

  const handleEditCategory = () => {
    if (!category || !editedCategoryName.trim()) return;

    const updatedCategory = {
      ...category,
      name: editedCategoryName.trim(),
    };

    updateCategory(updatedCategory);
    setCategory(updatedCategory);
    setIsEditCategoryDialogOpen(false);
  };

  const handleAddSubcategory = () => {
    if (!category || !newSubcategoryName.trim()) return;

    const newSubcategory: Subcategory = {
      id: `${category.id}-${newSubcategoryName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`,
      name: newSubcategoryName.trim(),
      products: [],
    };

    addSubcategory(category.id, newSubcategory);

    setCategory({
      ...category,
      subcategories: [...category.subcategories, newSubcategory],
    });

    setNewSubcategoryName("");
    setIsAddDialogOpen(false);
  };

  const handleEditSubcategory = () => {
    if (!category || !selectedSubcategory || !selectedSubcategory.name.trim())
      return;

    updateSubcategory(category.id, selectedSubcategory);

    setCategory({
      ...category,
      subcategories: category.subcategories.map((sub) =>
        sub.id === selectedSubcategory.id ? selectedSubcategory : sub
      ),
    });

    setSelectedSubcategory(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteSubcategory = () => {
    if (!category || !selectedSubcategory) return;

    deleteSubcategory(category.id, selectedSubcategory.id);

    setCategory({
      ...category,
      subcategories: category.subcategories.filter(
        (sub) => sub.id !== selectedSubcategory.id
      ),
    });

    setSelectedSubcategory(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (subcategory: Subcategory) => {
    setSelectedSubcategory({ ...subcategory });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!category) {
    return (
      <div className="p-6 w-full h-full flex-wrap mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild className="mr-2">
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
          <p className="text-slate-500 mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/dashboard/categories">Return to Categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full h-full flex-wrap mx-auto">
      <div className="flex flex-col lg:flex-row items-center mb-6 gap-2">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/dashboard/categories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditCategoryDialogOpen(true)}
            className="ml-2"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center lg:justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Subcategories</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subcategory
        </Button>
      </div>

      {category.subcategories.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-slate-500 mb-4">No subcategories found</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Subcategory
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.subcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell className="font-medium">
                      {subcategory.name}
                    </TableCell>
                    <TableCell>
                      {subcategory.products.length} product
                      {subcategory.products.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/dashboard/categories/${category.id}/${subcategory.id}`}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Products
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(subcategory)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(subcategory)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={isEditCategoryDialogOpen}
        onOpenChange={setIsEditCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={!editedCategoryName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Subcategory Name</Label>
              <Input
                id="subcategory-name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Shirts, Pants, Shoes, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSubcategory}
              disabled={!newSubcategoryName.trim()}
            >
              Add Subcategory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-name">Subcategory Name</Label>
              <Input
                id="edit-subcategory-name"
                value={selectedSubcategory?.name || ""}
                onChange={(e) =>
                  selectedSubcategory &&
                  setSelectedSubcategory({
                    ...selectedSubcategory,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubcategory}
              disabled={!selectedSubcategory?.name.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subcategory</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete "{selectedSubcategory?.name}"?
              This will also remove all product associations.
            </p>
            {selectedSubcategory && selectedSubcategory.products.length > 0 && (
              <p className="mt-2 text-orange-600">
                Warning: This subcategory has{" "}
                {selectedSubcategory.products.length} products associated with
                it.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubcategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
