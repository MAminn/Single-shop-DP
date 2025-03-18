import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "#root/components/ui/card";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#root/components/ui/table";
  
  export default function Products() {
    // Placeholder data (to be replaced with API data)
    const products = [
      { id: 1, name: "Blue T-Shirt", price: "$19.99", stock: 50 },
      { id: 2, name: "Black Jeans", price: "$49.99", stock: 25 },
      { id: 3, name: "Red Sneakers", price: "$79.99", stock: 10 },
    ];
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock} in stock</TableCell>
                  <TableCell>
                    <button type="button" className="text-blue-500 hover:underline">
                      Edit
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }