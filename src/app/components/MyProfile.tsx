import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../context/AuthContext";
import { allEmployees } from "../data/employees";

export default function MyProfile() {
  const { currentUser } = useAuth();
  const employee = allEmployees.find((emp) => emp.number === currentUser?.number);

  if (!employee) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Header currentPage="Môj profil" />
          <div className="text-center text-gray-600">Používateľ nenájdený</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Môj profil" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9">
            <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h2 className="text-xl text-gray-900 mb-8">Informácie o profile</h2>

              <div className="space-y-6">
                <div className="pb-4 border-b" style={{ borderColor: '#e8dcc4' }}>
                  <p className="text-sm text-gray-600 mb-1">Meno a priezvisko</p>
                  <p className="text-lg text-gray-900">{employee.fullName}</p>
                </div>

                <div className="pb-4 border-b" style={{ borderColor: '#e8dcc4' }}>
                  <p className="text-sm text-gray-600 mb-1">Moje číslo</p>
                  <p className="text-lg text-gray-900">
                    <span className="px-3 py-1 rounded" style={{ backgroundColor: '#c8e6c9' }}>
                      {employee.number}
                    </span>
                  </p>
                </div>

                <div className="pb-4 border-b" style={{ borderColor: '#e8dcc4' }}>
                  <p className="text-sm text-gray-600 mb-1">Vek</p>
                  <p className="text-lg text-gray-900">{employee.age} rokov</p>
                </div>

                {employee.station && (
                  <div className="pb-4 border-b" style={{ borderColor: '#e8dcc4' }}>
                    <p className="text-sm text-gray-600 mb-1">Stanovište</p>
                    <p className="text-lg text-gray-900">{employee.station}</p>
                  </div>
                )}

                <div className="pb-4">
                  <p className="text-sm text-gray-600 mb-1">Pracovná pozícia</p>
                  <p className="text-lg text-gray-900">{employee.position}</p>
                </div>
              </div>
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
