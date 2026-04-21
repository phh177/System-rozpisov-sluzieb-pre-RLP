import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { allEmployees } from "../data/employees";

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const { currentUser } = useAuth();
  const employee = allEmployees.find((emp) => emp.number === currentUser?.number);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getDayName = (date: Date) => {
    const days = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="rounded-full px-6 py-4 flex items-center justify-between shadow-sm" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
      <div className="text-gray-900">
        {currentPage === "Home" ? (
          `Vitajte, ${employee?.name || "Admin"}!`
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors cursor-pointer">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span>{currentPage}</span>
          </div>
        )}
      </div>
      <div className="text-gray-700 text-sm">
        {getDayName(currentTime)} {formatDate(currentTime)} {formatTime(currentTime)}
      </div>
    </div>
  );
}
