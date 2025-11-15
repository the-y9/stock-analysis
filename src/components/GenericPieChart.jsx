import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
  } from "recharts";
  
import COLORS from "./Colors.jsx";

  
  const GenericPieChart = ({
    title = "Pie Chart",
    data = [],          // [{ label: "Book 1", value: 30 }, ...]
    dataKey = "value",  // key for numeric value
    nameKey = "label",  // key for category label
    pieGroupBy = "",    setPieGroupBy = () => {},
    height = 250,
  }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="mb-4 flex">
          <h3 className="font-semibold mb-4">{title}</h3>
          <div className="mb-4 flex items-center gap-2">
            {/* <label className="text-gray-700 font-medium">Group By:</label> */}
            <select
              className="border rounded px-2 py-1"
              value={pieGroupBy}
              onChange={(e) => setPieGroupBy(e.target.value)}
            >
              <option value="category">Category</option>
              <option value="product">Product</option>
            </select>
            </div>
          </div>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
                fill={COLORS[-1]}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}`} />
            <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              maxHeight: 275,
              overflowY: "auto",
              maxWidth: 125
            }}
            />
            
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default GenericPieChart;
  