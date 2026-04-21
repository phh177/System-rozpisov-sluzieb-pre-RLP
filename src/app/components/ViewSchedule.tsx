import { useState } from "react";

interface ViewScheduleProps {
  onClose: () => void;
}

// Mock data
const mockSchedule = [
  { date: "1.4.2026", day: "Utorok", morning: "Ján Novák", afternoon: "Eva Vargová", night: "Peter Horváth" },
  { date: "2.4.2026", day: "Streda", morning: "Mária Kováčová", afternoon: "Milan Tóth", night: "Ján Novák" },
  { date: "3.4.2026", day: "Štvrtok", morning: "Eva Vargová", afternoon: "Peter Horváth", night: "Mária Kováčová" },
  { date: "4.4.2026", day: "Piatok", morning: "Milan Tóth", afternoon: "Ján Novák", night: "Eva Vargová" },
  { date: "5.4.2026", day: "Sobota", morning: "Peter Horváth", afternoon: "Mária Kováčová", night: "Milan Tóth" },
];

export default function ViewSchedule({ onClose }: ViewScheduleProps) {
  const [selectedMonth] = useState("Apríl 2026");

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Aktuálny rozpis služieb</h2>
          <p className="text-sm text-gray-600 mt-1">{selectedMonth}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-700">Dátum</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Deň</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Ranná zmena</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Popoludňajšia zmena</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Nočná zmena</th>
              </tr>
            </thead>
            <tbody>
              {mockSchedule.map((shift, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{shift.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{shift.day}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{shift.morning}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{shift.afternoon}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{shift.night}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-900">
            <strong>Poznámka:</strong> Toto sú ukážkové dáta. Po pripojení Supabase sa zobrazia skutočné rozpisy.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Zavrieť
        </button>
      </div>
    </div>
  );
}
