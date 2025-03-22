import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "#root/components/ui/card";
import { Badge } from "#root/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Package, Search, Filter, ChevronDown, Eye } from "lucide-react";

interface Order {
  id: number;
  date: string;
  customer: string;
  total: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: number;
  vendor?: string;
}

export default function Orders() {
  const [userRole, setUserRole] = useState<"admin" | "vendor">("vendor");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mockOrders: Order[] = [
    {
      id: 1001,
      date: "2023-10-01",
      customer: "John Doe",
      total: "$120.00",
      status: "Shipped",
      items: 3,
      vendor: "Fashion Store",
    },
    {
      id: 1002,
      date: "2023-10-05",
      customer: "Jane Smith",
      total: "$89.99",
      status: "Processing",
      items: 2,
      vendor: "Tech Gadgets",
    },
    {
      id: 1003,
      date: "2023-10-10",
      customer: "Robert Johnson",
      total: "$45.50",
      status: "Delivered",
      items: 1,
      vendor: "Fashion Store",
    },
    {
      id: 1004,
      date: "2023-10-15",
      customer: "Emily Wilson",
      total: "$210.75",
      status: "Pending",
      items: 4,
      vendor: "Home Decor",
    },
    {
      id: 1005,
      date: "2023-10-18",
      customer: "Michael Brown",
      total: "$65.25",
      status: "Cancelled",
      items: 2,
      vendor: "Tech Gadgets",
    },
  ];

  const filteredOrders = mockOrders
    .filter((order) => {
      if (userRole === "vendor") {
        return order.vendor === "Fashion Store";
      }
      return true;
    })
    .filter((order) => {
      if (statusFilter !== "all") {
        return order.status.toLowerCase() === statusFilter.toLowerCase();
      }
      return true;
    })
    .filter((order) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.id.toString().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.vendor?.toLowerCase().includes(query)
        );
      }
      return true;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleRole = () => {
    setUserRole(userRole === "admin" ? "vendor" : "admin");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            {userRole === "admin"
              ? "Manage all vendor orders across the platform"
              : "Track and manage your store's orders"}
          </p>
        </div>

        <Button variant="outline" onClick={toggleRole}>
          Switch to {userRole === "admin" ? "Vendor" : "Admin"} View
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row justify-between">
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "When you receive orders, they'll appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    {userRole === "admin" && <TableHead>Vendor</TableHead>}
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      {userRole === "admin" && (
                        <TableCell>{order.vendor}</TableCell>
                      )}
                      <TableCell>{order.items}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div>
              Showing {filteredOrders.length} of {filteredOrders.length} orders
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
