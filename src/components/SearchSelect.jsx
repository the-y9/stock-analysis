import { useState, useEffect } from "react";

function SearchSelect({ value, onChange, products }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
// console.log(products);

  useEffect(() => {
    const selected = products.find((p) => p.stock_no === value);
    if (selected) {
      setSearch(selected.product_name);
    }
  }, [value, products]);

  const filtered = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  function selectItem(stock_no, product_name) {
    onChange(stock_no);      // store stock_no
    setSearch(product_name); // show user-friendly text
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        className="border px-2 py-1 rounded-lg ms-1"
        value={search}
        placeholder="Search product..."
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
      />

      {open && (
        <div className="absolute z-10 w-full bg-white border max-h-48 overflow-auto shadow rounded-lg">
          {filtered.length === 0 && (
            <div className="p-2 text-gray-500">No products found</div>
          )}

          {filtered.map((p) => (
            <div
              key={p.stock_no}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => selectItem(p.stock_no, p.product_name)}
            >
              {p.product_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchSelect;
