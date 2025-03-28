import { useEffect, useState } from "react";
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
import type { Data } from "./+data";
import { useData } from "vike-react/useData";
import { ErrorSection } from "#root/components/error-section";
import ProductForm, { type ProductFormSchema } from "./components";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { useDebounce } from "use-debounce";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isOutOfStock: boolean;
}

export default function Products() {
  const pageContext = usePageContext();
  const session = pageContext.clientSession;

  const initialData = useData<Data>();
  const [fetchData, setFetchData] = useState<Data>(initialData);
  const [lastFetchDate, setLastFetchDate] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    isOutOfStock: false,
  });
  const [search, setSearch] = useState("");
  const [searchQueryValue] = useDebounce(search, 1000);
  const [sortBy, setSortBy] = useState("name");
  if (!fetchData.success) {
    return <ErrorSection error={fetchData.error} />;
  }

  const productsData = fetchData.products;
  const selectedProductData = productsData.find(
    ({ product }) => product.id === selectedProduct
  );
  const categories = fetchData.categories;
  const vendors = fetchData.vendors;
  const vendorId = fetchData.vendorId;
  const categoryId = fetchData.categoryId;

  // biome-ignore lint/correctness/useExhaustiveDependencies:(lastFetchDate) <explanation>
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await trpc.product.view.query({
        search: searchQueryValue,
        sortBy,
        vendorId,
        categoryId,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      setFetchData({
        success: true,
        vendorId,
        categoryId,
        products: res.result,
        categories,
        vendors,
      });
    };

    fetchProducts();
  }, [searchQueryValue, sortBy, initialData, lastFetchDate, categoryId]);

  const handleAddProduct = async (values: ProductFormSchema) => {
    const res = await trpc.product.create.mutate(values);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    setLastFetchDate(new Date());
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    await trpc.product.delete.mutate({ id });

    setLastFetchDate(new Date());
  };

  const handleEditProduct = async (values: ProductFormSchema) => {
    if (!selectedProductData) return;

    if (!selectedProductData.product.id) {
      alert(
        "Selected product has no id, this is likely a bug, try refreshing the page."
      );
      return;
    }

    const res = await trpc.product.edit.mutate({
      id: selectedProductData.product.id,
      ...values,
    });

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    setLastFetchDate(new Date());

    setIsEditModalOpen(false);
  };

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
            {productsData.map(({ product, file: image }) => (
              <TableRow key={product.id}>
                <TableCell>
                  {image && (
                    <img
                      src={`/uploads/${image.diskname}`}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock} in stock</TableCell>
                <TableCell>
                  {product.stock === 0 ? (
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
                      setSelectedProduct(product.id);
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
        <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories}
            vendors={vendors}
            defaultValues={
              selectedProductData
                ? {
                    id: selectedProductData.product.id,
                    categoryId: selectedProductData.product.categoryId,
                    vendorId: selectedProductData.product.vendorId,
                    imageId: selectedProductData.product.imageId,
                    name: selectedProductData.product.name,
                    description: selectedProductData.product.description,
                    price: Number(selectedProductData.product.price),
                    stock: selectedProductData.product.stock,
                    variants: selectedProductData.variants,
                  }
                : undefined
            }
            onSubmit={handleEditProduct}
            vendorId={session?.role === "vendor" ? session.vendorId : undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories}
            vendors={vendors}
            onSubmit={handleAddProduct}
            vendorId={session?.role === "vendor" ? session.vendorId : undefined}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
