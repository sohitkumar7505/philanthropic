import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/dashboard"; // Renamed from Dashboard to Home
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/userDashboard"; // User's personal dashboard
import Lottery from "./pages/lottery"; // Lottery number selection
import Charities from "./pages/charities"; // Charities page
import Results from "./pages/results"; // Draw results
import Admin from "./pages/adminpage";
import Subscription from "./pages/subscription";
import Navbar from "./pages/navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lottery" element={<Lottery />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/results" element={<Results />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;