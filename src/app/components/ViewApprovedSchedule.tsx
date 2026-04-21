import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { useSchedule } from "../context/ScheduleContext";
import { allEmployees } from "../data/employees";
import { isHoliday } from "../utils/holidays";

export default function ViewApprovedSchedule() {
  const { approvedSchedule, isLoading } = useSchedule();
  const [hoveredEmployee, setHoveredEmployee] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const handleEmployeeClick = (empNum: number | null | undefined) => {
    if (!empNum) {
      setSelectedEmployee(null);
    } else if (empNum === selectedEmployee) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(empNum);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Header currentPage="Aktuálny rozpis služieb" />

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Sidebar />
            </div>

            <div className="col-span-9">
              <div className="rounded-3xl p-6 shadow-lg text-center" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
                <p className="text-gray-600">Načítavam...</p>
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

  if (!approvedSchedule) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Header currentPage="Aktuálny rozpis služieb" />

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Sidebar />
            </div>

            <div className="col-span-9">
              <div className="rounded-3xl p-6 shadow-lg text-center" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
                <h2 className="text-xl mb-4 text-gray-900">
                  <strong>Žiadny schválený rozpis</strong>
                </h2>
                <p className="text-gray-600">
                  Momentálne nie je k dispozícii žiadny schválený rozpis služieb.
                </p>
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

  const monthName = new Date(approvedSchedule.year, approvedSchedule.month, 1).toLocaleDateString('sk-SK', { month: 'long' }).toUpperCase();
  const positions = ['ES', 'ECA', 'PCA', 'ECT', 'ECG', 'RLC'];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Aktuálny rozpis služieb" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9 space-y-6">
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h2 className="text-xl mb-4 text-center text-gray-900">
                <strong>Rozpis služieb ATCO na mesiac {monthName} {approvedSchedule.year}</strong>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '60px' }} />
                    <col span={12} style={{ width: 'calc((100% - 60px) / 12)' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ backgroundColor: '#d3d3d3' }}>
                      <th className="border border-gray-400 p-2" rowSpan={2} style={{ backgroundColor: '#d3d3d3' }}>Deň</th>
                      <th className="border border-gray-400 p-2" colSpan={6}>07:00 - 19:00</th>
                      <th className="border border-gray-400 p-2" colSpan={6} style={{ borderLeft: '3px solid #666' }}>19:00 - 07:00</th>
                    </tr>
                    <tr style={{ backgroundColor: '#d3d3d3' }}>
                      <th className="border border-gray-400 p-2">ES1</th>
                      <th className="border border-gray-400 p-2">ECA1</th>
                      <th className="border border-gray-400 p-2">PCA1</th>
                      <th className="border border-gray-400 p-2">ECT1</th>
                      <th className="border border-gray-400 p-2">ECG1</th>
                      <th className="border border-gray-400 p-2">RLC1</th>
                      <th className="border border-gray-400 p-2" style={{ borderLeft: '3px solid #666' }}>ES2</th>
                      <th className="border border-gray-400 p-2">ECA2</th>
                      <th className="border border-gray-400 p-2">PCA2</th>
                      <th className="border border-gray-400 p-2">ECT2</th>
                      <th className="border border-gray-400 p-2">ECG2</th>
                      <th className="border border-gray-400 p-2">RLC2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: approvedSchedule.days }, (_, i) => {
                      const day = i + 1;
                      const date = new Date(approvedSchedule.year, approvedSchedule.month, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const holidayInfo = isHoliday(date, approvedSchedule.year);

                      const daySchedule = approvedSchedule.schedule[day];
                      const rowBgColor = holidayInfo ? '#b3d9ff' : isWeekend ? '#e8dcc4' : 'white';

                      return (
                        <tr key={day}>
                          <td
                            className="border border-gray-400 p-2 text-center font-medium"
                            style={{
                              backgroundColor: '#d3d3d3',
                              cursor: 'pointer'
                            }}
                            onClick={() => setSelectedEmployee(null)}
                          >
                            {day}
                          </td>
                          {/* Day shift */}
                          {positions.map((pos, idx) => {
                            const empNum = daySchedule?.day?.[pos];
                            const isHovered = empNum && hoveredEmployee === empNum;
                            const isSelected = empNum && selectedEmployee === empNum;
                            const isEmpty = !empNum;

                            let bgColor = rowBgColor;
                            if (isHovered || isSelected) {
                              bgColor = '#ffd966';
                            } else if (isEmpty) {
                              bgColor = '#ff4444';
                            }

                            return (
                              <td
                                key={`day-${pos}`}
                                className="border border-gray-400 p-2 text-center text-xs"
                                style={{
                                  backgroundColor: bgColor,
                                  cursor: empNum ? 'pointer' : 'default'
                                }}
                                onMouseEnter={() => empNum && setHoveredEmployee(empNum)}
                                onMouseLeave={() => setHoveredEmployee(null)}
                                onClick={() => handleEmployeeClick(empNum || null)}
                              >
                                <strong>{empNum || ''}</strong>
                              </td>
                            );
                          })}
                          {/* Night shift */}
                          {positions.map((pos, idx) => {
                            const empNum = daySchedule?.night?.[pos];
                            const isHovered = empNum && hoveredEmployee === empNum;
                            const isSelected = empNum && selectedEmployee === empNum;
                            const isEmpty = !empNum;

                            let bgColor = rowBgColor;
                            if (isHovered || isSelected) {
                              bgColor = '#ffd966';
                            } else if (isEmpty) {
                              bgColor = '#ff4444';
                            }

                            return (
                              <td
                                key={`night-${pos}`}
                                className="border border-gray-400 p-2 text-center text-xs"
                                style={{
                                  backgroundColor: bgColor,
                                  borderLeft: idx === 0 ? '3px solid #666' : undefined,
                                  cursor: empNum ? 'pointer' : 'default'
                                }}
                                onMouseEnter={() => empNum && setHoveredEmployee(empNum)}
                                onMouseLeave={() => setHoveredEmployee(null)}
                                onClick={() => handleEmployeeClick(empNum || null)}
                              >
                                <strong>{empNum || ''}</strong>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
