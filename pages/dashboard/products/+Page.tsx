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
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Blue T-Shirt", price: 19.99, stock: 50 },
    { id: 2, name: "Black Jeans", price: 49.99, stock: 25 },
    { id: 3, name: "Red Sneakers", price: 79.99, stock: 10 },
  ]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.price <= 0 || newProduct.stock <= 0)
      return;
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setNewProduct({ id: 0, name: "", price: 0, stock: 0 });
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;
    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id ? { ...selectedProduct } : p
      )
    );
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
    <Card className="p-6 w-full mx-auto flex-1">
      <CardHeader className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your product inventory.</CardDescription>
        </div>
        <div className="flex gap-4 items-center">
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
              <TableHead>Product Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock} in stock</TableCell>
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
