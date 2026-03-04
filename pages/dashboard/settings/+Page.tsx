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
import { Loader2, Save, Truck } from "lucide-react";
import { STORE_CURRENCY } from "#root/shared/config/branding";

export default function SettingsPage() {
  const [shippingFee, setShippingFee] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current shipping fee on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await trpc.settings.getShippingFee.query();
        if (cancelled) return;
        if (result.success) {
          setShippingFee(String(result.result));
        }
      } catch (err) {
        console.error("Failed to fetch shipping fee:", err);
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
    </div>
  );
}
