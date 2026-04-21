import { useState, useMemo } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { allEmployees } from "../data/employees";
import { useAuth } from "../context/AuthContext";

export default function EmployeeList() {
  const { currentUser } = useAuth();
  const currentEmployee = allEmployees.find((emp) => emp.number === currentUser?.number);

  const [searchNumber, setSearchNumber] = useState("");
  const [searchSurname, setSearchSurname] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      const matchesNumber = searchNumber === "" || employee.number.toString().includes(searchNumber);
      const matchesSurname = searchSurname === "" || employee.surname.toLowerCase().includes(searchSurname.toLowerCase());
      return matchesNumber && matchesSurname;
    });
  }, [searchNumber, searchSurname, allEmployees]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (type: "number" | "surname", value: string) => {
    setCurrentPage(1);
    if (type === "number") {
      setSearchNumber(value);
    } else {
      setSearchSurname(value);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Zoznam zamestnancov" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9">
            <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <div className="mb-6">
                <p className="text-gray-900 mb-1">
                  <strong>Meno:</strong> {currentEmployee?.fullName || "Neznámy"}
                </p>
                <p className="text-gray-900">
                  <strong>Vaše číslo:</strong> <span className="px-2 py-1 rounded" style={{ backgroundColor: '#c8e6c9' }}>{currentEmployee?.number || "?"}</span>
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-900 mb-3"><strong>Hľadať:</strong></p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="searchNumber" className="block text-sm text-gray-700 mb-2">
                      Číslo
                    </label>
                    <input
                      id="searchNumber"
                      type="text"
                      value={searchNumber}
                      onChange={(e) => handleSearchChange("number", e.target.value)}
                      className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                      placeholder="Zadajte číslo..."
                    />
                  </div>
                  <div>
                    <label htmlFor="searchSurname" className="block text-sm text-gray-700 mb-2">
                      Priezvisko
                    </label>
                    <input
                      id="searchSurname"
                      type="text"
                      value={searchSurname}
                      onChange={(e) => handleSearchChange("surname", e.target.value)}
                      className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                      placeholder="Zadajte priezvisko..."
                    />
                  </div>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mb-6 flex items-center justify-center gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ backgroundColor: '#d2a679' }}
                  >
                    <span className="text-white text-xl">←</span>
                  </button>
                  <span className="text-gray-900">
                    Strana {currentPage} z {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ backgroundColor: '#d2a679' }}
                  >
                    <span className="text-white text-xl">→</span>
                  </button>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #e8dcc4' }}>
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: '#e8dcc4' }}>
                    <tr>
                      <th className="text-left py-2 px-3 text-gray-900">Číslo</th>
                      <th className="text-left py-2 px-3 text-gray-900">Meno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.length > 0 ? (
                      currentEmployees.map((employee) => (
                        <tr
                          key={employee.number}
                          className="border-t transition-colors hover:bg-opacity-50"
                          style={{
                            borderColor: '#e8dcc4',
                            backgroundColor: employee.number === currentEmployee?.number ? '#c8e6c9' : 'transparent'
                          }}
                        >
                          <td className="py-2 px-3 text-gray-800">{employee.number}</td>
                          <td className="py-2 px-3 text-gray-800">{employee.name} {employee.surname}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-4 px-3 text-center text-gray-600 text-sm">
                          Neboli nájdené žiadne výsledky
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ backgroundColor: '#d2a679' }}
                  >
                    <span className="text-white text-xl">←</span>
                  </button>
                  <span className="text-gray-900">
                    Strana {currentPage} z {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ backgroundColor: '#d2a679' }}
                  >
                    <span className="text-white text-xl">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
