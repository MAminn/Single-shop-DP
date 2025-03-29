import { type ReactNode, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
import { Input } from "#root/components/ui/input";
import { Badge } from "#root/components/ui/badge";
import {
  ChevronDown,
  Search,
  Filter,
  Users,
  Store,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  LayoutGrid,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#root/components/ui/dropdown-menu";
import { Link } from "#root/components/Link.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { trpc } from "#root/shared/trpc/client";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#root/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import VendorForm from "./components";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchQueryValue] = useDebounce(searchQuery, 1000);
  const [lastUpdateDate, setLastUpdateDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const initalData = useData<Data>();

  const [fetchDataResult, setFetchDataResult] = useState<Data>(initalData);
  const [loading, setLoading] = useState(false);

  const approveVendor = async (id: string) => {
    setLoading(true);

    const result = await trpc.vendor.approve.mutate({ id });

    if (!result.success) {
      toast.error(result.error);
    } else {
      setLastUpdateDate(new Date());
    }

    setLoading(false);
  };

  const rejectVendor = async (id: string) => {
    setLoading(true);

    const result = await trpc.vendor.reject.mutate({ id });

    if (!result.success) {
      toast.error(result.error);
    } else {
      setLastUpdateDate(new Date());
    }

    setLoading(false);
  };

  const suspendVendor = async (id: string) => {
    setLoading(true);

    const result = await trpc.vendor.suspend.mutate({ id });

    if (!result.success) {
      toast.error(result.error);
    } else {
      setLastUpdateDate(new Date());
    }

    setLoading(false);
  };

  const activateVendor = async (id: string) => {
    setLoading(true);

    const result = await trpc.vendor.activate.mutate({ id });

    if (!result.success) {
      toast.error(result.error);
    } else {
      setLastUpdateDate(new Date());
    }

    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies(lastUpdateDate): for refreshing data
  useEffect(() => {
    if (statusFilter && statusFilter !== "all") {
      setLoading(true);
      trpc.vendor.view
        .query({
          statuses: [statusFilter],
          search: searchQueryValue,
        })
        .then(setFetchDataResult)
        .then(() => setLoading(false));
    } else {
      setLoading(true);
      trpc.vendor.view
        .query({
          search: searchQueryValue,
        })
        .then(setFetchDataResult)
        .then(() => setLoading(false));
    }
  }, [statusFilter, searchQueryValue, lastUpdateDate]);

  if (!fetchDataResult.success) {
    return (
      <section className="max-w-3xl text-center mx-auto py-10">
        <AlertCircle className="w-20 h-20 bg-primary text-primary-foreground rounded-full p-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p>{fetchDataResult.error}</p>
      </section>
    );
  }

  const data = fetchDataResult.result;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage all vendors on the platform
          </p>
        </div>
        {loading && (
          <Loader2Icon className="w-6 h-6 animate-spin text-muted-foreground" />
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row justify-between">
            <div className="flex items-center gap-2 w-full">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 flex-1"
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-10">
              <Store className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add vendors to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        {vendor.name}
                      </TableCell>
                      <TableCell>{vendor.ownerName}</TableCell>
                      <TableCell>{vendor.ownerEmail}</TableCell>
                      <TableCell>{vendor.createdAt.toDateString()}</TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              Vendor Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem> */}
                            <DropdownMenuItem asChild>
                              <EditVendorForm
                                Trigger={
                                  <Button
                                    variant={"ghost"}
                                    className="w-full justify-start px-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Vendor
                                  </Button>
                                }
                                vendorId={vendor.id}
                                onUpdate={() => {
                                  setLastUpdateDate(new Date());
                                }}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/products?vendorId=${vendor.id}`}
                              >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                View Products
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {vendor.status === "active" && (
                              <DropdownMenuItem
                                disabled={loading}
                                onClick={() => suspendVendor(vendor.id)}
                                className="text-yellow-600"
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Suspend Vendor
                              </DropdownMenuItem>
                            )}
                            {vendor.status === "suspended" && (
                              <DropdownMenuItem
                                onClick={() => activateVendor(vendor.id)}
                                className="text-green-600"
                                disabled={loading}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate Vendor
                              </DropdownMenuItem>
                            )}

                            {vendor.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  disabled={loading}
                                  onClick={() => approveVendor(vendor.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Vendor
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  disabled={loading}
                                  className="text-red-600"
                                  onClick={() => rejectVendor(vendor.id)}
                                >
                                  <XIcon className="mr-2 h-4 w-4" />
                                  Reject Vendor
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              Showing {data.length} of {0} vendors
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function EditVendorForm({
  vendorId,
  Trigger,
  onUpdate,
}: {
  vendorId: string;
  Trigger: ReactNode;
  onUpdate: () => void;
}) {
  const [vendorData, setVendorData] = useState<null | {
    id: string;
    name: string;
    description?: string;
    logoId?: string;
    featured?: boolean;
  }>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    trpc.vendor.viewById.query({ vendorId }).then((res) => {
      if (res.success && res.result) {
        setVendorData({
          id: res.result.id,
          name: res.result.name,
          description: res.result.description || undefined,
          logoId: res.result.logoId || undefined,
          featured: res.result.featured,
        });
      } else {
        toast.error("Failed to fetch vendor data");
      }
    });
  }, [vendorId]);

  const onSubmit = async (values: {
    id?: string;
    name: string;
    description?: string;
    logoId?: string;
    featured?: boolean;
  }) => {
    if (!values.id) {
      alert(
        "Selected vendor has no id, this is likely a bug, try refreshing the page."
      );
      return;
    }

    const res = await trpc.vendor.edit.mutate({
      id: values.id,
      name: values.name,
      description: values.description,
      logoId: values.logoId,
      featured: values.featured,
    });

    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success("Vendor updated successfully");
      setOpen(false);
    }

    onUpdate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>
        {vendorData && (
          <VendorForm defaultValues={vendorData} onSubmit={onSubmit} />
        )}
        {!vendorData && <div>Loading...</div>}
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
