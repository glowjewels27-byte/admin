import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-midnight to-black text-white">
      <form onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-md space-y-4">
        <h1 className="font-serif text-3xl">Admin Login</h1>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <input
          type="email"
          placeholder="Admin email"
          className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        <button className="w-full py-2 rounded-full bg-white text-black text-sm uppercase tracking-[0.3em]">Login</button>
      </form>
    </div>
  );
}
