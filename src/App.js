// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CurrentStock from "./pages/CurrentStock";
import StockIn from "./pages/StockIn";
// import StockOut from "./pages/StockOut";
// import Products from "./pages/Products";

function App() {
  return (<>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cs" element={<CurrentStock />} />
        <Route path="/si" element={<StockIn />} />
      </Routes>
    </Router>
  
  </>
  );
}

export default App;
