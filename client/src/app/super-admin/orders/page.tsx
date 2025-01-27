"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AdminOrder, useOrderStore } from "@/store/useOrderStore";
import { useEffect } from "react";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

function SuperAdminManageOrdersPage() {
  const { getAllOrders, adminOrders, updateOrderStatus } = useOrderStore();
  const { toast } = useToast();

  console.log(adminOrders);

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  const getStatusColor = (
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED"
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-500";

      case "PROCESSING":
        return "bg-yellow-500";

      case "SHIPPED":
        return "bg-purple-500";

      case "DELIVERED":
        return "bg-green-500";

      default:
        return "bg-gray-500";
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    await updateOrderStatus(orderId, newStatus);
    toast({
      title: "Status updated successfully",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">ORDERS LIST</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No Orders Found
              </TableCell>
            </TableRow>
          ) : (
            adminOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-semibold">{order.id}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{order.total.toFixed(2)}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>
                  {order.items.length}{" "}
                  {order.items.length > 1 ? "Items" : "Item"}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.status}
                    onValueChange={(value) =>
                      handleStatusUpdate(order.id, value as OrderStatus)
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default SuperAdminManageOrdersPage;
