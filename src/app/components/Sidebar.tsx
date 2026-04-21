import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { path: "/profile", label: "Môj profil" },
    { path: "/employees", label: "Zoznam zamestnancov" },
    { path: "/teams", label: "Tímy zamestnancov" },
    { path: "/vacation", label: "Plán dovoleniek" },
    { path: "/training", label: "Výcvikový plán" },
    { path: "/worktime", label: "Konto pracovného času" },
  ];

  return (
    <div className="rounded-3xl p-6 shadow-sm" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
      <nav className="space-y-3">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-3 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer"
              style={{
                backgroundColor: isActive ? '#b3d9ff' : 'transparent',
                borderBottom: isActive ? '2px solid #b3d9ff' : '2px solid transparent',
                color: isActive ? '#1a1a1a' : '#4a4a4a',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
