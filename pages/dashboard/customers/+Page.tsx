import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "#root/components/ui/card";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#root/components/ui/table";
  
  export default function Customers() {
    // Placeholder data (to be replaced with API data)
    const customers = [
      { id: 1, name: "John Doe", email: "john@example.com", orders: 5 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 12 },
      { id: 3, name: "Alice Johnson", email: "alice@example.com", orders: 8 },
    ];
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            Manage and view your customer details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>
                    <button type="button" className="text-blue-500 hover:underline">
                      View Details
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