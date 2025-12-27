import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Outdoor from "./pages/Outdoor";
import Indoor from "./pages/Indoor";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/outdoor" element={<Outdoor />} />
          <Route path="/indoor" element={<Indoor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
