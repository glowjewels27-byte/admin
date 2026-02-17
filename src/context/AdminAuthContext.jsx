import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api.js";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data.role === "admin") setAdmin(data);
      else setAdmin(null);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("gj_admin_token");
    if (token) loadAdmin();
    else setLoading(false);
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    if (data.role !== "admin") throw new Error("Not admin");
    localStorage.setItem("gj_admin_token", data.token);
    setAdmin({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("gj_admin_token");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
