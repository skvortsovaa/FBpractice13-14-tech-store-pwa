import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import PwaStatus from "./components/PwaStatus/PwaStatus";

function PrivateRoute({ children }) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <ProductsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <PwaStatus />
    </>
  );
}

export default App;