"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "#root/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#root/components/ui/table";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import { Badge } from "#root/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "#root/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#root/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "#root/components/ui/alert-dialog";
import { Users, Search, Loader2, CheckCircle, XCircle, Plus, Pencil, Trash2, KeyRound, ShieldCheck, ShieldOff, Eye, RotateCcw } from "lucide-react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "#root/components/ui/label";

interface UserRow { id: string; name: string; email: string; phone: string | null; role: string; emailVerified: boolean; createdAt: Date | string | null; }
interface OrderRow { id: string; customerName: string; customerEmail: string; total: string; status: string; createdAt: Date | string | null; items: { id: string; name: string; quantity: number; price: string; }[]; }
interface UserDetail extends UserRow { orders: OrderRow[]; }

const PAGE_SIZE = 20;

const createUserSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8), phone: z.string().default(""), role: z.enum(["admin", "vendor", "user"]), emailVerified: z.boolean() });
const editUserSchema = z.object({ name: z.string().min(1).optional(), email: z.string().email().optional(), phone: z.string().optional(), role: z.enum(["admin", "vendor", "user"]).optional() });
const setPasswordSchema = z.object({ newPassword: z.string().min(8) });
type CreateUserValues = z.infer<typeof createUserSchema>;
type EditUserValues = z.infer<typeof editUserSchema>;
type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async (pageNum: number, searchVal: string) => {
    setIsLoading(true);
    try {
      const res = await trpc.users.list.query({ limit: PAGE_SIZE, offset: pageNum * PAGE_SIZE, search: searchVal || undefined });
      if (res.success) { setUsers(res.result.users as UserRow[]); setTotal(res.result.total); }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(page, search); }, [page, search, fetchUsers]);

  const handleSearch = () => { setPage(0); setSearch(searchInput); };
  const formatDate = (val: Date | string | null) => !val ? "-" : new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const openUserDetail = async (userId: string) => {
    setLoadingDetail(true);
    try {
      const res = await trpc.users.getById.query({ id: userId });
      if (res.success) setSelectedUser(res.result as UserDetail);
    } catch (err) { console.error(err); } finally { setLoadingDetail(false); }
  };

  const createForm = useForm<CreateUserValues>({ resolver: zodResolver(createUserSchema), defaultValues: { name: "", email: "", password: "", phone: "", role: "user", emailVerified: false } });
  const editForm = useForm<EditUserValues>({ resolver: zodResolver(editUserSchema) });
  const passwordForm = useForm<SetPasswordValues>({ resolver: zodResolver(setPasswordSchema), defaultValues: { newPassword: "" } });

  const handleCreate = async (values: CreateUserValues) => {
    setIsSubmitting(true);
    try { await trpc.users.create.mutate(values); toast.success("User created"); setShowCreate(false); createForm.reset(); fetchUsers(page, search); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to create user"); }
    finally { setIsSubmitting(false); }
  };

  const openEdit = (u: UserRow) => { setEditUser(u); editForm.reset({ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role as "admin" | "vendor" | "user" }); };

  const handleEdit = async (values: EditUserValues) => {
    if (!editUser) return;
    setIsSubmitting(true);
    try { await trpc.users.update.mutate({ id: editUser.id, ...values }); toast.success("User updated"); setEditUser(null); fetchUsers(page, search); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update user"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsSubmitting(true);
    try { await trpc.users.delete.mutate({ id: deleteUser.id }); toast.success("User deleted"); setDeleteUser(null); fetchUsers(page, search); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to delete user"); }
    finally { setIsSubmitting(false); }
  };

  const handleToggleVerified = async (u: UserRow) => {
    try { await trpc.users.setVerified.mutate({ id: u.id, verified: !u.emailVerified }); toast.success(u.emailVerified ? "Email unverified" : "Email verified"); fetchUsers(page, search); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update verification"); }
  };

  const handleSetPassword = async (values: SetPasswordValues) => {
    if (!passwordUser) return;
    setIsSubmitting(true);
    try { await trpc.users.adminSetPassword.mutate({ id: passwordUser.id, newPassword: values.newPassword }); toast.success("Password updated"); setPasswordUser(null); passwordForm.reset(); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to set password"); }
    finally { setIsSubmitting(false); }
  };

  const handleResetPassword = async (u: UserRow) => {
    try { await trpc.users.adminSetPassword.mutate({ id: u.id, newPassword: "password12345" }); toast.success(`Password reset to "password12345" for ${u.name}`); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to reset password"); }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Registered accounts &mdash; {total} total</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />Add User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No users found.</div>
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
                        <TableCell className="text-sm">{u.phone ?? "-"}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleVerified(u)}
                            className="hover:opacity-70 transition-opacity"
                            title={u.emailVerified ? "Click to unverify" : "Click to verify"}
                          >
                            {u.emailVerified
                              ? <CheckCircle className="h-4 w-4 text-green-500" />
                              : <XCircle className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" title="View" onClick={() => openUserDetail(u.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(u)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Set Password" onClick={() => { setPasswordUser(u); passwordForm.reset(); }}>
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title='Reset password to "password12345"' onClick={() => handleResetPassword(u)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="sm" title="Delete"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteUser(u)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user account</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...createForm.register("name")} placeholder="Full name" />
              {createForm.formState.errors.name && <p className="text-destructive text-xs">{createForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input {...createForm.register("email")} type="email" placeholder="user@example.com" />
              {createForm.formState.errors.email && <p className="text-destructive text-xs">{createForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input {...createForm.register("password")} type="password" placeholder="Min 8 characters" />
              {createForm.formState.errors.password && <p className="text-destructive text-xs">{createForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...createForm.register("phone")} placeholder="Optional" />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select defaultValue="user" onValueChange={(val) => createForm.setValue("role", val as "admin" | "vendor" | "user")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ev-create" {...createForm.register("emailVerified")} className="h-4 w-4" />
              <Label htmlFor="ev-create" className="cursor-pointer">Mark email as verified</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...editForm.register("name")} />
              {editForm.formState.errors.name && <p className="text-destructive text-xs">{editForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input {...editForm.register("email")} type="email" />
              {editForm.formState.errors.email && <p className="text-destructive text-xs">{editForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input {...editForm.register("phone")} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select defaultValue={editUser?.role ?? "user"} onValueChange={(val) => editForm.setValue("role", val as "admin" | "vendor" | "user")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={!!passwordUser} onOpenChange={(open) => { if (!open) setPasswordUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
            <DialogDescription>Set a new password for {passwordUser?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(handleSetPassword)} className="space-y-4">
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input {...passwordForm.register("newPassword")} type="password" placeholder="Min 8 characters" />
              {passwordForm.formState.errors.newPassword && <p className="text-destructive text-xs">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Set Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.name}</strong> ({deleteUser?.email})? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <div className="flex gap-2"><span className="text-muted-foreground w-20">Phone</span><span>{selectedUser.phone ?? "-"}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-20">Role</span><Badge variant={selectedUser.role === "admin" ? "default" : "secondary"} className="capitalize h-5 text-xs">{selectedUser.role}</Badge></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-20">Verified</span><span>{selectedUser.emailVerified ? "Yes" : "No"}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-20">Joined</span><span>{formatDate(selectedUser.createdAt)}</span></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => { setSelectedUser(null); openEdit(selectedUser); }}>
                  <Pencil className="h-3 w-3 mr-1" />Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleVerified(selectedUser)}>
                  {selectedUser.emailVerified
                    ? <><ShieldOff className="h-3 w-3 mr-1" />Unverify</>
                    : <><ShieldCheck className="h-3 w-3 mr-1" />Verify Email</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setSelectedUser(null); setPasswordUser(selectedUser); passwordForm.reset(); }}>
                  <KeyRound className="h-3 w-3 mr-1" />Set Password
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { setSelectedUser(null); setDeleteUser(selectedUser); }}>
                  <Trash2 className="h-3 w-3 mr-1" />Delete
                </Button>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-sm mb-3">Orders ({selectedUser.orders.length})</h3>
                {selectedUser.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.orders.map((o) => (
                      <div key={o.id} className="border rounded-md p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium font-mono text-xs">{o.id.slice(0, 8)}...</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize text-xs">{o.status}</Badge>
                            <span className="text-muted-foreground text-xs">{formatDate(o.createdAt)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {o.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.name} x {item.quantity}</span>
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
