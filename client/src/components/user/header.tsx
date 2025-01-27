"use client";

import { ArrowLeft, Menu, ShoppingBag, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

const navItems = [
  {
    title: "HOME",
    to: "/",
  },
  {
    title: "PRODUCTS",
    to: "/listing",
  },
];

function Header() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [mobileView, setMobileView] = useState<"menu" | "account">("menu");
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const { fetchCart, items } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  const renderMobileMenuItems = () => {
    switch (mobileView) {
      case "account":
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <Button
                onClick={() => setMobileView("menu")}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft />
              </Button>
            </div>
            <nav className="space-y-2">
              <p
                onClick={() => {
                  setShowSheetDialog(false);
                  router.push("/account");
                }}
                className="block cursor-pointer w-full p-2"
              >
                Your Account
              </p>
              <Button
                onClick={() => {
                  setShowSheetDialog(false);
                  setMobileView("menu");
                  handleLogout();
                }}
              >
                Logout
              </Button>
            </nav>
          </div>
        );

      default:
        return (
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              {navItems.map((navItem) => (
                <p
                  className="block w-full font-semibold p-2 cursor-pointer"
                  onClick={() => {
                    setShowSheetDialog(false);
                    router.push(navItem.to);
                  }}
                  key={navItem.title}
                >
                  {navItem.title}
                </p>
              ))}
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => setMobileView("account")}
                className="w-full justify-start"
              >
                <User className="mr-1 h-4 w-4" />
                Account
              </Button>
              <Button
                onClick={() => {
                  setShowSheetDialog(false);
                  router.push("/cart");
                }}
                className="w-full justify-start"
              >
                <ShoppingBag className="mr-1 h-4 w-4" />
                Cart (2)
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <header className="sticky bg-white  top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link className="text-2xl font-bold" href="/">
            ECOMMERCE
          </Link>
          <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <nav className="flex items-center space-x-8">
              {navItems.map((item, index) => (
                <Link
                  href={item.to}
                  key={index}
                  className="text-sm font-semibold hover:text-gray-700"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div
              className="relative cursor-pointer"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {items?.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant={"ghost"}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  Your Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="lg:hidden">
            <Sheet
              open={showSheetDialog}
              onOpenChange={() => {
                setShowSheetDialog(false);
                setMobileView("menu");
              }}
            >
              <Button
                onClick={() => setShowSheetDialog(!showSheetDialog)}
                size="icon"
                variant="ghost"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>ECOMMERCE</SheetTitle>
                </SheetHeader>
                {renderMobileMenuItems()}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
