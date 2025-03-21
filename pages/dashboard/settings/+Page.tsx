import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Button } from "#root/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#root/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import { Textarea } from "#root/components/ui/textarea";
import { Switch } from "#root/components/ui/switch";
import {
  CreditCard,
  Truck,
  Store,
  Bell,
  PaintBucket,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "#root/components/ui/separator";

export default function Settings() {
  const [saveStatus, setSaveStatus] = useState<
    null | "saving" | "success" | "error"
  >(null);

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Separator className="my-6" />

      <Tabs
        defaultValue="profile"
        className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0"
      >
        <div className="lg:w-1/5 h-full">
          <TabsList className="grid w-full grid-cols-1  h-full">
            <TabsTrigger value="profile" className="justify-start">
              <Store className="h-4 w-4 mr-2" />
              Store Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="justify-start">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="payment" className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="shipping" className="justify-start">
              <Truck className="h-4 w-4 mr-2" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start">
              <PaintBucket className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="legal" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="security" className="justify-start">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 lg:max-w-3xl">
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Store Profile</CardTitle>
                <CardDescription>
                  Update your store details and how they appear to customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="Trendy Threads" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-description">Store Description</Label>
                  <Textarea
                    id="store-description"
                    placeholder="Tell customers about your store"
                    className="min-h-24"
                    defaultValue="We sell the latest fashion trends at affordable prices."
                  />
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Contact Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      defaultValue="contact@trendythreads.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Contact Phone</Label>
                    <Input
                      id="store-phone"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-logo">Store Logo</Label>
                  <Input
                    id="store-logo"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-banner">Store Banner</Label>
                  <Input
                    id="store-banner"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-address">Store Address</Label>
                  <Textarea
                    id="store-address"
                    placeholder="Physical store address (if applicable)"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="marketing" />
                  <Label htmlFor="marketing">Receive marketing emails</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure how you receive payments from the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Default Payment Method</Label>
                  <Select defaultValue="bank">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-holder">Account Holder Name</Label>
                  <Input id="account-holder" defaultValue="John Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number / IBAN</Label>
                  <Input
                    id="account-number"
                    defaultValue="XXXX-XXXX-XXXX-1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input id="bank-name" defaultValue="Bank of America" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swift-code">SWIFT/BIC Code</Label>
                  <Input id="swift-code" defaultValue="BOFAUS3N" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / SSN</Label>
                  <Input id="tax-id" defaultValue="XXX-XX-1234" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="automatic-payout" defaultChecked />
                  <Label htmlFor="automatic-payout">Automatic payouts</Label>
                </div>

                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Current commission rate: 15% per sale. Payouts are processed
                    every 2 weeks for all cleared transactions.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Settings</CardTitle>
                <CardDescription>
                  Configure how your products are shipped to customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Shipping Methods</Label>
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Standard Shipping</h4>
                        <p className="text-sm text-muted-foreground">
                          3-5 business days
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          defaultValue="5.99"
                          className="w-24"
                        />
                        <Switch id="standard-active" defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Express Shipping</h4>
                        <p className="text-sm text-muted-foreground">
                          1-2 business days
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          defaultValue="12.99"
                          className="w-24"
                        />
                        <Switch id="express-active" defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Free Shipping</h4>
                        <p className="text-sm text-muted-foreground">
                          On orders over $50
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          defaultValue="50"
                          className="w-24"
                        />
                        <Switch id="free-active" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Locations</Label>
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Domestic</h4>
                        <p className="text-sm text-muted-foreground">
                          United States
                        </p>
                      </div>
                      <Switch id="domestic-active" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">International</h4>
                        <p className="text-sm text-muted-foreground">
                          Worldwide shipping
                        </p>
                      </div>
                      <Switch id="international-active" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-notes">Shipping Notes</Label>
                  <Textarea
                    id="shipping-notes"
                    placeholder="Special instructions for shipping your products"
                    defaultValue="Fragile items are packaged with extra care."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control when and how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-order" className="flex-1">
                        New order received
                      </Label>
                      <Switch id="new-order" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="stock-alert" className="flex-1">
                        Low stock alerts
                      </Label>
                      <Switch id="stock-alert" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="review-received" className="flex-1">
                        Customer review received
                      </Label>
                      <Switch id="review-received" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="payment-success" className="flex-1">
                        Payment received
                      </Label>
                      <Switch id="payment-success" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketplace-updates" className="flex-1">
                        Marketplace updates and announcements
                      </Label>
                      <Switch id="marketplace-updates" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">SMS Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-orders" className="flex-1">
                        Critical order alerts
                      </Label>
                      <Switch id="sms-orders" />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-account" className="flex-1">
                        Security alerts
                      </Label>
                      <Switch id="sms-account" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-number">SMS Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Store Appearance</CardTitle>
                <CardDescription>
                  Customize how your store looks to customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="store-theme">Store Theme</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand Colors</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="primary-color"
                          type="color"
                          className="w-10 h-10 p-1"
                          defaultValue="#3b82f6"
                        />
                        <Input defaultValue="#3b82f6" className="font-mono" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          className="w-10 h-10 p-1"
                          defaultValue="#10b981"
                        />
                        <Input defaultValue="#10b981" className="font-mono" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Store Layout</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary flex items-center justify-center bg-gray-50 h-32 relative">
                      <div className="w-16 h-16 bg-blue-100 rounded-md"></div>
                      <div className="absolute bottom-2 right-2">
                        <Switch id="grid-layout" defaultChecked />
                      </div>
                      <p className="absolute bottom-2 left-2 text-sm font-medium">
                        Grid
                      </p>
                    </div>

                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary flex items-center justify-center bg-gray-50 h-32 relative">
                      <div className="w-20 h-8 bg-blue-100 rounded-md"></div>
                      <div className="absolute bottom-2 right-2">
                        <Switch id="list-layout" />
                      </div>
                      <p className="absolute bottom-2 left-2 text-sm font-medium">
                        List
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Preview Store</Button>
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Legal Information</CardTitle>
                <CardDescription>
                  Manage the legal policies for your store.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="terms-conditions">Terms & Conditions</Label>
                  <Textarea
                    id="terms-conditions"
                    className="min-h-32"
                    placeholder="Your store's terms and conditions"
                    defaultValue="By purchasing from our store, customers agree to the following terms..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy-policy">Privacy Policy</Label>
                  <Textarea
                    id="privacy-policy"
                    className="min-h-32"
                    placeholder="Your store's privacy policy"
                    defaultValue="We collect personal information for the following purposes..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return-policy">Return & Refund Policy</Label>
                  <Textarea
                    id="return-policy"
                    className="min-h-32"
                    placeholder="Your store's return and refund policy"
                    defaultValue="Items can be returned within 30 days of purchase..."
                  />
                </div>

                <div className="space-y-2 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Important: Ensure your legal policies comply with local laws
                    and regulations. Consider consulting with a legal
                    professional before finalizing these documents.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security options for your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Enable 2FA</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Login Sessions</h3>
                  <div className="border rounded-md divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Current Session</h4>
                        <p className="text-sm text-muted-foreground">
                          Windows 10 • Chrome • New York, USA
                        </p>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Active Now
                      </div>
                    </div>

                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Mobile App</h4>
                        <p className="text-sm text-muted-foreground">
                          iOS 15 • Safari • Chicago, USA
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">API Access</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">API Access</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow third-party applications to access your store data
                      </p>
                    </div>
                    <Switch id="api-access" defaultChecked />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">API Key</h4>
                        <p className="font-mono text-sm mt-1">
                          ••••••••••••••••••••••••
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip-whitelist">IP Whitelist (Optional)</Label>
                  <Textarea
                    id="ip-whitelist"
                    placeholder="Enter allowed IP addresses, one per line"
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to allow access from any IP address
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
