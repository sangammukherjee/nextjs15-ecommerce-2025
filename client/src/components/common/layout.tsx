"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";

const pathsNotToShowHeaders = ["/auth", "/super-admin"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  return (
    <div className="min-h-screen bg-white">
      {showHeader && <Header />}
      <main>{children}</main>
    </div>
  );
}

export default CommonLayout;
