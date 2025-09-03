import { Footer } from '#root/components/globals/Footer';
import { Link } from '#root/components/Link';
import { Badge } from '#root/components/ui/badge';
import { Button } from '#root/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#root/components/ui/card';
import { Input } from '#root/components/ui/input';
import { Separator } from '#root/components/ui/separator';
import { CreditCard, Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { TemplateData, CartTemplateData } from '../../templateRegistry';

interface ModernCartTemplateProps {
  data?: TemplateData;
}

export const ModernCartTemplate: React.FC<ModernCartTemplateProps> = ({ data }) => {
  // Type guard to ensure we have cart data
  const cartData = data as CartTemplateData | undefined;
  const [items, setItems] = useState(cartData?.items || []);
  const [promoCode, setPromoCode] = useState(cartData?.promoCode?.code || '');
  const [appliedPromo, setAppliedPromo] = useState(cartData?.promoCode?.code || '');
  const [discount, setDiscount] = useState(cartData?.discount || 0);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    // Simple promo code logic - in real app, this would call an API
    if (promoCode === 'SAVE10') {
      setDiscount(subtotal * 0.1);
      setAppliedPromo(promoCode);
    } else if (promoCode === 'SAVE20') {
      setDiscount(subtotal * 0.2);
      setAppliedPromo(promoCode);
    } else {
      setDiscount(0);
      setAppliedPromo('');
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedPromo('');
    setDiscount(0);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartData?.shipping || (subtotal > 100 ? 0 : 10);
  const tax = cartData?.tax || (subtotal * 0.08);
  const total = subtotal + shipping + tax - discount;

  if (cartData?.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <Card className="text-center py-16 shadow-lg">
            <CardContent>
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle className="text-xl">Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {items.map((item, index) => (
                    <div key={item.id}>
                      <div className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            <img
                              src={item.imageUrl || item.images?.[0]?.url || ''}
                              alt={item.name}
                              className="h-24 w-24 object-cover rounded-lg shadow-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {Object.entries(item.selectedOptions || {}).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-sm">
                                  {key}: {value}
                                </Badge>
                              ))}
                              <Badge variant="secondary" className="text-sm">
                                {item.categoryName}
                              </Badge>
                              <Badge variant="outline" className="text-sm">
                                {item.vendorName}
                              </Badge>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border rounded-lg bg-white shadow-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-10 w-10 p-0 hover:bg-gray-100"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-10 w-10 p-0 hover:bg-gray-100"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < items.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Promo Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 rounded-full p-2">
                          <Tag className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">Code Applied: {appliedPromo}</p>
                          <p className="text-green-600">You saved ${discount.toFixed(2)}!</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removePromoCode}
                        className="text-green-700 hover:text-green-900"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        onClick={applyPromoCode}
                        className="bg-green-600 hover:bg-green-700 text-white px-6"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-3">
                    Try: <code className="bg-gray-100 px-2 py-1 rounded text-green-600 font-mono">SAVE10</code> or{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-green-600 font-mono">WELCOME20</code>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-8">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Shipping</span>
                      </div>
                      <span className="font-semibold">
                        {shipping === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                  
                  {subtotal < 100 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                      <p className="text-sm text-blue-800">
                        <strong>Free shipping</strong> on orders over $100!
                        Add <strong>${(100 - subtotal).toFixed(2)}</strong> more to qualify.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 mt-6">
                    <Link href="/checkout">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold shadow-lg">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ModernCartTemplate;