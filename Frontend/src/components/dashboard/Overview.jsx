import React, { useState, useEffect } from "react";
import "../../App.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Label,
  Tooltip,
} from "recharts";
import EmptyTableRecord from "../layout/EmptyTableRecord";

const Overview = () => {
  const [activeTab, setActiveTab] = useState("week");
  const [isMobile, setIsMobile] = useState(false);

  // Hardcoded salesTimeline data for demo
  const salesTimeline = {
    weeklySalesData: {
      Sunday: 800,
      Monday: 1200,
      Tuesday: 1500,
      Wednesday: 1100,
      Thursday: 1600,
      Friday: 1400,
      Saturday: 900,
    },
    monthlySalesData: {
      January: 25000,
      February: 28000,
      March: 32000,
      April: 29000,
      May: 35000,
      June: 38000,
      July: 42000,
      August: 39000,
      September: 41000,
      October: 15000, // Partial for current month
    },
    yearlySalesData: {
      2023: 300000,
      2024: 450000,
      2025: 200000, // Partial for current year
    },
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 (Sun) - 6 (Sat)
  const currentMonthIndex = now.getMonth(); // 0 (Jan) - 11 (Dec)
  const currentYear = now.getFullYear();
  
  const data = {
    week: (() => {
      const allDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const weeklySales = salesTimeline.weeklySalesData || {};
  
      const daysToShow = allDays.slice(0, currentDayIndex + 1);
  
      return daysToShow.map((day) => ({
        name: day,
        income: parseFloat(weeklySales[day]) || 0,
      }));
    })(),
  
    month: (() => {
      const allMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
  
      const monthlySales = salesTimeline.monthlySalesData || {};
  
      const monthsToShow = allMonths.slice(0, currentMonthIndex + 1);
  
      return monthsToShow.map((month) => ({
        name: month,
        income: parseFloat(monthlySales[month]) || 0,
      }));
    })(),
  
    year: (() => {
      const yearlySales = salesTimeline.yearlySalesData || {};
      const availableYears = Object.keys(yearlySales).map((y) => parseInt(y));
  
      if (availableYears.length === 0) return [];
  
      const firstYear = Math.min(...availableYears);
  
      const fullYears = [];
      for (let y = firstYear; y <= currentYear; y++) {
        fullYears.push(y);
      }
  
      return fullYears.map((year) => ({
        name: String(year),
        income: parseFloat(yearlySales[year]) || 0,
      }));
    })(),
  };

  const chartData = data[activeTab];
  const tickWidth = 70;
  const extraPadding = 120; // Increased to ensure Y-axis visibility
  const chartMinWidth = Math.max(350, chartData.length * tickWidth + extraPadding);

  return (
    <div className="py-6 px-4">
      <div className="border border-gray-300 p-5 rounded-lg">
        <div
          className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center"
        >
          <h2 className="text-lg font-semibold text-text1">Sales / Income</h2>
          <div className="flex gap-2.5">
            {["week", "month", "year"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`button ${
                  activeTab === tab ? "active" : "inactive"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="py-2">
          {chartData.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center rounded-md">
              <EmptyTableRecord />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div style={{ minWidth: chartMinWidth }}>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 40, bottom: 10, left: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="15%" stopColor="#05E27E" stopOpacity={0.2} />
                        <stop offset="80%" stopColor="#fff" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#F5F6F8"
                      strokeDasharray="4 none"
                      strokeWidth={3}
                    />
                    <XAxis
                      dataKey="name"
                      type="category"
                      stroke="#656565"
                      strokeWidth={1}
                      padding={{ left: 40, right: 40 }}
                      tick={{
                        fontSize: 10.7,
                        fill: "#656565",
                        fontWeight: 600,
                        color: "#656565",
                      }}
                      interval={0}
                    >
                      <Label
                        value="Time"
                        position="insideBottom"
                        offset={-5}
                        className="font-semibold text-xs text-[#656565] font-inter p-4"
                      />
                    </XAxis>
                    <YAxis
                      stroke="#656565"
                      strokeWidth={1}
                      tick={{ fontSize: 11.5, fill: "#656565", fontWeight: 600 }}
                      tickCount={8}
                      interval={0}
                      label={{
                        value: "Sales (€)",
                        angle: -90,
                        position: "insideLeft",
                        textAnchor: "middle",
                        style: {
                          fill: "#656565",
                          fontWeight: 500,
                          fontSize: "12px",
                        },
                      }}
                    />
                    <Tooltip
                      cursor={{ stroke: 0 }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                      }}
                      labelStyle={{ fontWeight: "bold", color: "#333" }}
                      itemStyle={{ color: "#05E27E", fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#05E27E"
                      strokeWidth={4}
                      fill="url(#gradient)"
                      dot={{ fill: "#05E27E", stroke: "#05E27E", strokeWidth: 3.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;