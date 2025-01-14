"use client";

import { protectCouponFormAction } from "@/actions/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCouponStore } from "@/store/useCouponStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SuperAdminManageCouponsPage() {
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: 0,
    startDate: "",
    endDate: "",
    usageLimit: 0,
  });
  const router = useRouter();
  const { toast } = useToast();
  const { createCoupon, isLoading } = useCouponStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateUniqueCoupon = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    setFormData((prev) => ({
      ...prev,
      code: result,
    }));
  };

  const handleCouponSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      console.log("logging");

      toast({
        title: "End date must be after start date",
        variant: "destructive",
      });

      return;
    }

    const checkCouponFormvalidation = await protectCouponFormAction();
    if (!checkCouponFormvalidation.success) {
      toast({
        title: checkCouponFormvalidation.error,
        variant: "destructive",
      });
      return;
    }

    const couponData = {
      ...formData,
      discountPercent: parseFloat(formData.discountPercent.toString()),
      usageLimit: parseInt(formData.usageLimit.toString()),
    };

    const result = await createCoupon(couponData);
    if (result) {
      toast({
        title: "Coupon added successfully",
      });

      router.push("/super-admin/coupons/list");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1>Create New Coupon</h1>
        </header>
        <form
          onSubmit={handleCouponSubmit}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
        >
          <div className="space-y-4">
            <div>
              <Label>Start Date</Label>
              <Input
                value={formData.startDate}
                onChange={handleInputChange}
                name="startDate"
                type="date"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                value={formData.endDate}
                onChange={handleInputChange}
                name="endDate"
                type="date"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Coupon Code</Label>
              <div className="flex justify-between items-center gap-2">
                <Input
                  type="text"
                  name="code"
                  placeholder="Enter coupon code"
                  className="mt-1.5"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                />
                <Button type="button" onClick={handleCreateUniqueCoupon}>
                  Create Unique Code
                </Button>
              </div>
            </div>
            <div>
              <Label>Discount Percentage</Label>
              <Input
                type="number"
                name="discountPercent"
                placeholder="Enter discount percentage"
                className="mt-1.5"
                required
                value={formData.discountPercent}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Usage Limits</Label>
              <Input
                type="number"
                name="usageLimit"
                placeholder="Enter usage limits"
                className="mt-1.5"
                required
                value={formData.usageLimit}
                onChange={handleInputChange}
              />
            </div>
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? "creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminManageCouponsPage;
