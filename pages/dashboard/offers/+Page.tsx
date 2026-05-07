import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
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
import { Badge } from "#root/components/ui/badge";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Switch } from "#root/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#root/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import type { OfferCondition, OfferReward } from "#root/shared/database/drizzle/schema";

type CartOfferRow = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  priority: number;
  isExclusive: boolean;
  condition: OfferCondition;
  reward: OfferReward;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const CONDITION_LABELS: Record<OfferCondition["type"], string> = {
  always: "Always",
  quantity_threshold: "Min Quantity",
  cart_total: "Min Cart Total",
  product_bundle: "Product Bundle",
};

const REWARD_LABELS: Record<OfferReward["type"], string> = {
  percentage_off: "% Discount",
  fixed_off: "Fixed Discount",
  free_shipping: "Free Shipping",
  free_items: "Free Items",
};

const emptyCondition: OfferCondition = { type: "always" };
const emptyReward: OfferReward = { type: "percentage_off", percentOff: 10 };

type FormState = {
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  isExclusive: boolean;
  condition: OfferCondition;
  reward: OfferReward;
  startsAt: string;
  endsAt: string;
};

const defaultForm: FormState = {
  name: "",
  description: "",
  isActive: true,
  priority: 0,
  isExclusive: false,
  condition: emptyCondition,
  reward: emptyReward,
  startsAt: "",
  endsAt: "",
};

function ConditionFields({
  condition,
  onChange,
}: {
  condition: OfferCondition;
  onChange: (c: OfferCondition) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Condition Type</Label>
      <Select
        value={condition.type}
        onValueChange={(val) => {
          const t = val as OfferCondition["type"];
          if (t === "always") onChange({ type: "always" });
          else if (t === "quantity_threshold")
            onChange({ type: "quantity_threshold", minQuantity: 1 });
          else if (t === "cart_total") onChange({ type: "cart_total", minTotal: 100 });
          else if (t === "product_bundle")
            onChange({ type: "product_bundle", requiredProductIds: [] });
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(CONDITION_LABELS) as [OfferCondition["type"], string][]).map(
            ([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      {condition.type === "quantity_threshold" && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          <Label>Min Quantity</Label>
          <Input
            type="number"
            min={1}
            value={condition.minQuantity}
            onChange={(e) =>
              onChange({ ...condition, minQuantity: Number(e.target.value) })
            }
          />
          <Label>Restrict to Product IDs (comma-separated, optional)</Label>
          <Input
            placeholder="Leave blank for any product"
            value={condition.productIds?.join(", ") ?? ""}
            onChange={(e) =>
              onChange({
                ...condition,
                productIds: e.target.value
                  ? e.target.value.split(",").map((s) => s.trim())
                  : undefined,
              })
            }
          />
        </div>
      )}

      {condition.type === "cart_total" && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          <Label>Minimum Cart Total</Label>
          <Input
            type="number"
            min={0}
            value={condition.minTotal}
            onChange={(e) =>
              onChange({ ...condition, minTotal: Number(e.target.value) })
            }
          />
        </div>
      )}

      {condition.type === "product_bundle" && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          <Label>Required Product IDs (comma-separated)</Label>
          <Input
            placeholder="product-id-1, product-id-2"
            value={condition.requiredProductIds.join(", ")}
            onChange={(e) =>
              onChange({
                ...condition,
                requiredProductIds: e.target.value
                  ? e.target.value.split(",").map((s) => s.trim())
                  : [],
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function RewardFields({
  reward,
  onChange,
}: {
  reward: OfferReward;
  onChange: (r: OfferReward) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Reward Type</Label>
      <Select
        value={reward.type}
        onValueChange={(val) => {
          const t = val as OfferReward["type"];
          if (t === "percentage_off") onChange({ type: "percentage_off", percentOff: 10 });
          else if (t === "fixed_off") onChange({ type: "fixed_off", amountOff: 5 });
          else if (t === "free_shipping") onChange({ type: "free_shipping" });
          else if (t === "free_items")
            onChange({ type: "free_items", quantity: 1, which: "cheapest" });
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(REWARD_LABELS) as [OfferReward["type"], string][]).map(
            ([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>

      {reward.type === "percentage_off" && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          <Label>Discount Percentage</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={reward.percentOff}
            onChange={(e) =>
              onChange({ ...reward, percentOff: Number(e.target.value) })
            }
          />
        </div>
      )}

      {reward.type === "fixed_off" && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          <Label>Discount Amount</Label>
          <Input
            type="number"
            min={0}
            value={reward.amountOff}
            onChange={(e) =>
              onChange({ ...reward, amountOff: Number(e.target.value) })
            }
          />
        </div>
      )}

      {reward.type === "free_items" && (
        <div className="space-y-2 pl-2 border-l-2 border-muted">
          <Label>Free Item Quantity</Label>
          <Input
            type="number"
            min={1}
            value={reward.quantity}
            onChange={(e) =>
              onChange({ ...reward, quantity: Number(e.target.value) })
            }
          />
          <Label>Which items</Label>
          <Select
            value={reward.which}
            onValueChange={(v) =>
              onChange({ ...reward, which: v as "cheapest" | "most_expensive" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cheapest">Cheapest</SelectItem>
              <SelectItem value="most_expensive">Most Expensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export function Page() {
  const [offers, setOffers] = useState<CartOfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CartOfferRow | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadOffers() {
    setLoading(true);
    try {
      const result = await trpc.offer.adminList.query();
      if (result.success && result.result) {
        setOffers(result.result as CartOfferRow[]);
      }
    } catch {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, []);

  function openCreate() {
    setEditingOffer(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(offer: CartOfferRow) {
    setEditingOffer(offer);
    setForm({
      name: offer.name,
      description: offer.description ?? "",
      isActive: offer.isActive,
      priority: offer.priority,
      isExclusive: offer.isExclusive,
      condition: offer.condition,
      reward: offer.reward,
      startsAt: offer.startsAt
        ? new Date(offer.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: offer.endsAt
        ? new Date(offer.endsAt).toISOString().slice(0, 16)
        : "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        isActive: form.isActive,
        priority: form.priority,
        isExclusive: form.isExclusive,
        condition: form.condition,
        reward: form.reward,
        startsAt: form.startsAt ? new Date(form.startsAt) : null,
        endsAt: form.endsAt ? new Date(form.endsAt) : null,
      };

      if (editingOffer) {
        const result = await trpc.offer.update.mutate({ id: editingOffer.id, ...payload });
        if (result.success) {
          toast.success("Offer updated");
          setDialogOpen(false);
          loadOffers();
        } else {
          toast.error("Failed to update offer");
        }
      } else {
        const result = await trpc.offer.create.mutate(payload);
        if (result.success) {
          toast.success("Offer created");
          setDialogOpen(false);
          loadOffers();
        } else {
          toast.error("Failed to create offer");
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const result = await trpc.offer.delete.mutate({ id: deletingId });
      if (result.success) {
        toast.success("Offer deleted");
        loadOffers();
      } else {
        toast.error("Failed to delete offer");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  }

  function describeReward(reward: OfferReward): string {
    if (reward.type === "percentage_off") return `${reward.percentOff}% off`;
    if (reward.type === "fixed_off") return `$${reward.amountOff} off`;
    if (reward.type === "free_shipping") return "Free shipping";
    if (reward.type === "free_items")
      return `${reward.quantity} free item(s) (${reward.which})`;
    return "";
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6" /> Offers & Promotions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create automatic cart offers — quantity deals, bundle discounts, free shipping, and
            more.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Offer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              No offers yet. Click "New Offer" to create your first automatic promotion.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Exclusive</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="font-medium">{offer.name}</div>
                      {offer.description && (
                        <div className="text-xs text-muted-foreground">{offer.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{CONDITION_LABELS[offer.condition.type]}</Badge>
                    </TableCell>
                    <TableCell>{describeReward(offer.reward)}</TableCell>
                    <TableCell>{offer.priority}</TableCell>
                    <TableCell>
                      {offer.isExclusive ? (
                        <Badge variant="secondary">Exclusive</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Stackable</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.isActive ? "default" : "outline"}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {offer.startsAt
                        ? new Date(offer.startsAt).toLocaleDateString()
                        : "—"}{" "}
                      →{" "}
                      {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : "∞"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(offer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Offer" : "Create Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Buy 3 Get 1 Free"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional customer-facing description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: Number(e.target.value) }))
                  }
                />
                <p className="text-xs text-muted-foreground">Higher = evaluated first</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isExclusive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isExclusive: v }))}
                  />
                  <Label>Exclusive (stops stacking)</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Starts At</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Ends At</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
            </div>
            <ConditionFields
              condition={form.condition}
              onChange={(c) => setForm((f) => ({ ...f, condition: c }))}
            />
            <RewardFields
              reward={form.reward}
              onChange={(r) => setForm((f) => ({ ...f, reward: r }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingOffer ? "Save Changes" : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The offer will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
