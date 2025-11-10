import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutTemplate,
  ReceiptText,
  Box,
  ShoppingCart,
  ClipboardList,
  Wallet,
  AlertTriangle,
  User,
  Building2,
  Users,
  Settings,
} from "lucide-react";
import logo from "../../assets/logo.png";
import logoName from "../../assets/react.svg";

const adminPaths = [
  "/dashboard",
  "/billing",
  "/products",
  "/sales",
  "/orders",
  "/credits",
  "/alerts",
  "/users",
  "/agencies",
  "/customers",
  "/settings",
];

const rolePermissions = {
  admin: adminPaths,
  Owner: adminPaths,
  worker: [
  "/dashboard",
  "/billing",
  "/products",
  "/orders",
  "/alerts",
  "/settings",
  ],
};

const ALL_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutTemplate },
  { path: "/billing", label: "Billing", icon: ReceiptText },
  { path: "/products", label: "Products", icon: Box },
  { path: "/sales", label: "Sales", icon: ShoppingCart },
  { path: "/orders", label: "Orders", icon: ClipboardList },
  { path: "/credits", label: "Credits", icon: Wallet },
  { path: "/alerts", label: "Alerts", icon: AlertTriangle },
  { path: "/users", label: "Users", icon: User },
  { path: "/agencies", label: "Agencies", icon: Building2 },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

const SideNavBar = ({ userRole = "worker" }) => {
  const location = useLocation();

  const allowedPaths = rolePermissions[userRole] || [];
  const itemsToShow = ALL_ITEMS.filter((i) => allowedPaths.includes(i.path));

  const makeHref = (path) => {
    if (path === "/dashboard" && userRole === "worker") return "/worker-dashboard";
    return path; // absolute paths like /products
  };

  const isActive = (href) => {
    if (href === "/worker-dashboard") return location.pathname === "/worker-dashboard";
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div
      className="
        w-58
       md:bg-[#E1F2F5]
        top-0 h-screen transition-all duration-300 overflow-y-auto z-10 
      "
    >
      <div>
        {/* Logo Section - always render on md and up */}
        <div className="hidden md:block px-4 py-4 border-gray-200 h-full">
          <div className="flex items-center gap-0 mb-2 mt-2 ml-3">
            <img src={logo} alt="Logo" className="transition-all w-30 h-15 ml-1" />
          </div>
          
        <hr className="border-gray-500" />
        </div>


        {/* Navigation Links */}
        <nav className="px-4 space-y-3">
          {itemsToShow.map((item) => {
            const href = makeHref(item.path);
            const active = isActive(href);
            return (
              <div key={item.path} className="relative">
                <Link
                  id={href}
                  to={href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    active ? "bg-[#3F75B0] text-white shadow-lg" : "text-[#3F75B0] hover:bg-gray-200"
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 transition-all ${
                      active ? "text-[#05E27E] text-[15px]" : "text-[#059e40] text-[15px]"
                    }`}
                  />
                  <span className="ml-3 text-base font-medium">{item.label}</span>
                </Link>

              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SideNavBar;