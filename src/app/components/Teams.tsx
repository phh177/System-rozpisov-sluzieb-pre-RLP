import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { teams } from "../data/teams";
import { allEmployees } from "../data/employees";
import { useAuth } from "../context/AuthContext";

export default function Teams() {
  const { currentUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Tímy zamestnancov" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9 space-y-6">
            {/* Teams Overview */}
            <div className="grid grid-cols-2 gap-4">
              {teams.map((team) => {
                const isSelected = selectedTeam === team.id;
                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeam(isSelected ? null : team.id)}
                    className="rounded-3xl p-6 shadow-lg cursor-pointer transition-all hover:brightness-95 active:brightness-90"
                    style={{
                      backgroundColor: 'white',
                      border: isSelected ? '3px solid #d2a679' : '2px solid #e8dcc4'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: team.color }}
                      >
                        <span className="text-xl font-bold text-gray-900">{team.name.slice(-1)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                        <p className="text-xs text-gray-600">{team.employeeNumbers.length} zamestnancov</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Team Detail */}
            {selectedTeam && (
              <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
                {teams
                  .filter((team) => team.id === selectedTeam)
                  .map((team) => {
                    const teamEmployees = allEmployees.filter((emp) =>
                      team.employeeNumbers.includes(emp.number)
                    );

                    return (
                      <div key={team.id}>
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: team.color }}
                          >
                            <span className="text-2xl font-bold text-gray-900">{team.name.slice(-1)}</span>
                          </div>
                          <div>
                            <h2 className="text-2xl text-gray-900">{team.name}</h2>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg text-gray-900 mb-3"><strong>Členovia tímu:</strong></h3>
                          {teamEmployees.map((employee) => (
                            <div
                              key={employee.number}
                              className="p-4 rounded-2xl transition-all"
                              style={{
                                backgroundColor: employee.number === currentUser?.number ? '#c8e6c9' : '#faf7f0',
                                border: employee.isShiftLeader ? '2px solid #d2a679' : '2px solid #e8dcc4'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {employee.fullName}
                                    {employee.isShiftLeader && (
                                      <span className="ml-2 px-2 py-1 text-xs rounded" style={{ backgroundColor: '#ffd966', color: '#000' }}>
                                        Vedúci zmeny
                                      </span>
                                    )}
                                    {employee.number === currentUser?.number && (
                                      <span className="ml-2 text-xs text-green-700">(Vy)</span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600">#{employee.number} • {employee.position}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Vek: {employee.age} rokov</p>
                                  <p className="text-sm text-gray-600">Dovolenka: {employee.vacationDaysTotal} dní</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {!selectedTeam && (
              <div className="rounded-3xl p-8 shadow-lg text-center" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
                <p className="text-gray-600">Kliknite na tím pre zobrazenie detailov</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
