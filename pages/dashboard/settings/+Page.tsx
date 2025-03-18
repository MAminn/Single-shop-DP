import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import { Input } from "#root/components/ui/input";
import { Label } from "#root/components/ui/label";
import { Button } from "#root/components/ui/button";

export default function Settings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
        <CardDescription>
          Update your store settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" placeholder="Enter store name" />
          </div>

          <div>
            <Label htmlFor="store-logo">Store Logo</Label>
            <Input
              id="store-logo"
              type="file"
              accept="image/*"
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <Input
              id="primary-color"
              type="color"
              className="w-24 h-10 p-1"
              defaultValue="#3b82f6"
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}
