import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "#root/components/ui/card.jsx";
import { ArrowUpRight, Store } from "lucide-react";
import { Link } from "#root/components/Link.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import { Badge } from "#root/components/ui/badge";

interface Vendor {
  id: string;
  name: string;
  createdAt: Date;
  status: string;
}

interface RecentVendorsCardProps {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
}

export const RecentVendorsCard = ({
  vendors,
  isLoading,
  error,
}: RecentVendorsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Store className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg font-medium">
              Recent Vendors
            </CardTitle>
          </div>
          <CardDescription>
            Loading recent vendor registrations...
          </CardDescription>
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
            <Store className="h-5 w-5 text-red-500 mr-2" />
            <CardTitle className="text-lg font-medium">
              Recent Vendors
            </CardTitle>
          </div>
          <CardDescription className="text-red-500">
            Failed to load vendors
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

  if (vendors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Store className="h-5 w-5 text-muted-foreground mr-2" />
            <CardTitle className="text-lg font-medium">
              Recent Vendors
            </CardTitle>
          </div>
          <CardDescription>Latest vendor registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">No vendors registered yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper to format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Helper to format date
  const formatDate = (dateInput: Date) => {
    if (!(dateInput instanceof Date)) {
      try {
        const parsedDate = new Date(dateInput);
        return parsedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch (e) {
        return "Invalid date";
      }
    }
    return dateInput.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Store className="h-5 w-5 text-muted-foreground mr-2" />
          <CardTitle className="text-lg font-medium">Recent Vendors</CardTitle>
        </div>
        <CardDescription>Latest vendor registrations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                <TableCell>{getStatusBadge(vendor.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Link
          href="/dashboard/vendors"
          className="flex items-center text-blue-600 text-sm"
        >
          View all vendors
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};
