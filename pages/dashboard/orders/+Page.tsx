import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "#root/components/ui/card";
  import { Badge } from "#root/components/ui/badge";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#root/components/ui/table";
  
  export default function Orders() {
    // Placeholder data (to be replaced with API data)
    const orders = [
      { id: 1, date: "2023-10-01", total: "$120.00", status: "Shipped" },
      { id: 2, date: "2023-10-05", total: "$89.99", status: "Processing" },
      { id: 3, date: "2023-10-10", total: "$45.50", status: "Delivered" },
    ];
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            View and manage your recent orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "Shipped" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
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