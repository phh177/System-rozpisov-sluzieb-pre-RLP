import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === "admin") {
      login(1); // Admin Adminová
      navigate("/dashboard");
    } else if (password === "user") {
      login(2); // User Userovský
      navigate("/dashboard");
    } else if (password.startsWith("user")) {
      // Check if it's user3, user4, ... user42
      const numberPart = password.substring(4); // Remove "user" prefix
      const employeeNumber = parseInt(numberPart, 10);

      if (!isNaN(employeeNumber) && employeeNumber >= 3 && employeeNumber <= 42) {
        login(employeeNumber);
        navigate("/dashboard");
      } else {
        setError("Nesprávne heslo");
      }
    } else {
      setError("Nesprávne heslo");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf7f0' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl shadow-lg border p-8" style={{ backgroundColor: 'white', borderColor: '#e8dcc4' }}>
          <div className="mb-8 text-center">
            <h1 className="text-gray-900 mb-3">Prihlásenie</h1>
            <p className="text-sm text-gray-600">Autorka: Bc. Patrícia Helena Hubová</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full text-black transition-all hover:brightness-95 active:brightness-90 cursor-pointer"
              style={{ backgroundColor: '#c8e6c9' }}
            >
              Prihlásiť sa
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
