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
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "#root/components/ui/sheet";
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
  X,
} from "lucide-react";
import { usePageContext } from "vike-react/usePageContext";
import { trpc } from "#root/shared/trpc/client";
import { useToast } from "#root/components/ui/use-toast";
import { Pagination } from "#root/components/utils/Pagination";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  name: string;
  discountPrice?: string | null;
  productImage?: string | null;
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

  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Reset to page 1 when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: {
        limit: number;
        offset: number;
        status?:
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
      } = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };

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
        const items = result.result?.items ?? [];
        setOrders(
          Array.isArray(items)
            ? items.map((order) => {
                const partialOrder = order as Partial<Order>;
                return {
                  ...order,
                  discount: partialOrder.discount || null,
                  promoCodeId: partialOrder.promoCodeId || null,
                } as Order;
              })
            : [],
        );
        setTotal(result.result?.total ?? 0);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

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
        order.items?.some((item) => item.name.toLowerCase().includes(query))
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

  const formatRelativeDate = (date: Date) => {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return d.toLocaleDateString();
  };

  const renderItemThumbStack = (items: OrderItem[] | undefined) => {
    const list = items ?? [];
    const visible = list.slice(0, 3);
    const extra = list.length - visible.length;
    if (list.length === 0) {
      return <span className='text-muted-foreground text-xs'>0</span>;
    }
    return (
      <div className='flex items-center'>
        <div className='flex items-center'>
          {visible.map((it, idx) => (
            <div
              key={it.id}
              className={`relative h-7 w-7 rounded-full border-2 border-background overflow-hidden bg-stone-100 flex items-center justify-center text-[10px] font-medium text-stone-600 ${idx > 0 ? "-ml-2" : ""}`}
              title={it.name}>
              {it.productImage ? (
                <img
                  src={it.productImage}
                  alt={it.name}
                  className='h-full w-full object-cover'
                />
              ) : (
                <span>{(it.name || "?").charAt(0).toUpperCase()}</span>
              )}
            </div>
          ))}
        </div>
        {extra > 0 && (
          <span className='ml-2 inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600'>
            +{extra}
          </span>
        )}
        <span className='ml-2 text-xs text-muted-foreground'>
          {list.length}
        </span>
      </div>
    );
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <AlertDialog>
      <div className='p-6 space-y-6 w-full h-full'>
        <div className='flex justify-center lg:justify-between items-center flex-wrap gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-center lg:text-left'>
              Orders
            </h1>
            <p className='text-muted-foreground text-center lg:text-left'>
              Track and manage your store's orders
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex flex-col gap-4 md:flex-row justify-between'>
              <div className='flex items-center gap-2 w-full md:w-1/3'>
                <Search className='h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search orders...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='h-9'
                />
              </div>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4 text-muted-foreground' />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='h-9 w-[180px]'>
                      <SelectValue placeholder='Filter by status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Statuses</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='processing'>Processing</SelectItem>
                      <SelectItem value='shipped'>Shipped</SelectItem>
                      <SelectItem value='delivered'>Delivered</SelectItem>
                      <SelectItem value='cancelled'>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='text-center py-10'>
                <Loader2 className='mx-auto h-12 w-12 text-muted-foreground animate-spin' />
                <h3 className='mt-4 text-lg font-semibold'>
                  Loading orders...
                </h3>
              </div>
            ) : error ? (
              <div className='text-center py-10 text-red-500'>
                <p>{error}</p>
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={fetchOrders}>
                  Try Again
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className='text-center py-10'>
                <Package className='mx-auto h-12 w-12 text-muted-foreground' />
                <h3 className='mt-4 text-lg font-semibold'>No orders found</h3>
                <p className='mt-2 text-muted-foreground'>
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "When you receive orders, they'll appear here"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className='hidden md:block overflow-x-auto'>
                  <Table>
                    <TableHeader className='sticky top-0 bg-background z-10'>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className='hover:bg-muted/50'>
                          <TableCell className='font-mono text-xs py-2'>
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className='py-2'>
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className='py-2'>
                            {order.customerName}
                          </TableCell>
                          <TableCell className='py-2'>
                            {renderItemThumbStack(order.items)}
                          </TableCell>
                          <TableCell className='py-2'>
                            {Number.parseFloat(order.total).toFixed(2)} EGP
                            {order.discount &&
                              Number.parseFloat(order.discount) > 0 && (
                                <div className='text-xs text-green-600'>
                                  <span>
                                    -
                                    {Number.parseFloat(order.discount).toFixed(
                                      2,
                                    )}{" "}
                                    EGP discount
                                  </span>
                                </div>
                              )}
                          </TableCell>
                          <TableCell className='py-2'>
                            <Badge
                              variant='outline'
                              className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right py-2'>
                            <div className='flex items-center gap-2 justify-end'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleViewDetails(order)}>
                                <Eye className='h-4 w-4' />
                                <span className='sr-only'>View Details</span>
                              </Button>
                              {isAdmin && (
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant='destructive'
                                    size='sm'
                                    onClick={() => setOrderToDeleteId(order.id)}
                                    disabled={isUpdating}>
                                    <Trash2 className='h-4 w-4' />
                                    <span className='sr-only'>
                                      Delete Order
                                    </span>
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

                {/* Mobile card list */}
                <div className='md:hidden block space-y-3'>
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className='rounded-lg border bg-card p-4 shadow-sm'>
                      <div className='flex items-center justify-between'>
                        <span className='font-mono text-xs text-muted-foreground'>
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {formatRelativeDate(order.createdAt)}
                        </span>
                      </div>
                      <div className='mt-2 font-medium'>
                        {order.customerName}
                      </div>
                      <div className='mt-1 text-sm text-muted-foreground'>
                        {order.items?.length ?? 0} item
                        {(order.items?.length ?? 0) === 1 ? "" : "s"}
                        {" · "}
                        {Number.parseFloat(order.total).toFixed(2)} EGP
                      </div>
                      <div className='mt-2 flex items-center justify-between'>
                        <Badge
                          variant='outline'
                          className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewDetails(order)}>
                            <Eye className='h-4 w-4' />
                            <span className='sr-only'>View Details</span>
                          </Button>
                          {isAdmin && (
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => setOrderToDeleteId(order.id)}
                                disabled={isUpdating}>
                                <Trash2 className='h-4 w-4' />
                                <span className='sr-only'>Delete Order</span>
                              </Button>
                            </AlertDialogTrigger>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className='border-t px-6 py-4'>
            {(() => {
              const totalPages = Math.max(1, Math.ceil(total / pageSize));
              const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
              const end = Math.min(page * pageSize, total);
              return (
                <div className='flex items-center justify-between w-full gap-3 text-xs text-muted-foreground'>
                  <div>
                    Showing {start}–{end} of {total} orders
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              );
            })()}
          </CardFooter>
        </Card>

        <Dialog
          open={isDesktop && isDetailsOpen}
          onOpenChange={setIsDetailsOpen}>
          <DialogContent className='sm:max-w-5xl max-h-[90vh] overflow-y-auto'>
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>
                    Order ID: {selectedOrder.id}
                  </DialogDescription>
                </DialogHeader>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'>
                  <div>
                    <h3 className='font-medium text-sm mb-2'>
                      Customer Information
                    </h3>
                    <div className='space-y-1 text-sm'>
                      <p>
                        <span className='font-medium'>Name:</span>{" "}
                        {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className='font-medium'>Email:</span>{" "}
                        {selectedOrder.customerEmail || "N/A"}
                      </p>
                      <p>
                        <span className='font-medium'>Phone:</span>{" "}
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium text-sm mb-2'>
                      Shipping Address
                    </h3>
                    <div className='space-y-1 text-sm'>
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

                <div className='my-4'>
                  <h3 className='font-medium text-sm mb-2'>Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <div className='h-12 w-12 rounded-md overflow-hidden bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 shrink-0'>
                                {item.productImage ? (
                                  <img
                                    src={item.productImage}
                                    alt={item.name}
                                    className='h-full w-full object-cover'
                                  />
                                ) : (
                                  <span>
                                    {(item.name || "?").charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span>{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.discountPrice ? (
                              <>
                                <span className='line-through text-gray-500'>
                                  {Number.parseFloat(item.price).toFixed(2)} EGP
                                </span>
                                <span className='text-red-600 block'>
                                  {Number.parseFloat(
                                    item.discountPrice,
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
                                item.discountPrice || item.price,
                              ) * item.quantity
                            ).toFixed(2)}{" "}
                            EGP
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell
                            colSpan={isAdmin ? 5 : 4}
                            className='text-center text-muted-foreground'>
                            No items found for this order.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className='flex justify-between items-start my-4'>
                  <div>
                    <h3 className='font-medium text-sm mb-2'>Order Status</h3>
                    <div className='flex items-center gap-3'>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Badge>

                      {isAdmin && (
                        <Select
                          disabled={isUpdating}
                          onValueChange={(value) =>
                            updateOrderStatus(selectedOrder.id, value)
                          }>
                          <SelectTrigger className='h-8 w-[160px]'>
                            <SelectValue placeholder='Update status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='processing'>
                              Processing
                            </SelectItem>
                            <SelectItem value='shipped'>Shipped</SelectItem>
                            <SelectItem value='delivered'>Delivered</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className='text-right'>
                    <h3 className='font-medium text-sm mb-2'>Order Summary</h3>
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='font-medium'>Subtotal:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.subtotal).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>

                      {selectedOrder.discount &&
                        Number.parseFloat(selectedOrder.discount) > 0 && (
                          <div className='flex justify-between'>
                            <span className='font-medium text-green-600'>
                              Discount:
                            </span>
                            <span className='text-green-600'>
                              -
                              {Number.parseFloat(
                                selectedOrder.discount,
                              ).toFixed(2)}{" "}
                              EGP
                            </span>
                          </div>
                        )}

                      <div className='flex justify-between'>
                        <span className='font-medium'>Shipping:</span>
                        <span>
                          {Number.parseFloat(selectedOrder.shipping).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>

                      <div className='flex justify-between font-bold'>
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
                  <div className='my-4 border-t pt-4'>
                    <h3 className='font-medium text-sm mb-2'>Order Notes</h3>
                    <p className='text-sm text-muted-foreground'>
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Mobile order details — Sheet */}
        <Sheet
          open={!isDesktop && isDetailsOpen}
          onOpenChange={setIsDetailsOpen}>
          <SheetContent
            side='bottom'
            className='h-dvh max-h-dvh p-0 flex flex-col'>
            {selectedOrder && (
              <>
                <SheetHeader className='border-b sticky top-0 bg-background z-10 relative pr-14'>
                  <SheetTitle>Order Details</SheetTitle>
                  <p className='text-xs text-muted-foreground font-mono'>
                    {selectedOrder.id}
                  </p>
                  <SheetClose
                    type='button'
                    aria-label='Close'
                    className='absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring'>
                    <X className='h-5 w-5' />
                  </SheetClose>
                </SheetHeader>

                <div className='flex-1 overflow-y-auto p-4 space-y-6'>
                  <div>
                    <h3 className='font-medium text-sm mb-2'>
                      Customer Information
                    </h3>
                    <div className='space-y-1 text-sm'>
                      <p>
                        <span className='font-medium'>Name:</span>{" "}
                        {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className='font-medium'>Email:</span>{" "}
                        {selectedOrder.customerEmail || "N/A"}
                      </p>
                      <p>
                        <span className='font-medium'>Phone:</span>{" "}
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium text-sm mb-2'>
                      Shipping Address
                    </h3>
                    <div className='space-y-1 text-sm'>
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

                  <div>
                    <h3 className='font-medium text-sm mb-2'>Order Items</h3>
                    <div className='space-y-3'>
                      {selectedOrder.items?.map((item) => {
                        const unit = Number.parseFloat(
                          item.discountPrice || item.price,
                        );
                        return (
                          <div
                            key={item.id}
                            className='flex items-center gap-3'>
                            <div className='h-14 w-14 rounded-md overflow-hidden bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 shrink-0'>
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.name}
                                  className='h-full w-full object-cover'
                                />
                              ) : (
                                <span>
                                  {(item.name || "?").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-medium truncate'>
                                {item.name}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {item.quantity} × {unit.toFixed(2)} ={" "}
                                {(unit * item.quantity).toFixed(2)} EGP
                              </p>
                            </div>
                          </div>
                        );
                      }) || (
                        <p className='text-sm text-muted-foreground text-center'>
                          No items found for this order.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium text-sm mb-2'>Order Status</h3>
                    <div className='flex items-center gap-3 flex-wrap'>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Badge>
                      {isAdmin && (
                        <Select
                          disabled={isUpdating}
                          onValueChange={(value) =>
                            updateOrderStatus(selectedOrder.id, value)
                          }>
                          <SelectTrigger className='h-8 w-[160px]'>
                            <SelectValue placeholder='Update status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='processing'>
                              Processing
                            </SelectItem>
                            <SelectItem value='shipped'>Shipped</SelectItem>
                            <SelectItem value='delivered'>Delivered</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium text-sm mb-2'>Order Summary</h3>
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='font-medium'>Subtotal</span>
                        <span>
                          {Number.parseFloat(selectedOrder.subtotal).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>
                      {selectedOrder.discount &&
                        Number.parseFloat(selectedOrder.discount) > 0 && (
                          <div className='flex justify-between text-green-600'>
                            <span className='font-medium'>Discount</span>
                            <span>
                              -
                              {Number.parseFloat(
                                selectedOrder.discount,
                              ).toFixed(2)}{" "}
                              EGP
                            </span>
                          </div>
                        )}
                      <div className='flex justify-between'>
                        <span className='font-medium'>Shipping</span>
                        <span>
                          {Number.parseFloat(selectedOrder.shipping).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>
                      <div className='flex justify-between font-bold pt-1 border-t'>
                        <span>Total</span>
                        <span>
                          {Number.parseFloat(selectedOrder.total).toFixed(2)}{" "}
                          EGP
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h3 className='font-medium text-sm mb-2'>Order Notes</h3>
                      <p className='text-sm text-muted-foreground'>
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className='border-t p-4 sticky bottom-0 bg-background'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order
              <span className='font-mono font-semibold'>
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
              disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
