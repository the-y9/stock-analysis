import { useState, useMemo } from "react";
import { Menu } from "lucide-react";
import NavSidebar from "./NavSidebar";
import SideBar from "../components/SideBar";
import DataListCard from "../components/RecentTiles";
import GenericLineChart from "../components/GenericLineChart";
import GenericStatsCards from "../components/GenericStatsCard";
import GenericPieChart from "../components/GenericPieChart";
import Dropdown from "../components/Dropdown";
import { useStockData } from "../context/StockDataContext";

const dateForm = "default";

const changeForm = (final, initial) => {
  if (initial === 0) return "";
  const change = (((final - initial) / initial) * 100).toFixed(2);
  return change > 0 ? `+${change}%` : `${change}%`;
};

const getIntervalKey = (dateStr, interval) => {
  const date = new Date(dateStr);
  switch (interval) {
    case "daily":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "weekly": {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);
      return startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    case "monthly":
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    case "yearly":
      return `${date.getFullYear()}`;
    default:
      return date.toLocaleDateString();
  }
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interval, setInterval] = useState("daily");
  const [pieGroupBy, setPieGroupBy] = useState("category");

  // ✅ Get data and refetch from context
  const { stockData, loading, fetchData, lastFetched } = useStockData();

  // --- ✅ Build Product Lookup Map ---
  const productMap = useMemo(() => {
    const map = {};
    stockData.products.forEach((p) => {
      map[p.stock_no] = p;
    });
    return map;
  }, [stockData.products]);

  // --- ✅ Merge Stock In & Out Data ---
  const processedData = useMemo(() => {
    const { stockin, stockout } = stockData;

    const combined = [
      ...stockin.map((s) => ({ ...s, type: "in" })),
      ...stockout.map((s) => ({ ...s, type: "out" })),
    ];

    return combined.map((entry) => {
      const productInfo = productMap[entry.product];
      return {
        timestamp: entry.date,
        product: productInfo?.product_name || entry.product,
        qty: entry.qty,
        rate: entry.rate,
        type: entry.type,
        value: entry.qty * entry.rate,
      };
    });
  }, [stockData, productMap]);

  // --- ✅ Chart Data ---
  const chartData = useMemo(() => {
    const grouped = {};
    processedData.forEach((item) => {
      const date = new Date(item.timestamp);
      const key = getIntervalKey(date, interval);

      if (!grouped[key])
        grouped[key] = {
          timestamp: key
        };

        if (item.type === "in") {
          grouped[key].stockIn = (grouped[key].stockIn || 0) + item.qty;
          grouped[key].valueIn = (grouped[key].valueIn || 0) + item.value;
        } else if (item.type === "out") {
          grouped[key].stockOut = (grouped[key].stockOut || 0) + item.qty;
          grouped[key].valueOut = (grouped[key].valueOut || 0) + item.value;
        }
    });
    // Filter out intervals that have neither stockIn nor stockOut
  return Object.values(grouped).filter(
    (entry) => entry.stockIn !== undefined || entry.stockOut !== undefined
  );
  }, [processedData, interval]);

  // --- ✅ Stats Cards ---
  const statsData = useMemo(() => {
    if (!stockData) return [];

    const groupByInterval = (arr) => {
      const grouped = {};
      arr.forEach((item) => {
        const key = getIntervalKey(item.date, interval);
        if (!grouped[key]) grouped[key] = 0;
        grouped[key] += item.qty;
      });
      return grouped;
    };

    const inByInterval = groupByInterval(stockData.stockin);
    const outByInterval = groupByInterval(stockData.stockout);

    const inKeys = Object.keys(inByInterval).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const outKeys = Object.keys(outByInterval).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const totalIn = inKeys.length
      ? inByInterval[inKeys[inKeys.length - 1]]
      : 0;
    const prevIn = inKeys.length > 1
      ? inByInterval[inKeys[inKeys.length - 2]]
      : 0;

    const totalOut = outKeys.length
      ? outByInterval[outKeys[outKeys.length - 1]]
      : 0;
    const prevOut = outKeys.length > 1
      ? outByInterval[outKeys[outKeys.length - 2]]
      : 0;

    const totalStock = stockData.currentstock.reduce(
      (sum, p) => sum + p.qty,
      0
    );
    const totalValue = stockData.currentstock
      .reduce((sum, p) => sum + p.qty * p.rate, 0)
      .toFixed(2);

    return [
      { label: "Total Unique Products", value: stockData.products.length },
      { label: "Total Stock Volume", value: totalStock },
      { label: "Total Stock Value", value: `₹ ${totalValue}` },
      {
        label: "Total Stock In",
        value: totalIn,
        change: changeForm(totalIn, prevIn),
      },
      {
        label: "Total Stock Out",
        value: totalOut,
        change: changeForm(totalOut, prevOut),
      },
    ];
  }, [stockData, interval]);

  // --- ✅ Pie Chart Data ---
  const pieData = useMemo(() => {
    const grouped = {};

    stockData.currentstock.forEach((item) => {
      const product = stockData.products.find(
        (p) => p.stock_no === item.id
      );

      let key;
      if (pieGroupBy === "category") {
        key = product?.category || "Other";
      } else {
        key = product?.product_name || item.id;
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += item.qty;
    });

    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }, [stockData.currentstock, stockData.products, pieGroupBy]);

  // --- ⏳ Handle Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading stock data...
      </div>
    );
  }

  // --- ✅ Recent Transactions ---
  const recentStockIn = stockData.stockin
    .slice(-3)
    .reverse()
    .map((s) => ({
      id: s.id,
      label:
        stockData.products.find((p) => p.stock_no === s.product)
          ?.product_name || s.product,
      subtitle: `Qty: ${s.qty} · ${s.date}`,
    }));

  const recentStockOut = stockData.stockout
    .slice(-3)
    .reverse()
    .map((s) => ({
      id: s.id,
      label:
        stockData.products.find((p) => p.stock_no === s.product)
          ?.product_name || s.product,
      subtitle: `Qty: ${s.qty} · ${s.date}`,
      value: s.to_whom,
    }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Inventory"
        navComponent={NavSidebar}
        footerContent="👤 Profile Settings"
        width="w-72"
        bgColor="bg-gray-50"
        borderColor="border-gray-200"
        textColor="text-blue-700"
        footerTextColor="text-gray-600"
        additionalComponentUp={lastFetched && (<div className="flex justify-between items-center mb-4">
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {new Date(lastFetched).toLocaleTimeString()}
          </p>
          <button
          onClick={fetchData}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Refresh
          </button>
          </div>
        )}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        {/* --- Header --- */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString(dateForm, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            
          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <Dropdown />
            
          </div>
        </div>

        {/* --- Stats --- */}
        <GenericStatsCards stats={statsData} />

        {/* --- Interval Controls --- */}
        <div className="flex gap-2 mb-4">
          {["daily", "weekly", "monthly", "yearly"].map((option) => (
            <button
              key={option}
              onClick={() => setInterval(option)}
              className={`px-3 py-1 rounded ${
                interval === option
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* --- Charts and Lists --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericLineChart
            title="Stock In vs Stock Out (Qty)"
            data={chartData}
            dataKeyX="timestamp"
            lines={[
              { key: "stockIn", label: "Stock In" },
              { key: "stockOut", label: "Stock Out" },
            ]}
            rightAxis={false}
            interval={interval}
          />

          <GenericPieChart
            title="Stock Volume by&nbsp;"
            data={pieData}
            pieGroupBy={pieGroupBy}
            setPieGroupBy={setPieGroupBy}
          />

          <DataListCard
            title="Recent Stock In"
            items={recentStockIn}
            keyField="id"
            label="label"
            subtitle="subtitle"
          />

          <DataListCard
            title="Recent Stock Out"
            items={recentStockOut}
            keyField="id"
            label="label"
            subtitle="subtitle"
            value="value"
          />
        </div>
      </main>
    </div>
  );
}
