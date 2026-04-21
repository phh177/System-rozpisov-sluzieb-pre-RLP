import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.number === 1;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Home" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9 grid grid-cols-2 gap-6">
            {isAdmin && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate('/create-schedule')}
                className="rounded-3xl p-8 shadow-lg transition-all hover:shadow-xl hover:brightness-95 active:brightness-90 cursor-pointer"
                style={{ backgroundColor: 'white', borderBottom: '4px solid #ffcccb', minHeight: '250px' }}
              >
                <h2 className="text-2xl text-gray-900 mb-2">Vytvoriť nový rozpis</h2>
                <p className="text-gray-600 text-sm">Vytvorte mesačný rozpis služieb</p>
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/view-schedule')}
              className="rounded-3xl p-8 shadow-lg transition-all hover:shadow-xl hover:brightness-95 active:brightness-90 cursor-pointer"
              style={{ backgroundColor: 'white', borderBottom: '4px solid #ffcccb', minHeight: '250px' }}
            >
              <h2 className="text-2xl text-gray-900 mb-2">Aktuálny rozpis služieb</h2>
              <p className="text-gray-600 text-sm">Prehliadať platný rozpis</p>
            </motion.button>
          </div>
        </div>

        <div className="pt-8">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
