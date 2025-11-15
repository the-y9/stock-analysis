import { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import ProductSelect from "../components/SearchSelect"

export default function StockoutMultiInsert() {
    const [date, setDate] = useState("");
    const [lastQty, setLastQty] = useState();
    const [lastTo, setLastTo] = useState();
  const [rows, setRows] = useState([
    { product: "", qty: "", to_whom: "", rate: "" }
  ]);

  // Add new blank row
  function addRow() {
    setRows([...rows, { product: "", qty: "", to_whom: "", rate: "" }]);
  }

  // Remove a specific row
  function removeRow(index) {
    setRows(rows.filter((_, i) => i !== index));
    }
    
    // completely empties the table
    function removeAllRows() {
        setRows([]); 
      }
  
  // Update row fields
  function updateRow(index, field, value) {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  }

  // Submit all stockouts at once
  async function submitStockouts() {
    if (!date) {
      alert("Please select a date");
      return;
    }

    // build the insert payload
    const payload = rows.map((r) => ({
      date,
      product: r.product,
      qty: Number(r.qty),
      to_whom: r.to_whom,
      rate: Number(r.rate)
    }));

    const { error } = await supabase.from("stockout").insert(payload);

    if (error) {
      console.error(error);
      alert("Failed to insert");
    } else {
      alert("Stockouts inserted!");
      // Reset form
      setRows([{ product: "", qty: "", to_whom: "", rate: "" }]);
    }
    }
    const [products, setProducts] = useState([]);

    useEffect(() => {
    const cache = localStorage.getItem("stockDataCache");
    if (!cache) return;

    const parsed = JSON.parse(cache);

    // `products` is already an array → no need to convert
    setProducts(parsed.products);
    }, []);


  return (
    <div style={{ padding: 20 }}>
        <h2 className="text-3xl font-semibold">Stock Out Form</h2>
        <label>Date: </label>
        <input
            type="date"
            value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        />
        <br /><br />
          <div className="bg-card rounded-lg shadow overflow-visible ">
              
                <table  className="min-w-full text-center border-collapse  rounded-lg">
                    <thead className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100">
                    <tr>
                        <th className="border border-border">Product</th>
                        <th className="border border-border">Qty</th>
                        <th className="border border-border">To Whom</th>
                        <th className="border border-border">Rate</th>
                        <th className="border border-border"></th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50 transition">
                        <td className="border border-border">
                        <ProductSelect
                            value={row.product}
                            products={products}
                            onChange={(stock_no) => {
                                const cachep = JSON.parse(localStorage.getItem("stockDataCache"));
                                const stockItem = cachep.currentstock.find((cs) => cs.id === stock_no);
                                // { console.log(stock_no, cachep,stockItem); }
                                updateRow(index, "product", stock_no);
                                updateRow(index, "rate", stockItem?.rate || "");
                            }}
                            />


                        </td>
                        <td className="border border-border">
                            <input
                            type="number"
                            value={row.qty || lastQty}
                                    onChange={(e) => {
                                        setLastQty(e.target.value)
                                        updateRow(index, "qty", e.target.value)
                                    }}
                            />
                        </td>
                        <td className="border border-border">
                            <input
                            value={row.to_whom || lastTo }
                                    onChange={(e) => {
                                        setLastTo(e.target.value)
                                        updateRow(index, "to_whom", e.target.value)
                                    }}
                            />
                        </td>
                        <td className="border border-border">
                            <input
                            type="number"
                            value={row.rate}
                            onChange={(e) => updateRow(index, "rate", e.target.value)}
                            />
                        </td>
                        <td className="border border-border">
                            {rows.length > 1 && (
                            <button onClick={() => removeRow(index)} className="text-red-500">X</button>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
              </table>
          </div>
          

      <br />

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-4 mb-4">
            <button onClick={addRow} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none">+ Add Product</button>
            <button onClick={removeAllRows} className="px-4 py-2 gap-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none" > Remove All Rows </button>
          </div>
          <button onClick={submitStockouts} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none">Submit All</button>
    </div>
  );
}
