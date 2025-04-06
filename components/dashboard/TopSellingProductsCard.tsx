import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "#root/components/ui/card.jsx";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Link } from "#root/components/Link.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";

interface TopSellingProduct {
  id: string;
  name: string;
  price: number;
  sold: number;
  revenue: number;
  vendorName?: string;
}

interface TopSellingProductsCardProps {
  products: TopSellingProduct[];
  isLoading: boolean;
  error: string | null;
  showVendor?: boolean;
}

export const TopSellingProductsCard = ({
  products,
  isLoading,
  error,
  showVendor = false,
}: TopSellingProductsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg font-medium">
              Top Selling Products
            </CardTitle>
          </div>
          <CardDescription>Loading top products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
            <CardTitle className="text-lg font-medium">
              Top Selling Products
            </CardTitle>
          </div>
          <CardDescription className="text-red-500">
            Failed to load top products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg font-medium">
              Top Selling Products
            </CardTitle>
          </div>
          <CardDescription>Products with highest sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">
              No product sales data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
          <CardTitle className="text-lg font-medium">
            Top Selling Products
          </CardTitle>
        </div>
        <CardDescription>Products with highest sales</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              {showVendor && <TableHead>Vendor</TableHead>}
              <TableHead>Price</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                {showVendor && (
                  <TableCell>{product.vendorName || "N/A"}</TableCell>
                )}
                <TableCell>{product.price.toFixed(2)} EGP</TableCell>
                <TableCell>{product.sold}</TableCell>
                <TableCell className="font-semibold">
                  {product.revenue.toFixed(2)} EGP
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Link
          href="/dashboard/products"
          className="flex items-center text-blue-600 text-sm"
        >
          View all products
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};
