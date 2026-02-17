import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/orders", label: "Orders" },
  { to: "/users", label: "Users" }
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 border-r border-white/10 bg-black/40 p-6">
      <div className="font-serif text-2xl">Glow Admin</div>
      <nav className="mt-10 space-y-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm ${isActive ? "bg-white/10" : "text-white/70"}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
