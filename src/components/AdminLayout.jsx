import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-midnight to-black text-white">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
