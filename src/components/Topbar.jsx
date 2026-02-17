import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function Topbar() {
  const { admin, logout } = useAdminAuth();
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Glow Jewels</p>
        <h1 className="font-serif text-2xl">Admin Panel</h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>{admin?.name}</span>
        <button onClick={logout} className="px-3 py-1 rounded-full border border-white/20">
          Logout
        </button>
      </div>
    </div>
  );
}
