"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function UserCartPage() {
  const {
    fetchCart,
    items,
    isLoading,
    updateCartItemQuantity,
    removeFromCart,
  } = useCartStore();
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    setIsUpdating(true);
    await updateCartItemQuantity(id, Math.max(1, newQuantity));
    setIsUpdating(false);
  };

  const handleRemoveItem = async (id: string) => {
    setIsUpdating(true);
    await removeFromCart(id);
    setIsUpdating(false);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">YOUR CART</h1>
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-4">PRODUCT</th>
                <th className="text-right py-4 px-4">PRICE</th>
                <th className="text-center py-4 px-4">QUANTITY</th>
                <th className="text-right py-4 px-4">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover"
                      />
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-700">
                        Color: {item.color}
                      </p>
                      <p className="text-sm text-gray-700">Size: {item.size}</p>
                      <Button
                        disabled={isUpdating}
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sm text-white hover:text-white mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        variant={"outline"}
                        size={"icon"}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-16 text-center"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            item.id,
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <Button
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        variant={"outline"}
                        size={"icon"}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-end">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">TOTAL</span>
              <span className="font-bold ml-4">${total}</span>
            </div>
            <Button
              onClick={() => router.push("/checkout")}
              className="w-full bg-black text-white"
            >
              PROCEED TO CHECKOUT
            </Button>
            <Button
              onClick={() => router.push("/listing")}
              className="w-full mt-2"
              variant="outline"
            >
              CONTINUE SHOPPING
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCartPage;
