export default function DataTable({ columns, data, sortBy, sortOrder, onSort }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-2 cursor-pointer select-none"
                onClick={() => onSort(key)}
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
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-t hover:bg-gray-50 transition"
            >
              {columns.map(({ key }) => (
                <td key={key} className="px-4 py-2">
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
