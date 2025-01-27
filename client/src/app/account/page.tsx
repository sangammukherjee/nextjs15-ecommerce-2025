"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Address, useAddressStore } from "@/store/useAddressStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useEffect, useState } from "react";

const initialAddressFormState = {
  name: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  phone: "",
  isDefault: false,
};

function UserAccountPage() {
  const {
    isLoading: addressesLoading,
    addresses,
    error: addressesError,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useAddressStore();
  const [showAddresses, setShowAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialAddressFormState);
  const { toast } = useToast();
  const { userOrders, getOrdersByUserId, isLoading } = useOrderStore();

  useEffect(() => {
    fetchAddresses();
    getOrdersByUserId();
  }, [fetchAddresses, getOrdersByUserId]);

  console.log(userOrders, "userOrders");

  const handleAddressSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (editingAddress) {
        const result = await updateAddress(editingAddress, formData);
        if (result) {
          fetchAddresses();
          setEditingAddress(null);
        }
      } else {
        const result = await createAddress(formData);
        if (result) {
          fetchAddresses();
          toast({
            title: "Address created successfully",
          });
        }
      }

      setShowAddresses(false);
      setFormData(initialAddressFormState);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      country: address.country,
      phone: address.phone,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });

    setEditingAddress(address.id);
    setShowAddresses(true);
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you wanna delete this address?"
    );

    if (confirmed) {
      try {
        const success = await deleteAddress(id);
        if (success) {
          toast({
            title: "Address is deleted successfully",
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  console.log(addresses);

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

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">MY ACCOUNT</h1>
        </div>
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">Order History</h2>
                {userOrders.length === 0 && (
                  <h1 className="text-2xl font-bold">
                    You havn't placed an Order yet.
                  </h1>
                )}

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {order.items.length}{" "}
                            {order.items.length > 1 ? "Items" : "Item"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getStatusColor(order.status)}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="addresses">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Addresses</h2>
                  <Button
                    onClick={() => {
                      setEditingAddress(null);
                      setFormData(initialAddressFormState);
                      setShowAddresses(true);
                    }}
                  >
                    Add a New Address
                  </Button>
                </div>
                {addressesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
                  </div>
                ) : showAddresses ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          })
                        }
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            city: e.target.value,
                          })
                        }
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            country: e.target.value,
                          })
                        }
                        placeholder="Enter your country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder="Enter your Postal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Enter your phone"
                      />
                      <div>
                        <Checkbox
                          id="default"
                          checked={formData.isDefault}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              isDefault: checked as boolean,
                            })
                          }
                        />
                        <Label className="ml-3" htmlFor="default">
                          Set as default address
                        </Label>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">
                          {editingAddress ? "Update" : "Add"} Address
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddresses(false);
                            setEditingAddress(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <Card key={address.id}>
                        <CardContent className="p-5">
                          <div className="flex flex-col mb-5 justify-between items-start">
                            <p className="font-medium">{address.name}</p>
                            <p className="mb-2 font-bold">{address.address}</p>
                            <p className="mb-2">
                              {address.city}, {address.country},{" "}
                              {address.postalCode}
                            </p>
                            {address.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="space-x-2">
                            <Button
                              onClick={() => handleEditAddress(address)}
                              variant={"outline"}
                              size={"sm"}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteAddress(address.id)}
                              variant={"destructive"}
                              size={"sm"}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default UserAccountPage;
