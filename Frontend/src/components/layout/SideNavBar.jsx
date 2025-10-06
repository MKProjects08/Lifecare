import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HeroiconsInboxArrowDownSolid,
  MdiCouponOutline,
} from "../../assets/icons/icons";
import {
  LayoutTemplate,
  ClipboardList,
  Globe,
  Box,
  ArrowRightLeft,
  User,
  Users,
  GalleryVerticalEnd,
  Component,
} from "lucide-react";
import logo from "../../assets/react.svg";
import logoName from "../../assets/react.svg";

const SideNavBar = () => {
  const location = useLocation();

  const handleNavClick = (to) => {
    if (window.innerWidth < 768) {
      // Custom event to notify parent to hide sidebar
      const event = new CustomEvent('hideSidebar');
      window.dispatchEvent(event);
    }
  };

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutTemplate },
    { path: "/Biling", label: "Billing", icon: ClipboardList },
    {
      path: "/products",
      label: "Products",
      icon:  Box
    },
    { path: "/brands", label: "Sales", icon: Component },
    { path: "/Orders", label: "Orders", icon: ClipboardList },
    { path: "/brands", label: "Credits", icon: Component },
    { path: "/brands", label: "Alerts", icon: Component },
    { path: "/customers", label: "Users", icon: User },
    { path: "/customers", label: "Agencies", icon: User },
    { path: "/customers", label: "Customers", icon: User },
    
   
    { path: "/manageUsers", label: "Settings", icon: Users },
  ];

  return (
    <div
      className="
        w-52
        bg-white md:bg-[#E5E7EB]
        top-0 h-screen transition-all duration-300 overflow-y-auto z-10
      "
    >
      <div className="">
        {/* Logo Section - always render on md and up */}
        <div className="hidden md:block px-4 py-4 border-gray-200 h-full">
          <div className="flex items-center gap-0 mb-2 mt-2 ml-3">
            <img
              src={logo}
              alt="Bereload Logo"
              className="transition-all w-10 h-10 ml-1"
            />
            <img src={logoName} alt="Bereload Name" className="w-23 h-8" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 space-y-3">
          {navigationItems.map((item) => {
            const isActive =
              item.path === "/products"
                ? location.pathname.startsWith("/products")
                : location.pathname === item.path;
            return (
              <div key={item.path} className="relative">
                <Link
                  id={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#111827] text-[#05E27E] shadow-lg"
                      : "text-gray-900 hover:bg-gray-200"
                  }`}
                  onClick={() => handleNavClick(item.path)}
                >
                  <item.icon
                    className={`w-6 h-6 transition-all ${
                      isActive ? "text-[#05E27E]" : "text-gray-900"
                    }`}
                  />

                  <span className="ml-3 text-base font-medium">
                    {item.label}
                  </span>
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