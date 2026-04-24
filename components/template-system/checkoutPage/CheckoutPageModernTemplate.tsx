import React, { useState } from "react";
import { Button } from "#root/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Textarea } from "#root/components/ui/textarea";
import { Separator } from "#root/components/ui/separator";
import { Badge } from "#root/components/ui/badge";
import { Alert, AlertDescription } from "#root/components/ui/alert";
import {
  AlertCircle,
  ShoppingCart,
  User,
  MapPin,
  Loader2,
  CreditCard,
  Banknote,
  Wallet,
  Shield,
} from "lucide-react";
import { useMinimalI18n } from "#root/lib/i18n/MinimalI18nContext";

/**
 * Customer information interface
 */
export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone?: string | null;
}

/**
 * Address interface
 */
export interface CheckoutAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
}

/**
 * Order summary item interface
 */
export interface CheckoutOrderSummaryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string | null;
}

/**
 * Checkout totals interface
 */
export interface CheckoutTotals {
  subtotal: number;
  discount?: number;
  shipping?: number;
  grandTotal: number;
}

/**
 * Payment method option from the server
 */
export interface PaymentMethodOption {
  id: string;
  label: string;
  description: string;
}

/**
 * Props for CheckoutPageModernTemplate
 */
export interface CheckoutPageModernTemplateProps {
  customer?: CheckoutCustomerInfo;
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  items: CheckoutOrderSummaryItem[];
  totals: CheckoutTotals;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit?: (formValues: Record<string, string>) => void | Promise<void>;
  onEditCart?: () => void;
  currency?: string;
  /** Available payment methods (fetched from server). If undefined/empty, only COD is shown */
  paymentMethods?: PaymentMethodOption[];
  /** Whether payment methods are loading */
  paymentMethodsLoading?: boolean;
}

/**
 * CheckoutPageModernTemplate Component
 *
 * Modern checkout page layout with form fields, order review and submission
 */
export function CheckoutPageModernTemplate({
  customer,
  shippingAddress,
  billingAddress,
  items = [],
  totals,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
  onEditCart,
  currency = "EGP",
  paymentMethods,
  paymentMethodsLoading = false,
}: CheckoutPageModernTemplateProps) {
  const { t } = useMinimalI18n();
  const [form, setForm] = useState({
    fullName: customer?.name ?? "",
    email: customer?.email ?? "",
    phoneNumber: customer?.phone ?? "",
    address: shippingAddress?.line1 ?? "",
    city: shippingAddress?.city ?? "",
    state: shippingAddress?.state ?? "",
    postalCode: shippingAddress?.postalCode ?? "",
    country: shippingAddress?.country ?? "Egypt",
    notes: "",
    paymentMethod: "cod",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim()) errors.fullName = t("validation.name_required");
    if (!form.email.trim()) {
      errors.email = t("validation.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t("validation.email_invalid");
    }
    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = t("validation.phone_required");
    } else if (!/^[\d\s+()-]{7,20}$/.test(form.phoneNumber.trim())) {
      errors.phoneNumber = t("validation.phone_invalid");
    }
    if (!form.address.trim()) errors.address = t("validation.address_required");
    if (!form.city.trim()) errors.city = t("validation.city_required");
    if (!form.country.trim()) errors.country = t("validation.country_required");

    setFieldErrors(errors);

    // Scroll to first error field
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const el = document.getElementById(firstErrorField!);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit?.(form);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-xl md:text-3xl font-bold mb-8'>
        {t("checkout.title")}
      </h1>

      {errorMessage && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {Object.keys(fieldErrors).length > 0 && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{t("validation.fix_errors")}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Checkout Form */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='w-5 h-5 text-primary' />
                  {t("checkout.customer_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='fullName'>
                      {t("checkout.full_name")}{" "}
                      <span className='text-destructive'>
                        {t("checkout.required")}
                      </span>
                    </Label>
                    <Input
                      id='fullName'
                      placeholder='John Doe'
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className={
                        fieldErrors.fullName ? "border-destructive" : ""
                      }
                    />
                    {fieldErrors.fullName && (
                      <p className='text-sm text-destructive'>
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>
                      {t("checkout.email")}{" "}
                      <span className='text-destructive'>
                        {t("checkout.required")}
                      </span>
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='john@example.com'
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={fieldErrors.email ? "border-destructive" : ""}
                    />
                    {fieldErrors.email && (
                      <p className='text-sm text-destructive'>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phoneNumber'>
                    {t("checkout.phone")}{" "}
                    <span className='text-destructive'>
                      {t("checkout.required")}
                    </span>
                  </Label>
                  <Input
                    id='phoneNumber'
                    type='tel'
                    placeholder='+20 1XX XXX XXXX'
                    value={form.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    className={
                      fieldErrors.phoneNumber ? "border-destructive" : ""
                    }
                  />
                  {fieldErrors.phoneNumber && (
                    <p className='text-sm text-destructive'>
                      {fieldErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='w-5 h-5 text-primary' />
                  {t("checkout.shipping_address")}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='address'>
                    {t("checkout.street")}{" "}
                    <span className='text-destructive'>
                      {t("checkout.required")}
                    </span>
                  </Label>
                  <Input
                    id='address'
                    placeholder='123 Main St, Apt 4B'
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className={fieldErrors.address ? "border-destructive" : ""}
                  />
                  {fieldErrors.address && (
                    <p className='text-sm text-destructive'>
                      {fieldErrors.address}
                    </p>
                  )}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='city'>
                      {t("checkout.city")}{" "}
                      <span className='text-destructive'>
                        {t("checkout.required")}
                      </span>
                    </Label>
                    <Input
                      id='city'
                      placeholder='Cairo'
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={fieldErrors.city ? "border-destructive" : ""}
                    />
                    {fieldErrors.city && (
                      <p className='text-sm text-destructive'>
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='state'>{t("checkout.state")}</Label>
                    <Input
                      id='state'
                      placeholder='Cairo Governorate'
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className={fieldErrors.state ? "border-destructive" : ""}
                    />
                    {fieldErrors.state && (
                      <p className='text-sm text-destructive'>
                        {fieldErrors.state}
                      </p>
                    )}
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='postalCode'>
                      {t("checkout.postal_code")}
                    </Label>
                    <Input
                      id='postalCode'
                      placeholder='11511'
                      value={form.postalCode}
                      onChange={(e) =>
                        updateField("postalCode", e.target.value)
                      }
                      className={
                        fieldErrors.postalCode ? "border-destructive" : ""
                      }
                    />
                    {fieldErrors.postalCode && (
                      <p className='text-sm text-destructive'>
                        {fieldErrors.postalCode}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='country'>
                      {t("checkout.country")}{" "}
                      <span className='text-destructive'>
                        {t("checkout.required")}
                      </span>
                    </Label>
                    <Input
                      id='country'
                      placeholder='Egypt'
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className={
                        fieldErrors.country ? "border-destructive" : ""
                      }
                    />
                    {fieldErrors.country && (
                      <p className='text-sm text-destructive'>
                        {fieldErrors.country}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.order_notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={t("checkout.notes_placeholder")}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            {(() => {
              const methods =
                paymentMethods && paymentMethods.length > 0
                  ? paymentMethods
                  : [
                      {
                        id: "cod",
                        label: "Cash on Delivery",
                        description:
                          "Pay when your order is delivered to your doorstep",
                      },
                    ];
              const showPaymentSection = methods.length > 1;

              if (!showPaymentSection) return null;

              const getPaymentIcon = (id: string) => {
                switch (id) {
                  case "stripe":
                    return <CreditCard className='w-5 h-5' />;
                  case "paymob":
                    return <Wallet className='w-5 h-5' />;
                  default:
                    return <Banknote className='w-5 h-5' />;
                }
              };

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <CreditCard className='w-5 h-5 text-primary' />
                      {t("checkout.payment_method")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethodsLoading ? (
                      <div className='flex items-center justify-center py-4 gap-2 text-muted-foreground'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        {t("checkout.loading_payment")}
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {methods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              form.paymentMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}>
                            <input
                              type='radio'
                              name='paymentMethod'
                              value={method.id}
                              checked={form.paymentMethod === method.id}
                              onChange={(e) =>
                                updateField("paymentMethod", e.target.value)
                              }
                              className='mt-1 accent-primary'
                            />
                            <div className='flex items-start gap-3 flex-1'>
                              <div
                                className={`mt-0.5 ${form.paymentMethod === method.id ? "text-primary" : "text-muted-foreground"}`}>
                                {getPaymentIcon(method.id)}
                              </div>
                              <div className='flex-1'>
                                <p className='font-medium'>{method.label}</p>
                                <p className='text-sm text-muted-foreground'>
                                  {method.description}
                                </p>
                              </div>
                            </div>
                            {method.id !== "cod" && (
                              <div className='flex items-center gap-1 text-xs text-green-600 mt-1'>
                                <Shield className='w-3 h-3' />
                                {t("checkout.secure")}
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <ShoppingCart className='w-5 h-5' />
                    {t("checkout.order_items")} ({items.length})
                  </CardTitle>
                  {onEditCart && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={onEditCart}>
                      {t("checkout.edit_cart")}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='flex justify-between items-center'>
                    <div className='flex-1'>
                      <p className='font-medium'>{item.name}</p>
                      {item.variant && (
                        <p className='text-xs text-muted-foreground'>
                          {item.variant}
                        </p>
                      )}
                      <p className='text-sm text-muted-foreground'>
                        {t("checkout.quantity")}: {item.quantity}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        {currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {currency}
                        {item.price.toFixed(2)} {t("checkout.each")}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <Card className='sticky top-4'>
              <CardHeader>
                <CardTitle>{t("checkout.order_summary")}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>{t("cart.subtotal")}</span>
                    <span>
                      {currency}
                      {totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {totals.discount !== undefined && totals.discount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>{t("cart.discount")}</span>
                      <span>
                        -{currency}
                        {totals.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.shipping !== undefined && (
                    <div className='flex justify-between'>
                      <span>{t("cart.shipping")}</span>
                      <span>
                        {totals.shipping === 0 ? (
                          <Badge variant='secondary'>{t("cart.free")}</Badge>
                        ) : (
                          `${currency} ${totals.shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className='flex justify-between text-base md:text-lg font-bold'>
                  <span>{t("cart.total")}</span>
                  <span>
                    {currency}
                    {totals.grandTotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  type='submit'
                  className='w-full'
                  size='lg'
                  disabled={isSubmitting || items.length === 0}>
                  {isSubmitting ? (
                    <span className='flex items-center gap-2'>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      {t("checkout.processing")}
                    </span>
                  ) : form.paymentMethod === "cod" ? (
                    t("checkout.place_order")
                  ) : (
                    <span className='flex items-center gap-2'>
                      <CreditCard className='w-4 h-4' />
                      {t("checkout.place_order_pay")}
                    </span>
                  )}
                </Button>

                <p className='text-xs text-center text-muted-foreground'>
                  {t("checkout.terms")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
