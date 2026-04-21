import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleLogout}
        className="px-8 py-3 rounded-full text-black transition-all hover:brightness-95 active:brightness-90 shadow-sm cursor-pointer"
        style={{ backgroundColor: '#c8e6c9' }}
      >
        Odhlásiť sa
      </button>
    </div>
  );
}
