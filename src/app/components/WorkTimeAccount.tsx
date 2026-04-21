import { useMemo } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { allEmployees } from "../data/employees";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import { isHoliday } from "../utils/holidays";

interface EmployeeWorkTime {
  employeeNumber: number;
  fullName: string;
  totalHours: number;
  nightHours: number;
  weekendHours: number;
  holidayHours: number;
  bonusHours: number;
}

export default function WorkTimeAccount() {
  const { approvedSchedule, isLoading } = useSchedule();
  const { currentUser } = useAuth();

  // Calculate work time for each employee based on approved schedule
  const employeeWorkTime = useMemo((): EmployeeWorkTime[] => {
    if (!approvedSchedule) {
      // If no approved schedule, return all employees with 0 hours
      return allEmployees.map(emp => ({
        employeeNumber: emp.number,
        fullName: emp.fullName,
        totalHours: 0,
        nightHours: 0,
        weekendHours: 0,
        holidayHours: 0,
        bonusHours: 0
      }));
    }

    const workTimeMap = new Map<number, EmployeeWorkTime>();

    // Initialize all employees
    allEmployees.forEach(emp => {
      workTimeMap.set(emp.number, {
        employeeNumber: emp.number,
        fullName: emp.fullName,
        totalHours: 0,
        nightHours: 0,
        weekendHours: 0,
        holidayHours: 0,
        bonusHours: 0
      });
    });

    const positions = ['ES', 'ECA', 'PCA', 'ECT', 'ECG', 'RLC'];

    // Go through each day in the schedule
    for (let day = 1; day <= approvedSchedule.days; day++) {
      const daySchedule = approvedSchedule.schedule[day];
      if (!daySchedule) continue;

      const date = new Date(approvedSchedule.year, approvedSchedule.month, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
      const holidayInfo = isHoliday(date, approvedSchedule.year);

      // Process day shift
      if (daySchedule.day) {
        positions.forEach(pos => {
          const empNum = daySchedule.day[pos];
          if (empNum) {
            const workTime = workTimeMap.get(empNum);
            if (workTime) {
              workTime.totalHours += 12; // Each shift = 12 hours

              if (isWeekend) {
                workTime.weekendHours += 12;
              }

              if (holidayInfo) {
                workTime.holidayHours += 12;
              }
            }
          }
        });
      }

      // Process night shift
      if (daySchedule.night) {
        positions.forEach(pos => {
          const empNum = daySchedule.night[pos];
          if (empNum) {
            const workTime = workTimeMap.get(empNum);
            if (workTime) {
              workTime.totalHours += 12; // Each shift = 12 hours
              workTime.nightHours += 12; // Night shift

              if (isWeekend) {
                workTime.weekendHours += 12;
              }

              if (holidayInfo) {
                workTime.holidayHours += 12;
              }
            }
          }
        });
      }
    }

    // Calculate bonus hours (night + weekend + holiday)
    workTimeMap.forEach(workTime => {
      workTime.bonusHours = workTime.nightHours + workTime.weekendHours + workTime.holidayHours;
    });

    return Array.from(workTimeMap.values()).sort((a, b) => a.employeeNumber - b.employeeNumber);
  }, [approvedSchedule]);

  // Filter based on user role
  const isAdmin = currentUser?.number === 1;
  const displayedWorkTime = useMemo(() => {
    if (isAdmin) {
      return employeeWorkTime;
    } else {
      return employeeWorkTime.filter(wt => wt.employeeNumber === currentUser?.number);
    }
  }, [employeeWorkTime, isAdmin, currentUser]);

  const monthName = approvedSchedule
    ? new Date(approvedSchedule.year, approvedSchedule.month, 1).toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })
    : 'žiadny schválený rozpis';

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Header currentPage="Konto pracovného času" />

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Sidebar />
            </div>

            <div className="col-span-9">
              <div className="rounded-3xl p-8 shadow-lg text-center" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Konto pracovného času" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9">
            <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h2 className="text-xl text-gray-900 mb-2">
                <strong>Nadčasové a príplatkové hodiny k {monthName}</strong>
              </h2>
              {!approvedSchedule && (
                <p className="text-sm text-gray-600 mb-6">
                  Momentálne nie je schválený žiadny rozpis služieb. Všetky hodnoty sú nastavené na 0.
                </p>
              )}

              <div className="rounded-2xl overflow-hidden mt-6" style={{ border: '2px solid #e8dcc4' }}>
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: '#d3d3d3' }}>
                    <tr>
                      <th className="text-left py-2 px-3 text-gray-900" style={{ whiteSpace: 'nowrap' }}>Priezvisko a meno</th>
                      <th className="text-center py-2 px-2 text-gray-900" style={{ whiteSpace: 'nowrap' }}>Odpracované hodiny</th>
                      <th className="text-center py-2 px-2 text-gray-900" style={{ whiteSpace: 'nowrap' }}>Nočné služby</th>
                      <th className="text-center py-2 px-2 text-gray-900" style={{ whiteSpace: 'nowrap' }}>Víkendové služby</th>
                      <th className="text-center py-2 px-2 text-gray-900" style={{ whiteSpace: 'nowrap' }}>Sviatočné služby</th>
                      <th className="text-center py-2 px-2 text-gray-900" style={{ whiteSpace: 'nowrap' }}>Príplatkové služby</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedWorkTime.map((workTime) => {
                      const isCurrentUser = workTime.employeeNumber === currentUser?.number;
                      return (
                        <tr
                          key={workTime.employeeNumber}
                          className="border-t transition-colors"
                          style={{
                            borderColor: '#e8dcc4',
                            backgroundColor: isCurrentUser ? '#c8e6c9' : 'white'
                          }}
                        >
                          <td className="py-2 px-3 text-gray-800" style={{ whiteSpace: 'nowrap' }}>
                            <strong>{workTime.fullName}</strong>
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-green-700">(Vy)</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-800">
                            {workTime.totalHours.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-800">
                            {workTime.nightHours.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-800">
                            {workTime.weekendHours.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-800">
                            {workTime.holidayHours.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-800">
                            <strong>{workTime.bonusHours.toFixed(2)}</strong>
                          </td>
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
