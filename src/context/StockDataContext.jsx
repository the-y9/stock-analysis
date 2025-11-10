// src/context/StockDataContext.js
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import supabase from "../utils/supabase";

const StockDataContext = createContext();

export function StockDataProvider({ children }) {
  const [stockData, setStockData] = useState({
    products: [],
    currentstock: [],
    stockin: [],
    stockout: [],
  });

  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  // ✅ Fetch all tables in parallel
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, currentStockRes, stockInRes, stockOutRes] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("currentstock").select("*"),
        supabase.from("stockin").select("*"),
        supabase.from("stockout").select("*"),
      ]);

      const products = productsRes.data || [];
      const currentstock = currentStockRes.data || [];
      const stockin = stockInRes.data || [];
      const stockout = stockOutRes.data || [];

      setStockData({ products, currentstock, stockin, stockout });
      setLastFetched(Date.now());
    } catch (err) {
      console.error("Error fetching stock data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

//   // ✅ Background refresh every 5 minutes
//   useEffect(() => {
//     const interval = setInterval(fetchData, 5 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [fetchData]);

  // ✅ Save to localStorage cache
  useEffect(() => {
    if (stockData.products.length > 0) {
      localStorage.setItem("stockDataCache", JSON.stringify(stockData));
    }
  }, [stockData]);

  // ✅ Load cache first for instant render
  useEffect(() => {
    const cached = localStorage.getItem("stockDataCache");
    if (cached) {
      try {
        setStockData(JSON.parse(cached));
        setLoading(false);
      } catch (err) {
        console.error("Failed to parse stockData cache:", err);
      }
    }
  }, []);

  return (
    <StockDataContext.Provider value={{ stockData, setStockData, fetchData, loading, lastFetched }}>
      {children}
    </StockDataContext.Provider>
  );
}

export function useStockData() {
  return useContext(StockDataContext);
}
