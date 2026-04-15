"use client";

import { useState, useEffect } from "react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Button } from "#root/components/ui/button";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Loader2, Save, Truck, Plus, Trash2, Tags } from "lucide-react";
import { STORE_CURRENCY } from "#root/shared/config/branding";
import { v7 } from "uuid";

export default function SettingsPage() {
  const [shippingFee, setShippingFee] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Variant presets state
  interface VariantPreset {
    id: string;
    name: string;
    values: string[];
  }
  const [variantPresets, setVariantPresets] = useState<VariantPreset[]>([]);
  const [isSavingPresets, setIsSavingPresets] = useState(false);
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>(
    {},
  );

  // Fetch current shipping fee on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [feeResult, presetsResult] = await Promise.all([
          trpc.settings.getShippingFee.query(),
          trpc.settings.getVariantPresets.query(),
        ]);
        if (cancelled) return;
        if (feeResult.success) {
          setShippingFee(String(feeResult.result));
        }
        if (presetsResult.success) {
          setVariantPresets(presetsResult.result as VariantPreset[]);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        toast.error("Failed to load settings");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    const fee = Number.parseFloat(shippingFee);
    if (Number.isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid shipping fee (0 or more)");
      return;
    }

    setIsSaving(true);
    try {
      const result = await trpc.settings.updateShippingFee.mutate({ fee });
      if (result.success) {
        toast.success("Shipping fee updated successfully");
        setShippingFee(String(result.result.shippingFee));
      } else {
        toast.error(result.error || "Failed to update shipping fee");
      }
    } catch (err) {
      console.error("Failed to update shipping fee:", err);
      toast.error("Failed to update shipping fee");
    } finally {
      setIsSaving(false);
    }
  };

  const addPreset = () => {
    setVariantPresets((prev) => [
      ...prev,
      { id: v7(), name: "", values: [] },
    ]);
  };

  const removePreset = (id: string) => {
    setVariantPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePresetName = (id: string, name: string) => {
    setVariantPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p)),
    );
  };

  const addPresetValue = (presetId: string) => {
    const val = (newValueInputs[presetId] ?? "").trim();
    if (!val) return;
    setVariantPresets((prev) =>
      prev.map((p) =>
        p.id === presetId && !p.values.includes(val)
          ? { ...p, values: [...p.values, val] }
          : p,
      ),
    );
    setNewValueInputs((prev) => ({ ...prev, [presetId]: "" }));
  };

  const removePresetValue = (presetId: string, value: string) => {
    setVariantPresets((prev) =>
      prev.map((p) =>
        p.id === presetId
          ? { ...p, values: p.values.filter((v) => v !== value) }
          : p,
      ),
    );
  };

  const handleSavePresets = async () => {
    // Filter out incomplete presets
    const valid = variantPresets.filter(
      (p) => p.name.trim() && p.values.length > 0,
    );
    setIsSavingPresets(true);
    try {
      const result = await trpc.settings.updateVariantPresets.mutate({
        presets: valid,
      });
      if (result.success) {
        toast.success("Variant presets saved");
        setVariantPresets(result.result as typeof variantPresets);
      } else {
        toast.error("Failed to save variant presets");
      }
    } catch (err) {
      console.error("Failed to save variant presets:", err);
      toast.error("Failed to save variant presets");
    } finally {
      setIsSavingPresets(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Store Settings
        </h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Configure your store&apos;s shipping and delivery settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Truck className='h-5 w-5' />
            Shipping Fee
          </CardTitle>
          <CardDescription>
            Set a flat shipping fee applied to every order. Set to 0 for free
            shipping.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='shippingFee'>Shipping Fee ({STORE_CURRENCY})</Label>
            <div className='flex items-center gap-3'>
              <Input
                id='shippingFee'
                type='number'
                min='0'
                step='0.01'
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                placeholder='0.00'
                className='max-w-[200px]'
              />
              <span className='text-sm text-muted-foreground'>
                {STORE_CURRENCY}
              </span>
            </div>
            <p className='text-xs text-muted-foreground'>
              This fee is added to every order at checkout. Enter 0 to offer
              free shipping.
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Variant Presets Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tags className='h-5 w-5' />
            Variant Presets
          </CardTitle>
          <CardDescription>
            Define reusable variant templates (e.g. &quot;Size: S, M, L,
            XL&quot;) that can be quickly applied when creating products.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {variantPresets.map((preset) => (
            <div
              key={preset.id}
              className='border rounded-lg p-3 space-y-2'>
              <div className='flex items-center gap-2'>
                <Input
                  placeholder='Variant name (e.g. Size, Color, Volume)'
                  value={preset.name}
                  onChange={(e) => updatePresetName(preset.id, e.target.value)}
                  className='flex-1'
                />
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removePreset(preset.id)}
                  className='text-destructive hover:text-destructive h-8 w-8'>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {preset.values.map((val) => (
                  <span
                    key={val}
                    className='inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium'>
                    {val}
                    <button
                      type='button'
                      onClick={() => removePresetValue(preset.id, val)}
                      className='hover:text-destructive ml-0.5'>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className='flex gap-2'>
                <Input
                  placeholder='Add value and press Enter'
                  value={newValueInputs[preset.id] ?? ""}
                  onChange={(e) =>
                    setNewValueInputs((prev) => ({
                      ...prev,
                      [preset.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPresetValue(preset.id);
                    }
                  }}
                  className='flex-1 h-8 text-sm'
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => addPresetValue(preset.id)}
                  className='h-8'>
                  <Plus className='h-3 w-3' />
                </Button>
              </div>
            </div>
          ))}

          <div className='flex items-center gap-3'>
            <Button variant='outline' size='sm' onClick={addPreset}>
              <Plus className='mr-1 h-4 w-4' />
              Add Preset
            </Button>
            <Button
              onClick={handleSavePresets}
              disabled={isSavingPresets}
              size='sm'>
              {isSavingPresets ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Save Presets
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
