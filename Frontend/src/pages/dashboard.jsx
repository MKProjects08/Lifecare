// src/components/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { analyticsService } from "../services/analyticsService";

const number2 = (v) => {
  if (v === null || v === undefined) return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topCredits, setTopCredits] = useState([]);

  // Month selector
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1–12
  const [monthSales, setMonthSales] = useState([]);

  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    label: "",
    value: 0,
  });

  /* ------------------- Load KPIs & Orders ------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [k, r, c] = await Promise.all([
          analyticsService.getKpis(),
          analyticsService.getRecentOrders(10),
          analyticsService.getTopCredits(5),
        ]);
        setKpis(k);
        setRecentOrders(r);
        setTopCredits(c);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ------------------- Load Sales for Selected Month ------------------- */
  useEffect(() => {
    const loadMonth = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getSalesByMonth(selectedYear, selectedMonth);
        setMonthSales(data);
      } catch (err) {
        setError("Failed to load month sales");
      } finally {
        setLoading(false);
      }
    };
    loadMonth();
  }, [selectedYear, selectedMonth]);

  /* ------------------- Chart Helpers ------------------- */
  const maxY = useMemo(() => {
    return monthSales.reduce((m, d) => Math.max(m, d.total || 0), 0) || 0;
  }, [monthSales]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthName = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  return (
    <div className="p-6 bg-gradient-to-b from-[#F4FAFD] to-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#3F75B0]">Dashboard</h2>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#048dcc] text-white px-4 py-2 rounded-lg hover:bg-[#3F75B0] shadow"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* ==================== KPIs ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Today Sales */}
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#3F75B0]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#3F75B0]">Today Sales</div>
                  <div className="text-2xl font-bold text-gray-800">{number2(kpis?.todaySales)}</div>
                </div>
                <div className="bg-[#E1F2F5] p-3 rounded-full">
                  <svg className="w-5 h-5 text-[#3F75B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v10H5l7 8 7-8h-6V3z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* This Month Sales */}
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#0EA5E9]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#0EA5E9]">This Month Sales</div>
                  <div className="text-2xl font-bold text-gray-800">{number2(kpis?.monthSales)}</div>
                </div>
                <div className="bg-sky-50 p-3 rounded-full">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 8h18M3 21h18M3 13h12"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Credits */}
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#F59E0B]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#B45309]">Total Credits</div>
                  <div className="text-2xl font-bold text-gray-800">{number2(kpis?.totalCredits)}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#EF4444]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#B91C1C]">Pending Payments</div>
                  <div className="text-2xl font-bold text-gray-800">{number2(kpis?.pendingPayments)}</div>
                </div>
                <div className="bg-rose-50 p-3 rounded-full">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Orders Today */}
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#10B981]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#047857]">Orders Today</div>
                  <div className="text-2xl font-bold text-gray-800">{kpis?.ordersToday || 0}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M7 3v8m10-8v8M5 21h14l-2-7H7l-2 7z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Inventory Value */}
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#3F75B0]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#3F75B0]">Total Inventory Value</div>
                  <div className="text-2xl font-bold text-gray-800">{number2(kpis?.totalInventoryValue)}</div>
                </div>
                <div className="bg-[#E1F2F5] p-3 rounded-full">
                  <svg className="w-5 h-5 text-[#3F75B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-5m7 8l-7 7-7-7m14 0H7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== Charts & Lists ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ---------- Month Sales Bar Chart with Selector ---------- */}
            <div className="bg-white shadow rounded p-4 border border-[#E5EFF6] relative">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[#3F75B0]">{currentMonthName} Sales</h2>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    {monthNames.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    min="2020"
                    max="2030"
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-max h-64">
                  {maxY <= 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">No data</div>
                  ) : (
                    <svg
                      width={monthSales.length * 40}
                      height="240"
                      viewBox={`0 0 ${monthSales.length * 40} 240`}
                      className="h-full"
                      onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, label: "", value: 0 })}
                    >
                      <line x1="40" y1="10" x2="40" y2="210" stroke="#cfe5f1" />
                      <line x1="40" y1="210" x2={monthSales.length * 40 - 10} y2="210" stroke="#cfe5f1" />

                      {monthSales.map((d, i) => {
                        const barWidth = 30;
                        const barGap = 10;
                        const x = 40 + i * (barWidth + barGap);
                        const h = Math.round(((d.total || 0) / maxY) * 180);
                        const y = 210 - h;
                        const day = d.date.split("-")[2];

                        return (
                          <g key={d.date}>
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={h}
                              fill="#048dcc"
                              opacity="0.9"
                              rx="3"
                            />
                            <text
                              x={x + barWidth / 2}
                              y={225}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#64748b"
                            >
                              {day}
                            </text>
                            <rect
                              x={x}
                              y={10}
                              width={barWidth}
                              height={200}
                              fill="transparent"
                              onMouseMove={(e) => {
                                const svg = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                                setTooltip({
                                  show: true,
                                  x: e.clientX - svg.left,
                                  y: e.clientY - svg.top,
                                  label: d.date,
                                  value: d.total || 0,
                                });
                              }}
                              onMouseEnter={(e) => {
                                const svg = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                                setTooltip({
                                  show: true,
                                  x: e.clientX - svg.left,
                                  y: e.clientY - svg.top,
                                  label: d.date,
                                  value: d.total || 0,
                                });
                              }}
                              onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, label: "", value: 0 })}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {tooltip.show && (
                <div
                  className="absolute bg-white border border-[#E5EFF6] rounded shadow px-2 py-1 text-xs text-gray-700 pointer-events-none z-10"
                  style={{
                    left: Math.min(tooltip.x + 10, window.innerWidth - 120),
                    top: tooltip.y - 40,
                  }}
                >
                  <div className="font-medium text-[#3F75B0]">{tooltip.label}</div>
                  <div>{number2(tooltip.value)}</div>
                </div>
              )}
            </div>

            {/* ---------- Top Credits ---------- */}
            <div className="bg-white shadow rounded p-4 border border-[#E5EFF6]">
              <h2 className="text-lg font-semibold text-[#3F75B0] mb-3">Top Customers by Credits</h2>
              <div className="divide-y">
                {topCredits.length === 0 ? (
                  <div className="text-gray-400 text-sm py-2">No credit data</div>
                ) : (
                  topCredits.map((c) => (
                    <div key={c.Customer_ID} className="py-2 flex items-center justify-between">
                      <div className="text-sm">{c.pharmacyname}</div>
                      <div className="text-sm font-semibold text-[#0f766e]">{number2(c.credits)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ---------- Recent Orders Table ---------- */}
          <div className="bg-white shadow rounded p-4 border border-[#E5EFF6]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#3F75B0]">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table-auto">
                <thead>
                  <tr className="bg-[#E1F2F5] text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold">Order</th>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Customer</th>
                    <th className="py-3 px-4 text-left font-semibold">Gross Total</th>
                    <th className="py-3 px-4 text-left font-semibold">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">No recent orders</td>
                    </tr>
                  ) : (
                    recentOrders.map((o) => (
                      <tr key={o.Order_ID} className="border-b last:border-0 border-[#E5EFF6] hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{o.FormattedOrderID}</td>
                        <td className="py-3 px-4">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">{o.CustomerName || "-"}</td>
                        <td className="py-3 px-4 font-semibold text-[#134e4a]">{number2(o.gross_total)}</td>
                        <td className="py-3 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            o.paymentstatus?.toLowerCase() === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {o.paymentstatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;