import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import { allEmployees } from "../data/employees";
import { isHoliday } from "../utils/holidays";

export default function ViewApprovedSchedule() {
  const { approvedSchedule, isLoading } = useSchedule();
  const { currentUser } = useAuth();
  const [hoveredEmployee, setHoveredEmployee] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showMyShifts, setShowMyShifts] = useState(false);

  const handleEmployeeClick = (empNum: number | null | undefined) => {
    if (!empNum) {
      setSelectedEmployee(null);
    } else if (empNum === selectedEmployee) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(empNum);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleMyShifts = () => {
    setShowMyShifts(!showMyShifts);
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
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100%;
            height: 100%;
            max-width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: flex;
            flex-direction: column;
          }
          .print-container > div {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .print-title {
            font-size: 14pt !important;
            margin: 8mm 0 5mm 0 !important;
            text-align: center;
            font-weight: bold;
          }
          .overflow-x-auto {
            flex: 1;
            display: flex;
          }
          .print-table {
            page-break-inside: avoid;
            width: 100%;
            height: 100%;
            font-size: 9pt !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }
          .print-table th,
          .print-table td {
            padding: 4px 10px !important;
            border: 0.5pt solid #000 !important;
            text-align: center !important;
            vertical-align: middle !important;
            line-height: 1.3 !important;
          }
          .print-table thead th {
            background-color: #d3d3d3 !important;
            font-size: 10pt !important;
            font-weight: bold !important;
            padding: 4px 10px !important;
          }
          .print-table tbody td {
            background-color: white !important;
          }
          .print-table tbody tr.weekend td:not(:first-child) {
            background-color: #e8dcc4 !important;
          }
          .print-table tbody tr.holiday td:not(:first-child) {
            background-color: #b3d9ff !important;
          }
          .print-table tbody tr td:first-child {
            background-color: #d3d3d3 !important;
            font-weight: bold !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="no-print">
          <Header currentPage="Aktuálny rozpis služieb" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 no-print">
            <Sidebar />
          </div>

          <div className="col-span-9 space-y-6 print-container">
            {/* Action Buttons */}
            <div className="no-print flex justify-end gap-3 mb-4">
              <button
                onClick={handleToggleMyShifts}
                className="px-6 py-2 rounded-full transition-all hover:brightness-95 active:brightness-90"
                style={{
                  backgroundColor: showMyShifts ? '#c8e6c9' : '#e8dcc4',
                  color: '#000'
                }}
              >
                {showMyShifts ? '✓ Moje služby zvýraznené' : 'Zobraziť moje služby'}
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 rounded-full transition-all hover:brightness-95 active:brightness-90"
                style={{ backgroundColor: '#ffd966', color: '#000' }}
              >
                🖨️ Tlačiť rozpis
              </button>
            </div>

            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h2 className="text-xl mb-4 text-center text-gray-900 print-title">
                <strong>Rozpis služieb ATCO na mesiac {monthName} {approvedSchedule.year}</strong>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm print-table" style={{ tableLayout: 'fixed' }}>
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
                      <th className="border border-gray-400 p-2">PCT1</th>
                      <th className="border border-gray-400 p-2">RLC1</th>
                      <th className="border border-gray-400 p-2" style={{ borderLeft: '3px solid #666' }}>ES2</th>
                      <th className="border border-gray-400 p-2">ECA2</th>
                      <th className="border border-gray-400 p-2">PCA2</th>
                      <th className="border border-gray-400 p-2">ECT2</th>
                      <th className="border border-gray-400 p-2">PCT2</th>
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
                        <tr key={day} className={holidayInfo ? 'holiday' : isWeekend ? 'weekend' : ''}>
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
                            const isMyShift = showMyShifts && empNum === currentUser?.number;
                            const isEmpty = !empNum;

                            let bgColor = rowBgColor;
                            if (isHovered || isSelected || isMyShift) {
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
                            const isMyShift = showMyShifts && empNum === currentUser?.number;
                            const isEmpty = !empNum;

                            let bgColor = rowBgColor;
                            if (isHovered || isSelected || isMyShift) {
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

        <div className="pt-8 no-print">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
