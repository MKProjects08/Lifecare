import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideNavBar from "./SideNavBar";
import menu from "../../assets/admin/menu-left.svg";
import logo from "../../assets/react.svg";
import logoName from "../../assets/react.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//const API_BASE_URL = "http://localhost:3000/api"; // Hardcoded for demo

const AdminLayout = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "worker";

  const user = {
    userName: username,
    role,
  };

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  const handleSignOut = async () => {
    try {
      const response = { ok: true };
      if (response.ok) {
        toast.success("Signed out successfully");
      } else {
        toast.error("Server failed to log out");
      }
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate("/signin");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const response = { ok: true };
        if (!response.ok) throw new Error("Unauthorized");
      } catch (error) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/signin");
      }
    };

    checkAuthAndLoadData();
  }, []);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white no-scrollbar">
      {/* Desktop sidebar - always visible, full height */}
      <div className="relative overflow-visible hidden md:block flex-shrink-0 w-52">
        <SideNavBar userRole={user.role} />
      </div>
      {/* Main content area - full remaining width */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300 main-container overflow-x-hidden w-full">
        {/* Fixed Header - full width */}
        <header className="h-16 bg-white px-4 sm:px-10 shadow-md flex items-center justify-between sticky top-0 z-10 w-full">
          {/* Left section with logo */}
          <div className="flex items-center py-4.5">
            <span className="flex items-center">
              <img
                src={menu}
                alt="Bereload Logo"
                className="w-8 h-8 ml-1"
              />
              {/* <img
                src={logoName}
                alt="Bereload Name"
                className="h-6 ml-1"
              /> */}
            </span>
          </div>

          {/* Profile Section */}
          <div className="relative px-2">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={toggleDropdown}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {/* Profile Picture/Initials */}
              <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-sm">
                {user.userName[0]?.toUpperCase() || ""}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm text-text1 font-medium">
                  {user.userName}
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownVisible && (
              <div className="fixed inset-0 bg-black bg-opacity-25 z-50 w-full">
                <div
                  ref={dropdownRef}
                  className="absolute top-16 right-4 sm:right-20 bg-white rounded-md w-40 z-60"
                >
                  <div
                    className="px-4 py-3 text-gray-700 font-normal text-left text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setIsDropdownVisible(false);
                      handleSignOut();
                    }}
                  >
                    Sign out
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
        {/* Main content - scrollable area below the fixed header, full width */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-white w-full ">
          <Outlet /> {/* Replace children with Outlet */}
        </main>
        <ToastContainer
          position="top-right z-40"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </div>
  );
};

export default AdminLayout;