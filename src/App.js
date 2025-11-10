// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CurrentStock from "./pages/CurrentStock";

function App() {
  return (<>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cs" element={<CurrentStock />} />
      </Routes>
    </Router>
  
  </>
  );
}

export default App;
