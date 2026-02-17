import { useEffect, useState } from "react";
import api from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await api.get("/categories/all");
    setCategories(data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name) return;
    await api.post("/categories", { name });
    setName("");
    load();
  };

  const toggle = async (cat) => {
    await api.put(`/categories/${cat._id}`, { enabled: !cat.enabled });
    load();
  };

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-serif text-2xl">Categories</h2>
          <div className="mt-4 space-y-3">
            {categories.map((cat) => (
              <div key={cat._id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <p>{cat.name}</p>
                <button onClick={() => toggle(cat)} className="text-xs uppercase tracking-[0.2em]">
                  {cat.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="font-serif text-xl">Add Category</h3>
          <input
            placeholder="Category name"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={create} className="w-full py-2 rounded-full bg-white text-black text-sm uppercase tracking-[0.3em]">
            Create
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
