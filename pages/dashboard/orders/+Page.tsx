import { useEffect, useState, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#root/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#root/components/ui/alert-dialog";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { trpc } from "#root/shared/trpc/client";
import { useToast } from "#root/components/ui/use-toast";

interface OrderItem {
  id: string;
  productId: string;
  vendorId: string;
  quantity: number;
  price: string;
  name: string;
  vendorName?: string;
  discountPrice?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  subtotal: string;
  shipping: string;
  tax: string;
  discount: string | null;
  promoCodeId: string | null;
  total: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  items: OrderItem[];
}

export default function Orders() {
  const { clientSession } = usePageContext();
  const isAdmin = clientSession?.role === "admin";
  const isVendor = clientSession?.role === "vendor";
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: {
        status?:
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
      } = {};

      if (statusFilter !== "all") {
        params.status = statusFilter as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
      }

      const result = await trpc.order.view.query(params);

      if (result.success) {
        setOrders(
          result.result
            ? Array.isArray(result.result)
              ? result.result.map((order) => {
                  // Cast the API response to a partial Order type and add missing fields
                  const partialOrder = order as Partial<Order>;
                  return {
                    ...order,
                    discount: partialOrder.discount || null,
                    promoCodeId: partialOrder.promoCodeId || null,
                  } as Order;
                })
              : []
            : []
        );
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsUpdating(true);
    try {
      const result = await trpc.order.updateStatus.mutate({
        orderId,
        status: status as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled",
      });

      if (result.success) {
        toast({ title: "Order Status Updated" });
        fetchOrders();

        if (isDetailsOpen) {
          setIsDetailsOpen(false);
        }
      } else {
        setError(result.error || "Failed to update order status");
        toast({
          title: "Update Failed",
          description: result.error || "Could not update order status.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("An error occurred while updating order status");
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDeleteId) return;

    setIsUpdating(true);
    try {
      const result = await trpc.order.delete.mutate({
        orderId: orderToDeleteId,
      });
      if (result.success) {
        toast({
          title: "Order Deleted",
          description: `Order ${orderToDeleteId.substring(0, 8)}... was deleted.`,
        });
        fetchOrders();
        setOrderToDeleteId(null);
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Could not delete order.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
      });
      console.error("Delete order error:", err);
    } finally {
      setIsUpdating(false);
      setOrderToDeleteId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.items?.some(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.vendorName?.toLowerCase().includes(query)
        )
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <AlertDialog>
      <div className="p-6 space-y-6 w-full h-full">
        <div className="flex justify-center lg:justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-center lg:text-left">
              Orders
            </h1>
            <p className="text-muted-foreground text-center lg:text-left">
              {isAdmin
                ? "Manage all vendor orders across the platform"
                : "Track and manage your store's orders"}
            </p>
          </div>
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
            {isLoading ? (
              <div className="text-center py-10">
                <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
                <h3 className="mt-4 text-lg font-semibold">
                  Loading orders...
                </h3>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchOrders}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
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
                      {isAdmin && <TableHead>Vendors</TableHead>}
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            {Array.from(
                              new Set(
                                order.items?.map(
                                  (item) => item.vendorName || "Unknown"
                                ) || []
                              )
                            ).join(", ")}
                          </TableCell>
                        )}
                        <TableCell>{order.items?.length || 0}</TableCell>
                        <TableCell>
                          {Number.parseFloat(order.total).toFixed(2)} EGP
                          {order.discount &&
                            Number.parseFloat(order.discount) > 0 && (
                              <div className="text-xs text-green-600">
                                <span>
                                  -
                                  {Number.parseFloat(order.discount).toFixed(2)}{" "}
                                  EGP discount
                                </span>
                              </div>
                            )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(order.status)}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                            {isAdmin && (
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setOrderToDeleteId(order.id)}
                                  disabled={isUpdating}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Order</span>
                                </Button>
                              </AlertDialogTrigger>
                            )}
                          </div>
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
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </CardFooter>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>
                    Order ID: {selectedOrder.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2">
                      Customer Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedOrder.customerEmail || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm mb-2">
                      Shipping Address
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>{selectedOrder.shippingAddress}</p>
                      <p>
                        {selectedOrder.shippingCity}
                        {selectedOrder.shippingState
                          ? `, ${selectedOrder.shippingState}`
                          : ""}
                        {selectedOrder.shippingPostalCode
                          ? ` ${selectedOrder.shippingPostalCode}`
                          : ""}
                      </p>
                      <p>{selectedOrder.shippingCountry || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="my-4">
                  <h3 className="font-medium text-sm mb-2">Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        {isAdmin && <TableHead>Vendor</TableHead>}
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              {item.vendorName || "Unknown"}
                            </TableCell>
                          )}
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.discountPrice ? (
                              <>
                                <span className="line-through text-gray-500">
                                  {Number.parseFloat(item.price).toFixed(2)} EGP
                                </span>
                                <span className="text-red-600 block">
                                  {Number.parseFloat(
                                    item.discountPrice
                                  ).toFixed(2)}{" "}
                                  EGP
                                </span>
                              </>
                            ) : (
                              <>
                                {Number.parseFloat(item.price).toFixed(2)} EGP
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            {(
                              Number.parseFloat(
                                item.discountPrice || item.price
                              ) * item.quantity
                            ).toFixed(2)}{" "}
                            EGP
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell
                            colSpan={isAdmin ? 5 : 4}
                            className="text-center text-muted-foreground"
                          >
                            No items found for this order.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-start my-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2">Order Status</h3>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Badge>

                      {(isAdmin || isVendor) && (
                        <Select
                          disabled={isUpdating}
                          onValueChange={(value) =>
                            updateOrderStatus(selectedOrder.id, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <h3 className="font-medium text-sm mb-2">Order Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Subtotal:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.subtotal).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>

                      {selectedOrder.discount &&
                        Number.parseFloat(selectedOrder.discount) > 0 && (
                          <div className="flex justify-between">
                            <span className="font-medium text-green-600">
                              Discount:
                            </span>
                            <span className="text-green-600">
                              -
                              {Number.parseFloat(
                                selectedOrder.discount
                              ).toFixed(2)}{" "}
                              EGP
                            </span>
                          </div>
                        )}

                      <div className="flex justify-between">
                        <span className="font-medium">Shipping:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.shipping).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium">Tax:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.tax).toFixed(2)} EGP
                        </span>
                      </div>

                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.total).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="my-4 border-t pt-4">
                    <h3 className="font-medium text-sm mb-2">Order Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order
              <span className="font-mono font-semibold">
                {" "}
                {orderToDeleteId?.substring(0, 8)}...
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
