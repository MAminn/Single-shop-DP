import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#root/components/ui/dialog";
import { Input } from "#root/components/ui/input.jsx";
import { Tabs, TabsList, TabsTrigger } from "#root/components/ui/tabs";
import { Label } from "#root/components/ui/label";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isOutOfStock: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Blue T-Shirt",
      price: 19.99,
      stock: 50,
      isOutOfStock: false,
    },
    {
      id: 2,
      name: "Black Jeans",
      price: 49.99,
      stock: 25,
      isOutOfStock: false,
    },
    {
      id: 3,
      name: "Red Sneakers",
      price: 79.99,
      stock: 10,
      isOutOfStock: false,
    },
  ]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    isOutOfStock: false,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
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

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0 || newProduct.stock <= 0)
      return;

    const productToAdd = {
      ...newProduct,
      id: Date.now(),
      imageUrl: imagePreview || undefined,
      isOutOfStock: newProduct.stock === 0,
    };

    setProducts([...products, productToAdd]);
    setNewProduct({ id: 0, name: "", price: 0, stock: 0, isOutOfStock: false });
    setSelectedImage(null);
    setImagePreview(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;

    const updatedProduct = {
      ...selectedProduct,
      imageUrl: imagePreview || selectedProduct.imageUrl,
      isOutOfStock: selectedProduct.stock === 0,
    };

    setProducts(
      products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
    );
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditModalOpen(false);
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "stock") return a.stock - b.stock;
      return 0;
    });

  return (
    <Card className="p-6 w-full h-full mx-auto flex-1">
      <CardHeader className="flex justify-between items-center">
        <div className="flex flex-col justify-center items-center lg:items-start lg:justify-start gap-2">
          <CardTitle>Products</CardTitle>
          <CardDescription className="text-center lg:text-left">
            Manage your product inventory.
          </CardDescription>
        </div>
        <div className="flex gap-4 flex-wrap justify-center lg:justify-start items-center">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40"
          />
          <Tabs value={sortBy} onValueChange={setSortBy}>
            <TabsList>
              <TabsTrigger value="name">Name</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Product</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="w-full text-sm mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock} in stock</TableCell>
                <TableCell>
                  {product.isOutOfStock ? (
                    <span className="text-red-500">Out of Stock</span>
                  ) : (
                    <span className="text-green-500">In Stock</span>
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={selectedProduct?.name || ""}
                onChange={(e) =>
                  setSelectedProduct(
                    selectedProduct
                      ? { ...selectedProduct, name: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={selectedProduct?.price || 0}
                onChange={(e) =>
                  setSelectedProduct(
                    selectedProduct
                      ? {
                          ...selectedProduct,
                          price: Number.parseFloat(e.target.value),
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                value={selectedProduct?.stock || 0}
                onChange={(e) =>
                  setSelectedProduct(
                    selectedProduct
                      ? {
                          ...selectedProduct,
                          stock: Number.parseInt(e.target.value, 10),
                          isOutOfStock:
                            Number.parseInt(e.target.value, 10) === 0,
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Product Image</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("edit-image")?.click()}
                >
                  Upload
                </Button>
              </div>
              {(imagePreview || selectedProduct?.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || selectedProduct?.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-out-of-stock">Mark as Out of Stock</Label>
              <input
                type="checkbox"
                id="edit-out-of-stock"
                checked={selectedProduct?.isOutOfStock || false}
                onChange={(e) =>
                  setSelectedProduct(
                    selectedProduct
                      ? {
                          ...selectedProduct,
                          isOutOfStock: e.target.checked,
                          stock: e.target.checked
                            ? 0
                            : selectedProduct.stock || 1,
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleEditProduct}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-price">Price</Label>
              <Input
                id="add-price"
                type="number"
                step="0.01"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: Number.parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-stock">Stock</Label>
              <Input
                id="add-stock"
                type="number"
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: Number.parseInt(e.target.value, 10),
                    isOutOfStock: Number.parseInt(e.target.value, 10) === 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-image">Product Image</Label>
              <div className="flex gap-2">
                <Input
                  id="add-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("add-image")?.click()}
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
            <div className="space-y-2">
              <Label htmlFor="add-out-of-stock">Mark as Out of Stock</Label>
              <input
                type="checkbox"
                id="add-out-of-stock"
                checked={newProduct.isOutOfStock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    isOutOfStock: e.target.checked,
                    stock: e.target.checked ? 0 : newProduct.stock || 1,
                  })
                }
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddProduct}>Add Product</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
