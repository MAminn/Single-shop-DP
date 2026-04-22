"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Input } from "#root/components/ui/input";
import { Badge } from "#root/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "#root/components/ui/dialog";
import { Users, Search, Eye, Loader2, CheckCircle, XCircle } from "lucide-react";
import { trpc } from "#root/shared/trpc/client";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date | string | null;
}

interface OrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  total: string;
  status: string;
  createdAt: Date | string | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: string;
  }[];
}

interface UserDetail extends UserRow {
  orders: OrderRow[];
}

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchUsers = useCallback(
    async (pageNum: number, searchVal: string) => {
      setIsLoading(true);
      try {
        const res = await trpc.users.list.query({
          limit: PAGE_SIZE,
          offset: pageNum * PAGE_SIZE,
          search: searchVal || undefined,
        });
        if (res.success) {
          setUsers(res.result.users as UserRow[]);
          setTotal(res.result.total);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search, fetchUsers]);

  const handleSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  const openUserDetail = async (userId: string) => {
    setLoadingDetail(true);
    setSelectedUser(null);
    try {
      const res = await trpc.users.getById.query({ id: userId });
      if (res.success) {
        setSelectedUser(res.result as UserDetail);
      }
    } catch (err) {
      console.error("Failed to fetch user detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (val: Date | string | null) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registered accounts — {total} total
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No users found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-sm">{u.phone ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUserDetail(u.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser || loadingDetail} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedUser ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedUser.name}</DialogTitle>
                <DialogDescription>{selectedUser.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-1 text-sm mt-2">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20">Phone</span>
                  <span>{selectedUser.phone ?? "—"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20">Role</span>
                  <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"} className="capitalize h-5 text-xs">
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20">Verified</span>
                  <span>{selectedUser.emailVerified ? "Yes" : "No"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20">Joined</span>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium text-sm mb-3">
                  Orders ({selectedUser.orders.length})
                </h3>
                {selectedUser.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.orders.map((o) => (
                      <div key={o.id} className="border rounded-md p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium font-mono text-xs">{o.id.slice(0, 8)}…</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize text-xs">{o.status}</Badge>
                            <span className="text-muted-foreground text-xs">{formatDate(o.createdAt)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {o.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.name} × {item.quantity}</span>
                              <span>{item.price}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t text-xs font-medium">
                          <span>Total</span>
                          <span>{o.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
