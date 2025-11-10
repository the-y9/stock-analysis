import { useMemo, useState } from "react";
import { Search, RefreshCcw } from "lucide-react";
import SideBar from "../components/SideBar";
import NavSidebar from "./NavSidebar";
import { useStockData } from "../context/StockDataContext";

export default function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const { stockData, loading, fetchData, lastFetched } = useStockData();

  // --- 🔢 Process products list ---
  const processedProducts = useMemo(() => {
    const products = Array.isArray(stockData?.products) ? stockData.products : [];

    const rows = products.map((item) => ({
      id: item.id,
      stock_no: item.stock_no,
      product_name: item.product_name || "Unnamed Product",
      category: item.category || "Other",
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
    }));

    // --- 🔍 Search filter ---
    const filtered = rows.filter((row) =>
      row.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- 🔽 Sorting ---
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [stockData, searchTerm, sortBy, sortOrder]);

  // --- ⏳ Handle Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading products...
      </div>
    );
  }

  const totalProducts = processedProducts.length;
  const totalQty = processedProducts.reduce((sum, i) => sum + i.qty, 0);

  // --- 🧭 Sort handler ---
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

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
        additionalComponentUp={
          lastFetched && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(lastFetched).toLocaleTimeString()}
              </p>
              <button
                onClick={fetchData}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
              >
                <RefreshCcw size={14} />
                Refresh
              </button>
            </div>
          )
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        {/* --- Header --- */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Products</h2>
            <p className="text-gray-500 text-sm">
              As of {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* --- Products Summary --- */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-center bg-white rounded-lg shadow p-4">
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-xl font-semibold">{totalProducts}</p>
          </div>
          {/* <div>
            <p className="text-gray-500 text-sm">Total Quantity</p>
            <p className="text-xl font-semibold">{totalQty}</p>
          </div> */}
          <div>
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-xl font-semibold">
              {new Set(processedProducts.map((p) => p.category)).size}
            </p>
          </div>
              </div>
              
              {/* --- Search Bar --- */}
                <div className="flex justify-start">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
                        <input
                        type="text"
                        placeholder="Search product..."
                        className="pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

        {/* --- Products Table --- */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {[
                  { key: "stock_no", label: "Product Code" },
                  { key: "product_name", label: "Product Name" },
                  { key: "category", label: "Category" },
                  { key: "qty", label: "Qty" },
                  { key: "rate", label: "Rate (₹)" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center">
                      {label}
                      {sortBy === key && (
                        <span className="ml-1 text-gray-400 text-xs">
                          {sortOrder === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-6">
                    No products available.
                  </td>
                </tr>
              ) : (
                processedProducts.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{row.stock_no}</td>
                    <td className="px-4 py-2">{row.product_name}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2">{row.qty}</td>
                    <td className="px-4 py-2">{row.rate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
