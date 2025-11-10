    import { useMemo, useState } from "react";
    import { Search, RefreshCcw, Menu } from "lucide-react";
    import SideBar from "../components/SideBar";
    import NavSidebar from "./NavSidebar";
    import { useStockData } from "../context/StockDataContext";

    export default function CurrentStock() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("product_name");
    const [sortOrder, setSortOrder] = useState("asc");

    const { stockData, loading, fetchData, lastFetched } = useStockData();
        
    // --- 🔢 Process stock list ---
    const processedStock = useMemo(() => {
        const currentStock = Array.isArray(stockData?.currentstock)
        ? stockData.currentstock
        : [];
        const products = Array.isArray(stockData?.products)
        ? stockData.products
        : [];
    
        const rows = currentStock.map((item) => {
        const product = products.find((p) => p.stock_no === item.id);
        return {
            id: item.id,
            product_name: product?.product_name || item.id,
            category: product?.category || "Other",
            qty: Number(item.qty) || 0,
            rate: Number(item.rate) || 0,
            value: (Number(item.qty) * Number(item.rate)).toFixed(2),
        };
        });
        
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
        
    // --- ⏳ Loading state ---
    if (loading) {
    return (
        <div className="flex justify-center items-center h-screen text-gray-500">
        Loading current stock data...
        </div>
    );
    }

    const totalQty = Array.isArray(processedStock)
    ? processedStock.reduce((sum, i) => sum + i.qty, 0)
    : 0;
    
    const totalValue = Array.isArray(processedStock)
    ? processedStock.reduce((sum, i) => sum + i.qty * i.rate, 0).toFixed(2)
    : "0.00";

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
                <h2 className="text-2xl font-semibold">Current Stock</h2>
                <p className="text-gray-500 text-sm">
                {new Date().toLocaleDateString("en-US", {
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
            
          </div>            
            </div>

                {/* --- Stock Summary --- */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-white rounded-lg shadow p-4">
                    <div>
                        <p className="text-gray-500 text-sm">Total Items</p>
                        <p className="text-xl font-semibold">{processedStock.length}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Quantity</p>
                        <p className="text-xl font-semibold">{totalQty}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Value</p>
                        <p className="text-xl font-semibold">₹ {totalValue}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Categories</p>
                        <p className="text-xl font-semibold">
                        {new Set(processedStock.map((p) => p.category)).size}
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
            {/* --- Stock Table --- */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                <tr>
                    {[
                    { key: "product_name", label: "Product" },
                    { key: "category", label: "Category" },
                    { key: "qty", label: "Qty" },
                    { key: "rate", label: "Rate (₹)" },
                    { key: "value", label: "Value (₹)" },
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
                {processedStock.map((row) => (
                    <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50 transition"
                    >
                    <td className="px-4 py-2">{row.product_name}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2">{row.qty}</td>
                    <td className="px-4 py-2">{row.rate}</td>
                    <td className="px-4 py-2">{row.value}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </main>
        </div>
    );
    }
