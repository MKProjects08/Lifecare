import React, { useState, useEffect } from "react";
import Overview from "../components/dashboard/Overview";
import Header from "../components/dashboard/Header";
import StockProduct from "../components/dashboard/StockProduct";
import Loading from "../components/layout/Loading";
import { BRANDLIST } from "../constants/FetchConstant.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hardcoded response for demo - simulates successful dashboard data fetch
        const response = {
          success: true,
          data: {
            stats: {
              totalOrders: 1250,
              totalRevenue: "$45,230",
              totalCustomers: 890,
              totalProducts: 450,
            },
            salesTimeline: [
              { month: "Jan", revenue: 12000 },
              { month: "Feb", revenue: 15000 },
              { month: "Mar", revenue: 18000 },
              { month: "Apr", revenue: 20000 },
              { month: "May", revenue: 22000 },
              { month: "Jun", revenue: 25000 },
            ],
            salesProducts: {
              category1: 300,
              category2: 250,
              category3: 200,
            },
            topSellingProducts: [
              { name: "Product A", sales: 150, revenue: "$5,000" },
              { name: "Product B", sales: 120, revenue: "$4,200" },
              { name: "Product C", sales: 100, revenue: "$3,500" },
            ],
            productStock: {
              inStock: 350,
              lowStock: 50,
              outOfStock: 10,
            },
            onboardedDevices: {
              total: 1200,
              active: 950,
              inactive: 250,
            },
            brands: [
              { id: 1, name: "Brand X", products: 100 },
              { id: 2, name: "Brand Y", products: 80 },
              { id: 3, name: "Brand Z", products: 60 },
            ],
          },
        };

        if (!response.success) {
          toast.error(
            response.message ||
              "Failed to fetch dashboard data. Please try again."
          );
          setError(response.message);
          setDashboardData({
            stats: {},
            salesTimeline: {},
            salesProducts: {},
            topSellingProducts: {},
            productStock: {},
            onboardedDevices: {},
            brands: [],
          });
        } else {
          setDashboardData(response.data);
        }
      } catch (err) {
        toast.error(
          "Something went wrong while fetching dashboard data. Please try again."
        );
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500">
        <Loading />
      </div>
    );
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className=" mx-auto">
        <Header stats={dashboardData.stats} />
        <Overview salesTimeline={dashboardData.salesTimeline} />
        <StockProduct
          brandNames={BRANDLIST}
          salesProducts={dashboardData.salesProducts}
          topSellingProductsData={dashboardData.topSellingProducts}
          productStock={dashboardData.productStock}
          onboardedDevices={dashboardData.onboardedDevices}
          brands={dashboardData.brands}
        />
      </div>
    </div>
  );
};

export default Dashboard;