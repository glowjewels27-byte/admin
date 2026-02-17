import { useEffect, useState } from "react";
import api from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (id) => {
    await api.put(`/admin/users/${id}/toggle-block`);
    load();
  };

  return (
    <AdminLayout>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-serif text-2xl">Users</h2>
        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <div key={user._id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-white/60">{user.email} • {user.role}</p>
              </div>
              <button onClick={() => toggleBlock(user._id)} className="text-xs uppercase tracking-[0.2em]">
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
