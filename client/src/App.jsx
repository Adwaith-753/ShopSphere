
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerLayout from "./components/layout/CustomerLayout";
import Home from "./pages/customer/Home";
import Login from "./pages/auth/Login";
import Products from "./pages/customer/Products";
import ProductDetails from "./pages/customer/ProductDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
