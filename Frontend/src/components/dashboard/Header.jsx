import React, { useState } from "react";


const Header = () => {
  const [activeTab, setActiveTab] = useState("Day");

  // Hardcoded stats data
  const stats = {
    totalCustomers: {
      daily: 100,
      weekly: 500,
      monthly: 2000,
      yearly: 10000,
    },
    totalSales: {
      daily: 5000,
      weekly: 25000,
      monthly: 100000,
      yearly: 1200000,
    },
    totalCompletedOrders: {
      daily: 50,
      weekly: 250,
      monthly: 1000,
      yearly: 5000,
    },
    totalPendingOrders: {
      daily: 10,
      weekly: 50,
      monthly: 200,
      yearly: 1000,
    },
  };

  // Default Titles
  const baseTitles = [
    "Total customers",
    "Total sales",
    "Completed orders",
    "Pending orders",
  ];

  const values = {
    Day: [
      stats.totalCustomers.daily,
      stats.totalSales?.daily,
      stats.totalCompletedOrders?.daily,
      stats.totalPendingOrders?.daily,
    ],
    Week: [
      stats.totalCustomers.weekly,
      stats.totalSales.weekly,
      stats.totalCompletedOrders.weekly,
      stats.totalPendingOrders.weekly,
    ],
    Month: [
      stats.totalCustomers.monthly,
      stats.totalSales.monthly,
      stats.totalCompletedOrders.monthly,
      stats.totalPendingOrders.monthly,
    ],
    Year: [
      stats.totalCustomers.yearly,
      stats.totalSales.yearly,
      stats.totalCompletedOrders.yearly,
      stats.totalPendingOrders.yearly,
    ],
  };

  return (
    <div className="px-4 py-0.5 overflow-x-hidden">
      <div className="flex flex-col items-start gap-4 w-full md:flex-row md:items-center md:justify-between md:gap-6 pt-4 pb-6">
        <h1 className="font-bold text-text1 whitespace-nowrap text-[24px] sm:text-[26px] md:text-[30px]">Dashboard</h1>
        <div className="flex gap-2.5">
          {["Day", "Week", "Month", "Year"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`button ${activeTab === tab ? "active" : "inactive"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <hr className=" mb-8 border-gray-300" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full">
        {baseTitles.map((title, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 sm:p-6 flex flex-col justify-center"
          >
            <h2 className="text-base font-medium text-text1 text-left">
              {title}
            </h2>
            <p className="text-3xl font-bold text-text1 text-right">
              {title === "Total sales" && "€ "}
              {values[activeTab][index]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Header;