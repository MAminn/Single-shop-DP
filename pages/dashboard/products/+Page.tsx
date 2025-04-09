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
import { ProductForm } from "./components";
import type { FileMetadata } from "./components";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { usePageContext } from "vike-react/usePageContext";
import { useDebounce } from "use-debounce";
import { z } from "zod";

// Define product form schema type to match server expectations
type ProductFormSchema = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageId: string;
  productImages?: FileMetadata[];
  categoryId: string;
  categoryIds: string[];
  vendorId: string;
  variants?: { name: string; values: string[] }[];
};

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isOutOfStock: boolean;
}

// Type definition for product image from API
interface ProductImageResponse {
  productId: string;
  fileId: string;
  isPrimary: boolean;
  diskname: string;
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
  const [productImages, setProductImages] = useState<FileMetadata[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    isOutOfStock: false,
  });
  const [search, setSearch] = useState("");
  const [searchQueryValue] = useDebounce(search, 1000);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [selectedProductCategories, setSelectedProductCategories] = useState<
    string[]
  >([]);

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
        limit: 100,
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

  // Fetch product images when a product is selected for editing
  useEffect(() => {
    if (selectedProduct && isEditModalOpen) {
      setIsLoadingImages(true);

      // Load categories for this product
      trpc.product.getCategories
        .query({ productId: selectedProduct })
        .then((categoryResult) => {
          if (categoryResult.success) {
            // Store category IDs in the selectedProductCategories state
            const categoryIds = categoryResult.result.map((c) => c.id);
            setSelectedProductCategories(categoryIds);
          }
        })
        .catch((err) => {
          console.error("Error fetching product categories:", err);
        });

      // Fetch all product images for this product
      trpc.product.getProductImages
        .query({ productId: selectedProduct })
        .then((result) => {
          if (result.success && result.result.length > 0) {
            // Transform the images into the format needed by the form
            const images = result.result.map((img: ProductImageResponse) => ({
              id: img.fileId,
              url: `/uploads/${img.diskname}`,
              diskname: img.diskname,
              isPrimary: img.isPrimary,
            }));

            // Debug log
            console.log("Loaded product images:", images);

            setProductImages(images);
          } else {
            console.log("No product images found or failed to load:", result);
            // Fallback to just the main image
            if (selectedProductData?.file) {
              setProductImages([
                {
                  id: selectedProductData.file.id,
                  url: `/uploads/${selectedProductData.file.diskname}`,
                  diskname: selectedProductData.file.diskname,
                  isPrimary: true,
                },
              ]);
            } else {
              setProductImages([]);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching product images:", err);
          // Fallback to just the main image
          if (selectedProductData?.file) {
            setProductImages([
              {
                id: selectedProductData.file.id,
                url: `/uploads/${selectedProductData.file.diskname}`,
                diskname: selectedProductData.file.diskname,
                isPrimary: true,
              },
            ]);
          } else {
            setProductImages([]);
          }
        })
        .finally(() => {
          setIsLoadingImages(false);
        });
    } else {
      setProductImages([]);
      setSelectedProductCategories([]);
    }
  }, [selectedProduct, isEditModalOpen, selectedProductData]);

  const handleAddProduct = async (values: ProductFormSchema) => {
    // Ensure imageId is set - use first product image as imageId if not explicitly provided

    if (
      !values.imageId &&
      values.productImages &&
      values.productImages.length > 0
    ) {
      const primaryImage = values.productImages.find((img) => img.isPrimary);
      // Ensure we handle the case where productImages[0] might be undefined
      if (primaryImage?.id) {
        values.imageId = primaryImage.id;
      } else if (values.productImages[0]?.id) {
        values.imageId = values.productImages[0].id;
      }
    }

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

    // Ensure imageId is set - use first product image as imageId if not explicitly provided
    if (
      !values.imageId &&
      values.productImages &&
      values.productImages.length > 0
    ) {
      const primaryImage = values.productImages.find((img) => img.isPrimary);
      // Ensure we handle the case where productImages[0] might be undefined
      if (primaryImage?.id) {
        values.imageId = primaryImage.id;
      } else if (values.productImages[0]?.id) {
        values.imageId = values.productImages[0].id;
      }
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
          <Tabs
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "name" | "price" | "stock")
            }
          >
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
                <TableCell>{product.price} EGP</TableCell>
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
        <DialogContent className=" overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {isLoadingImages ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="ml-3">Loading product data...</p>
            </div>
          ) : (
            <ProductForm
              categories={categories}
              vendors={vendors}
              initialValues={
                selectedProductData
                  ? {
                      id: selectedProductData.product.id,
                      categoryId: selectedProductData.product.categoryId,
                      categoryIds: selectedProductCategories,
                      vendorId: selectedProductData.product.vendorId,
                      imageId: selectedProductData.product.imageId,
                      name: selectedProductData.product.name,
                      description: selectedProductData.product.description,
                      price: Number(selectedProductData.product.price),
                      stock: selectedProductData.product.stock,
                      // Use product images from state which includes all images
                      productImages: productImages,
                      // Add product variants if they exist
                      variants: selectedProductData.variants || [],
                    }
                  : undefined
              }
              onSuccess={() => {
                setIsEditModalOpen(false);
                setLastFetchDate(new Date());
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories}
            vendors={vendors}
            vendorId={fetchData.vendorId}
            initialValues={
              fetchData.vendorId
                ? {
                    vendorId: fetchData.vendorId,
                  }
                : undefined
            }
            onSuccess={() => {
              setIsAddModalOpen(false);
              setLastFetchDate(new Date());
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
