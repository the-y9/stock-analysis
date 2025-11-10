import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown button */}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
      >
        + New Stock Entry
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute mt-2 bg-white shadow-lg rounded-md z-10">
          <Link
            to="/add-stock -in"
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Add Stock In
          </Link>
          <Link
            to="/add-stock-out"
            className="block px-4 py-2 hover:bg-gray-100"
          >
            Add Stock Out
          </Link>
        </div>
      )}
    </div>
  );
}
