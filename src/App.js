import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import CustomLayouts from "./components/Layout/CustomLayouts";
import ClientList from "./views/ClientList";
import ForgotPassword from "./views/ForgotPassword";
import Home from "./views/Home";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<CustomLayouts />}>
          <Route index element={<Home />} />
          <Route path="client-list" element={<ClientList />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  );
}

export default App;
