import { useState, useEffect } from "react";
import { Link } from "#root/components/utils/Link";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "#root/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Label } from "#root/components/ui/label";

import {
  findCategory,
  findSubcategory,
  addProductToSubcategory,
  removeProductFromSubcategory,
} from "../../store";
import type { Category, Subcategory } from "../../store";
import { usePageContext } from "vike-react/usePageContext";
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const mockProducts: Product[] = [
  { id: 1, name: "Blue T-Shirt", price: 19.99, stock: 50 },
  { id: 2, name: "Black Jeans", price: 49.99, stock: 25 },
  { id: 3, name: "Red Sneakers", price: 79.99, stock: 10 },
  { id: 4, name: "White Socks", price: 9.99, stock: 100 },
  { id: 5, name: "Navy Hoodie", price: 39.99, stock: 15 },
];

export default function SubcategoryProducts() {
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [productToRemove, setProductToRemove] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const pathParts = urlPathname.split("/");
  const categoryId = pathParts[pathParts.length - 2] || "";
  const subcategoryId = pathParts[pathParts.length - 1] || "";

  useEffect(() => {
    setIsLoading(true);
    const foundCategory = findCategory(categoryId);

    if (foundCategory) {
      setCategory(foundCategory);

      const foundSubcategory = findSubcategory(categoryId, subcategoryId);
      if (foundSubcategory) {
        setSubcategory(foundSubcategory);

        const subcategoryProducts = mockProducts.filter((p) =>
          foundSubcategory.products.includes(p.id)
        );
        setProducts(subcategoryProducts);
      }
    }

    setIsLoading(false);
  }, [categoryId, subcategoryId]);

  const handleAddProduct = () => {
    if (!selectedProductId || !category || !subcategory) return;

    addProductToSubcategory(category.id, subcategory.id, selectedProductId);

    const productToAdd = mockProducts.find((p) => p.id === selectedProductId);
    if (productToAdd && !products.some((p) => p.id === selectedProductId)) {
      setProducts([...products, productToAdd]);

      setSubcategory({
        ...subcategory,
        products: [...subcategory.products, selectedProductId],
      });
    }

    setSelectedProductId(null);
    setIsAddDialogOpen(false);
  };

  const handleRemoveProduct = () => {
    if (!productToRemove || !category || !subcategory) return;

    removeProductFromSubcategory(
      category.id,
      subcategory.id,
      productToRemove.id
    );

    setProducts(products.filter((p) => p.id !== productToRemove.id));

    setSubcategory({
      ...subcategory,
      products: subcategory.products.filter((id) => id !== productToRemove.id),
    });

    setProductToRemove(null);
    setIsRemoveDialogOpen(false);
  };

  const availableProducts = mockProducts.filter(
    (p) => !subcategory?.products.includes(p.id)
  );

  if (isLoading) {
    return <div className='p-6'>Loading...</div>;
  }

  if (!category || !subcategory) {
    return (
      <div className='p-6'>
        <div className='flex items-center mb-6'>
          <Button variant='ghost' asChild className='mr-2'>
            <Link href='/dashboard/categories'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Categories
            </Link>
          </Button>
        </div>
        <div className='text-center py-12'>
          <h2 className='text-2xl font-bold mb-2'>Not Found</h2>
          <p className='text-slate-500 mb-6'>
            The category or subcategory you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href='/dashboard/categories'>Return to Categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 w-full h-full flex-wrap mx-auto'>
      <div className='flex flex-col  mb-6 gap-2 flex-wrap'>
        <div className='flex  gap-2'>
          <Button variant='ghost' asChild className='mr-4'>
            <Link href={`/dashboard/categories/${category.id}`}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to {category.name}
            </Link>
          </Button>
          <h1 className='text-2xl font-bold text-center '>
            {subcategory.name}
          </h1>
        </div>
        <div>
          <p className='text-slate-500'>
            Manage products in {category.name} &gt; {subcategory.name}
          </p>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row justify-center lg:justify-between items-center mb-4 flex-wrap gap-2'>
        <h2 className='text-xl font-semibold'>Products</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          disabled={availableProducts.length === 0}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className='text-center py-12'>
          <CardContent>
            <p className='text-slate-500 mb-4'>
              No products in this subcategory
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              disabled={availableProducts.length === 0}>
              <PlusCircle className='mr-2 h-4 w-4' />
              Add Product
            </Button>
            {availableProducts.length === 0 && (
              <p className='text-sm text-slate-500 mt-4'>
                No available products to add. Create products first.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='pt-6'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className='font-medium'>
                      {product.name}
                    </TableCell>
                    <TableCell>{product.price.toFixed(2)} EGP</TableCell>
                    <TableCell>{product.stock} in stock</TableCell>
                    <TableCell className='flex justify-end space-x-2'>
                      <Button size='sm' variant='outline' asChild>
                        <Link href={`/dashboard/products?edit=${product.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => {
                          setProductToRemove(product);
                          setIsRemoveDialogOpen(true);
                        }}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to {subcategory.name}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {availableProducts.length === 0 ? (
              <p className='text-center text-slate-500'>
                No available products to add. Create products first.
              </p>
            ) : (
              <div className='space-y-2'>
                <Label htmlFor='product'>Select Product</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedProductId(Number(value))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a product' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}>
                        {product.name} ({product.price.toFixed(2)} EGP)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={!selectedProductId || availableProducts.length === 0}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Product</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <p>
              Are you sure you want to remove "{productToRemove?.name}" from
              this subcategory?
            </p>
            <p className='text-sm text-slate-500 mt-2'>
              The product will still exist but won't be associated with this
              subcategory.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleRemoveProduct}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
