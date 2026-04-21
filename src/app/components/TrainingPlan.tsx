import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { allEmployees } from "../data/employees";

const mockTrainings = [
  {
    name: "Opakovací výcvik RLP",
    participantNumbers: [1, 4],
    date: "22.5.2026 - 26.5.2026",
    duration: "5 dní",
  },
  {
    name: "Školenie žiakov RLP",
    participantNumbers: [2, 3, 5],
    date: "3.6.2026 - 4.6.2026",
    duration: "2 dni",
  },
  {
    name: "Preškoľovací výcvik letových ciest",
    participantNumbers: [4, 5],
    date: "10.7.2026",
    duration: "1 deň",
  },
];

export default function TrainingPlan() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Výcvikový plán" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9">
            <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h2 className="text-xl text-gray-900 mb-6">Prehľad školení a tréningov</h2>

              <div className="space-y-4">
                {mockTrainings.map((training, index) => {
                  const participants = training.participantNumbers.map((num) => {
                    const employee = allEmployees.find((emp) => emp.number === num);
                    return employee?.fullName || "Neznámy";
                  });

                  return (
                    <div
                      key={index}
                      className="p-5 rounded-2xl transition-colors"
                      style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}
                    >
                      <div className="mb-3">
                        <h3 className="text-gray-900">{training.name}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="text-gray-500">Termín:</span> {training.date}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-500">Trvanie:</span> {training.duration}
                        </p>
                        <div>
                          <p className="text-gray-500 mb-1">Účastníci:</p>
                          <div className="flex flex-wrap gap-2">
                            {participants.map((participant, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-gray-700 rounded text-xs"
                                style={{ backgroundColor: '#e8dcc4' }}
                              >
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
