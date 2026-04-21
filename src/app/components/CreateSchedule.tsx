import { useState, useMemo, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import { useVacations } from "../context/VacationContext";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import { allEmployees } from "../data/employees";
import { teams } from "../data/teams";
import { isHoliday } from "../utils/holidays";

interface Absence {
  id: number;
  employeeNumber: number;
  startDate: Date;
  endDate: Date;
  type: "PN" | "Lekárska prehliadka" | "Žiadané voľno";
}

export default function CreateSchedule() {
  const currentDate = new Date(2026, 3, 14); // April 14, 2026
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  const [selectedMonth, setSelectedMonth] = useState(nextMonth.getMonth());
  const [selectedYear, setSelectedYear] = useState(nextMonth.getFullYear());
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [absenceStartDate, setAbsenceStartDate] = useState("");
  const [absenceEndDate, setAbsenceEndDate] = useState("");
  const [absenceType, setAbsenceType] = useState<"PN" | "Lekárska prehliadka" | "Žiadané voľno">("PN");
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<number | null>(null);
  const [rejectedRequests, setRejectedRequests] = useState<string[]>([]);

  const { vacations } = useVacations();
  const { approveSchedule, approvedSchedule } = useSchedule();
  const { currentUser } = useAuth();

  // Generate list of future months
  const futureMonths = useMemo(() => {
    const months = [];
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    for (let i = 0; i < 12; i++) {
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1);
      months.push({
        month: month.getMonth(),
        year: month.getFullYear(),
        label: month.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  }, []);

  // Get days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Get vacations for selected month
  const monthVacations = useMemo(() => {
    return vacations.filter(vacation => {
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      const monthStart = new Date(selectedYear, selectedMonth, 1);
      const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

      return (start <= monthEnd && end >= monthStart);
    });
  }, [vacations, selectedMonth, selectedYear]);

  // Group vacations by employee
  const vacationsByEmployee = useMemo(() => {
    const grouped = new Map<number, typeof vacations>();

    monthVacations.forEach(vacation => {
      const existing = grouped.get(vacation.employeeNumber) || [];
      grouped.set(vacation.employeeNumber, [...existing, vacation]);
    });

    return Array.from(grouped.entries()).map(([employeeNumber, vacations]) => {
      const employee = allEmployees.find(e => e.number === employeeNumber);
      return {
        employeeNumber,
        employee,
        vacations: vacations.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      };
    }).sort((a, b) => a.employeeNumber - b.employeeNumber);
  }, [monthVacations]);

  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('sk-SK', { month: 'long' }).toUpperCase();

  // Automatically regenerate schedule when vacations, absences, or month changes
  useEffect(() => {
    if (generatedSchedule && currentUser?.number === 1) {
      handleGenerateSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacations, absences, selectedMonth, selectedYear]);

  // Only admin can create schedules - check before rendering
  const isAdmin = currentUser?.number === 1;

  if (!isAdmin) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Header currentPage="Vytvoriť nový rozpis" />
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Sidebar />
            </div>
            <div className="col-span-9">
              <div className="rounded-3xl p-6 shadow-lg text-center" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
                <h2 className="text-xl mb-4 text-gray-900">
                  <strong>Prístup odmietnutý</strong>
                </h2>
                <p className="text-gray-600">
                  Nemáte oprávnenie vytvárať nové rozpisy. Táto funkcia je dostupná iba pre administrátorov.
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

  const handleEmployeeClick = (empNum: number | null | undefined) => {
    if (!empNum) {
      setSelectedEmployee(null);
    } else if (empNum === selectedEmployee) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(empNum);
    }
  };

  const handleAbsenceTypeChange = (type: "PN" | "Lekárska prehliadka" | "Žiadané voľno") => {
    setAbsenceType(type);
    // If switching to Lekárska prehliadka or Žiadané voľno and start date is set, auto-fill end date
    if ((type === "Lekárska prehliadka" || type === "Žiadané voľno") && absenceStartDate) {
      setAbsenceEndDate(absenceStartDate);
    }
  };

  const handleAbsenceStartDateChange = (date: string) => {
    setAbsenceStartDate(date);
    // If Lekárska prehliadka or Žiadané voľno, auto-fill end date with same date
    if (absenceType === "Lekárska prehliadka" || absenceType === "Žiadané voľno") {
      setAbsenceEndDate(date);
    }
  };

  const handleAddAbsence = () => {
    if (!selectedEmployee || !absenceStartDate || !absenceEndDate) return;

    const startDate = new Date(absenceStartDate);
    const endDate = new Date(absenceEndDate);

    if (startDate > endDate) {
      alert("Začiatok absencie musí byť pred koncom absencie");
      return;
    }

    // Check if "Žiadané voľno" limit exceeded (max 2 per employee)
    if (absenceType === "Žiadané voľno") {
      const existingRequestedDaysOff = absences.filter(
        a => a.employeeNumber === selectedEmployee && a.type === "Žiadané voľno"
      );

      if (existingRequestedDaysOff.length >= 2) {
        alert("Nemožno pridať viac ako 2 žiadané voľná pre jedného zamestnanca");
        return;
      }
    }

    // Check for date overlaps with existing absences for this employee
    const employeeAbsences = absences.filter(a => a.employeeNumber === selectedEmployee);

    for (const existing of employeeAbsences) {
      const existingStart = new Date(existing.startDate);
      const existingEnd = new Date(existing.endDate);

      // Check if dates overlap
      if (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      ) {
        const employee = allEmployees.find(e => e.number === selectedEmployee);
        alert(
          `Zamestnanec ${employee?.fullName} už má absenciu typu "${existing.type}" v období ${existingStart.toLocaleDateString('sk-SK')} - ${existingEnd.toLocaleDateString('sk-SK')}. ` +
          `Jeden zamestnanec môže mať v jednom dátume iba jeden typ absencie.`
        );
        return;
      }
    }

    const newAbsence: Absence = {
      id: Date.now(),
      employeeNumber: selectedEmployee,
      startDate: startDate,
      endDate: endDate,
      type: absenceType
    };

    setAbsences([...absences, newAbsence]);
    setSelectedEmployee(null);
    setAbsenceStartDate("");
    setAbsenceEndDate("");
  };

  const handleRemoveAbsence = (id: number) => {
    setAbsences(absences.filter(a => a.id !== id));
  };

  function handleGenerateSchedule() {
    const rejected: string[] = [];
    const positions = ['ES', 'ECA', 'PCA', 'ECT', 'ECG', 'RLC'];
    const schedule: any = {};

    // Track employee shift history: Map<employeeNumber, Array<{day, type}>>
    const employeeHistory = new Map<number, Array<{day: number, type: 'day' | 'night'}>>();
    allEmployees.forEach(emp => employeeHistory.set(emp.number, []));

    // Track which employees are assigned on each day
    const dailyAssignments = new Map<number, Set<number>>();

    // Rotation pattern: day shift, night shift, 3 days off (5-day cycle)
    const getCycleDay = (teamIndex: number, day: number): 'day' | 'night' | 'off' => {
      const cyclePosition = (day - 1 + teamIndex) % 5;
      if (cyclePosition === 0) return 'day';
      if (cyclePosition === 1) return 'night';
      return 'off';
    };

    // Check if employee is available for a shift
    const isEmployeeAvailable = (employeeNumber: number, day: number, shiftType: 'day' | 'night', allowExtreme: boolean = false): boolean => {
      const checkDate = new Date(selectedYear, selectedMonth, day);
      checkDate.setHours(0, 0, 0, 0);

      // Check if already assigned this day
      const assigned = dailyAssignments.get(day) || new Set();
      if (assigned.has(employeeNumber)) return false;

      // Check vacations
      const hasVacation = monthVacations.some(v => {
        if (v.employeeNumber !== employeeNumber || v.status !== "Schválené") return false;
        const vStart = new Date(v.startDate);
        vStart.setHours(0, 0, 0, 0);
        const vEnd = new Date(v.endDate);
        vEnd.setHours(0, 0, 0, 0);
        return checkDate >= vStart && checkDate <= vEnd;
      });

      if (hasVacation) return false;

      // For night shifts (19:00-07:00), check if employee has vacation on the NEXT day
      // because night shift ends in the morning of the next day
      if (shiftType === 'night') {
        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const hasVacationNextDay = monthVacations.some(v => {
          if (v.employeeNumber !== employeeNumber || v.status !== "Schválené") return false;
          const vStart = new Date(v.startDate);
          vStart.setHours(0, 0, 0, 0);
          const vEnd = new Date(v.endDate);
          vEnd.setHours(0, 0, 0, 0);
          return nextDay >= vStart && nextDay <= vEnd;
        });

        if (hasVacationNextDay) return false;
      }

      // Check absences
      const relevantAbsences = absences.filter(a => {
        if (a.employeeNumber !== employeeNumber) return false;
        const aStart = new Date(a.startDate);
        aStart.setHours(0, 0, 0, 0);
        const aEnd = new Date(a.endDate);
        aEnd.setHours(0, 0, 0, 0);
        return checkDate >= aStart && checkDate <= aEnd;
      });

      for (const absence of relevantAbsences) {
        // PN and Lekárska prehliadka are hard blocks - employee cannot work
        if (absence.type === "PN" || absence.type === "Lekárska prehliadka") {
          return false;
        }
        // "Žiadané voľno" is NOT a hard block - it's just a preference
        // Employee can still be assigned, but we'll report it as unmet request later
      }

      // For night shifts, check absences on the NEXT day as well
      if (shiftType === 'night') {
        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const relevantAbsencesNextDay = absences.filter(a => {
          if (a.employeeNumber !== employeeNumber) return false;
          const aStart = new Date(a.startDate);
          aStart.setHours(0, 0, 0, 0);
          const aEnd = new Date(a.endDate);
          aEnd.setHours(0, 0, 0, 0);
          return nextDay >= aStart && nextDay <= aEnd;
        });

        for (const absence of relevantAbsencesNextDay) {
          if (absence.type === "PN" || absence.type === "Lekárska prehliadka") {
            return false;
          }
        }
      }

      // Check shift pattern rules
      const history = employeeHistory.get(employeeNumber) || [];
      if (history.length === 0) return true;

      const lastShifts = history.slice(-4);
      const yesterdayShift = lastShifts.find(s => s.day === day - 1);
      const twoDaysAgoShift = lastShifts.find(s => s.day === day - 2);
      const threeDaysAgoShift = lastShifts.find(s => s.day === day - 3);

      // CRITICAL: After a night shift, employee MUST have at least 1 day off
      if (yesterdayShift && yesterdayShift.type === 'night') {
        return false;
      }

      // CRITICAL: Cannot have only 1 day off between shifts
      // Check if there was a shift 2 days ago but not yesterday
      if (twoDaysAgoShift && !yesterdayShift) {
        // This would create pattern: shift - 1 day off - shift (FORBIDDEN)
        return false;
      }

      // Max 4 consecutive shifts
      const consecutiveShifts = [];
      for (let i = day - 1; i >= 1; i--) {
        const shiftOnDay = lastShifts.find(s => s.day === i);
        if (shiftOnDay) {
          consecutiveShifts.unshift(shiftOnDay);
        } else {
          break;
        }
      }

      // CRITICAL: Max 2 consecutive DAY shifts
      if (shiftType === 'day') {
        const consecutiveDayShifts = [];
        for (let i = consecutiveShifts.length - 1; i >= 0; i--) {
          if (consecutiveShifts[i].type === 'day') {
            consecutiveDayShifts.unshift(consecutiveShifts[i]);
          } else {
            break;
          }
        }
        if (consecutiveDayShifts.length >= 2) {
          // Already have 2 consecutive day shifts, cannot add another
          return false;
        }
      }

      // Check patterns:
      // Allowed: day-day-night-night (in extreme cases), day-day-night, day-night-night, night-night, day-night, day-day
      if (consecutiveShifts.length >= 4) {
        // Already 4 consecutive shifts, cannot add another unless extreme
        if (!allowExtreme) return false;
      }

      if (consecutiveShifts.length === 3) {
        // Check if this would be day-day-night-night (allowed only in extreme cases)
        if (consecutiveShifts[0].type === 'day' &&
            consecutiveShifts[1].type === 'day' &&
            consecutiveShifts[2].type === 'night' &&
            shiftType === 'night') {
          if (!allowExtreme) return false;
        }
      }

      // Max 2 night shifts in a row
      if (shiftType === 'night' && consecutiveShifts.length >= 2) {
        if (consecutiveShifts[consecutiveShifts.length - 1].type === 'night' &&
            consecutiveShifts[consecutiveShifts.length - 2].type === 'night') {
          return false;
        }
      }

      return true;
    };

    // Track position assignments to ensure rotation
    const positionHistory = new Map<string, number>(); // key: "employeeNumber-position", value: count

    // Assign positions for a shift from a specific team
    const assignShiftFromTeam = (team: typeof teams[0], day: number, shiftType: 'day' | 'night') => {
      const result: any = {};
      const assignedToday = dailyAssignments.get(day) || new Set();

      // Get available team members (strict)
      let availableFromTeam = team.employeeNumbers
        .map(num => allEmployees.find(emp => emp.number === num))
        .filter((emp): emp is typeof allEmployees[0] =>
          emp !== undefined &&
          isEmployeeAvailable(emp.number, day, shiftType, false) &&
          !assignedToday.has(emp.number)
        );

      // If team doesn't have enough people, try to find replacements from other teams
      if (availableFromTeam.length < positions.length) {
        const otherTeamMembers = allEmployees.filter(emp =>
          !team.employeeNumbers.includes(emp.number) &&
          isEmployeeAvailable(emp.number, day, shiftType, false) &&
          !assignedToday.has(emp.number)
        );
        availableFromTeam.push(...otherTeamMembers);
      }

      // If still not enough, allow extreme cases (day-day-night-night pattern)
      if (availableFromTeam.length < positions.length) {
        const emergencyAvailable = allEmployees.filter(emp =>
          isEmployeeAvailable(emp.number, day, shiftType, true) &&
          !availableFromTeam.some(e => e.number === emp.number) &&
          !assignedToday.has(emp.number)
        );
        availableFromTeam.push(...emergencyAvailable);
      }

      if (availableFromTeam.length === 0) return result;

      // Separate shift leaders for ES position
      const availableLeaders = availableFromTeam.filter(emp => emp.isShiftLeader);

      // Helper: get number of shifts this week
      const weekStart = Math.floor((day - 1) / 7) * 7 + 1;
      const getWeeklyShifts = (empNum: number) => {
        const history = employeeHistory.get(empNum) || [];
        return history.filter(s => s.day >= weekStart && s.day < weekStart + 7).length;
      };

      // Helper: get times employee worked a specific position
      const getPositionCount = (empNum: number, position: string) => {
        return positionHistory.get(`${empNum}-${position}`) || 0;
      };

      // Helper: check if employee worked yesterday (prefer continuous shifts)
      const workedYesterday = (empNum: number) => {
        const history = employeeHistory.get(empNum) || [];
        return history.some(s => s.day === day - 1);
      };

      // Assign ES position (must be shift leader) - rotate among leaders
      if (availableLeaders.length > 0) {
        const sortedLeaders = [...availableLeaders].sort((a, b) => {
          // First priority: worked yesterday (prefer continuous shifts)
          const aWorkedYesterday = workedYesterday(a.number);
          const bWorkedYesterday = workedYesterday(b.number);
          if (aWorkedYesterday !== bWorkedYesterday) return aWorkedYesterday ? -1 : 1;

          // Second priority: fewer shifts this week
          const shiftsA = getWeeklyShifts(a.number);
          const shiftsB = getWeeklyShifts(b.number);
          if (shiftsA !== shiftsB) return shiftsA - shiftsB;

          // Third priority: fewer times on ES position
          const esCountA = getPositionCount(a.number, 'ES');
          const esCountB = getPositionCount(b.number, 'ES');
          if (esCountA !== esCountB) return esCountA - esCountB;

          // Fourth priority: team member over replacement
          const aIsTeamMember = team.employeeNumbers.includes(a.number);
          const bIsTeamMember = team.employeeNumbers.includes(b.number);
          if (aIsTeamMember !== bIsTeamMember) return aIsTeamMember ? -1 : 1;

          return a.number - b.number;
        });

        const leader = sortedLeaders[0];
        result['ES'] = leader.number;
        assignedToday.add(leader.number);
        positionHistory.set(`${leader.number}-ES`, getPositionCount(leader.number, 'ES') + 1);
      }

      // Assign other positions with rotation to ensure everyone rotates through positions
      const otherPositions = positions.filter(p => p !== 'ES');
      const remainingAvailable = availableFromTeam.filter(emp => !assignedToday.has(emp.number));

      if (remainingAvailable.length > 0) {
        // For each position, find the best employee
        otherPositions.forEach((pos) => {
          if (remainingAvailable.length === 0) return;

          const sortedForPosition = [...remainingAvailable].sort((a, b) => {
            // First priority: worked yesterday (prefer continuous shifts)
            const aWorkedYesterday = workedYesterday(a.number);
            const bWorkedYesterday = workedYesterday(b.number);
            if (aWorkedYesterday !== bWorkedYesterday) return aWorkedYesterday ? -1 : 1;

            // Second priority: fewer shifts this week
            const shiftsA = getWeeklyShifts(a.number);
            const shiftsB = getWeeklyShifts(b.number);
            if (shiftsA !== shiftsB) return shiftsA - shiftsB;

            // Third priority: fewer times on this specific position
            const posCountA = getPositionCount(a.number, pos);
            const posCountB = getPositionCount(b.number, pos);
            if (posCountA !== posCountB) return posCountA - posCountB;

            // Fourth priority: team member over replacement
            const aIsTeamMember = team.employeeNumbers.includes(a.number);
            const bIsTeamMember = team.employeeNumbers.includes(b.number);
            if (aIsTeamMember !== bIsTeamMember) return aIsTeamMember ? -1 : 1;

            return a.number - b.number;
          });

          const selectedEmp = sortedForPosition[0];
          result[pos] = selectedEmp.number;
          assignedToday.add(selectedEmp.number);
          positionHistory.set(`${selectedEmp.number}-${pos}`, getPositionCount(selectedEmp.number, pos) + 1);

          // Remove assigned employee from available list
          const empIndex = remainingAvailable.findIndex(e => e.number === selectedEmp.number);
          if (empIndex > -1) {
            remainingAvailable.splice(empIndex, 1);
          }
        });
      }

      // Update daily assignments and employee history
      dailyAssignments.set(day, assignedToday);
      Object.values(result).forEach((empNum: any) => {
        if (empNum) {
          const history = employeeHistory.get(empNum) || [];
          history.push({ day, type: shiftType });
          employeeHistory.set(empNum, history);
        }
      });

      return result;
    };

    // Generate schedule for each day using team rotation
    for (let day = 1; day <= daysInMonth; day++) {
      schedule[day] = {
        day: {},
        night: {}
      };

      // Find which teams work this day based on rotation cycle
      let dayTeam = null;
      let nightTeam = null;

      for (let i = 0; i < teams.length; i++) {
        const cycleDay = getCycleDay(i, day);
        if (cycleDay === 'day' && !dayTeam) {
          dayTeam = teams[i];
        } else if (cycleDay === 'night' && !nightTeam) {
          nightTeam = teams[i];
        }
      }

      // Assign positions from the designated teams
      if (dayTeam) {
        schedule[day].day = assignShiftFromTeam(dayTeam, day, 'day');
      }
      if (nightTeam) {
        schedule[day].night = assignShiftFromTeam(nightTeam, day, 'night');
      }
    }

    // Check all "Žiadané voľno" absences and see if employees were assigned to day shifts
    absences.forEach(absence => {
      if (absence.type !== "Žiadané voľno") return;

      const employee = allEmployees.find(e => e.number === absence.employeeNumber);
      if (!employee) return;

      const absenceDate = new Date(absence.startDate);
      const day = absenceDate.getDate();

      // Check if this employee was assigned to day shift on this day
      const dayShift = schedule[day]?.day;
      if (!dayShift) return;

      const isAssignedToDayShift = Object.values(dayShift).some(empNum => empNum === absence.employeeNumber);

      if (isAssignedToDayShift) {
        rejected.push(
          `Zamestnancovi ${employee.fullName} (${employee.number}) nebolo možné vyhovieť v žiadosti o voľno dňa ${absenceDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' })}`
        );
      }
    });

    setGeneratedSchedule({
      month: selectedMonth,
      year: selectedYear,
      days: daysInMonth,
      schedule
    });
    setRejectedRequests(rejected);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Vytvoriť nový rozpis" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9 space-y-6">
            {/* Month Selection */}
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h3 className="text-lg mb-4 text-gray-900"><strong>Vybrať mesiac:</strong></h3>
              <select
                value={`${selectedYear}-${selectedMonth}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setSelectedYear(parseInt(year));
                  setSelectedMonth(parseInt(month));
                  setGeneratedSchedule(null);
                }}
                className="w-full p-3 rounded-2xl border-2 border-gray-300 focus:border-blue-400 focus:outline-none"
              >
                {futureMonths.map((m) => (
                  <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Absences */}
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h3 className="text-lg mb-4 text-gray-900"><strong>Absencie:</strong></h3>

              <div className="mb-4 p-3 rounded-2xl text-xs" style={{ backgroundColor: '#fff9e6', border: '2px solid #ffd966' }}>
                <strong>Pravidlo:</strong> Žiadané voľno je obmedzené na max 2 osobitné dni pre jedného zamestnanca (jednodňové)
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Zamestnanec:</label>
                    <select
                      value={selectedEmployee || ""}
                      onChange={(e) => setSelectedEmployee(parseInt(e.target.value))}
                      className="w-full p-2 rounded-2xl border-2 border-gray-300 focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">Vyberte zamestnanca</option>
                      {allEmployees.map((emp) => (
                        <option key={emp.number} value={emp.number}>
                          {emp.number} {emp.surname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Od:</label>
                    <input
                      type="date"
                      value={absenceStartDate}
                      onChange={(e) => handleAbsenceStartDateChange(e.target.value)}
                      min={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`}
                      max={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${daysInMonth}`}
                      className="w-full p-2 rounded-2xl border-2 border-gray-300 focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Do:</label>
                    <input
                      type="date"
                      value={absenceEndDate}
                      onChange={(e) => setAbsenceEndDate(e.target.value)}
                      min={absenceStartDate || `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`}
                      max={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${daysInMonth}`}
                      disabled={absenceType === "Lekárska prehliadka" || absenceType === "Žiadané voľno"}
                      className="w-full p-2 rounded-2xl border-2 border-gray-300 focus:border-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Typ absencie:</label>
                  <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="PN"
                        checked={absenceType === "PN"}
                        onChange={(e) => handleAbsenceTypeChange(e.target.value as "PN")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">PN</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Lekárska prehliadka"
                        checked={absenceType === "Lekárska prehliadka"}
                        onChange={(e) => handleAbsenceTypeChange(e.target.value as "Lekárska prehliadka")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Lekárska prehliadka</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Žiadané voľno"
                        checked={absenceType === "Žiadané voľno"}
                        onChange={(e) => handleAbsenceTypeChange(e.target.value as "Žiadané voľno")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Žiadané voľno</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleAddAbsence}
                  disabled={!selectedEmployee || !absenceStartDate || !absenceEndDate}
                  className="px-6 py-2 rounded-full transition-all hover:brightness-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#b3d9ff', color: '#000' }}
                >
                  Pridať absenciu
                </button>

                {/* Absences List */}
                {absences.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm text-gray-700 mb-2"><strong>Pridané absencie:</strong></h4>
                    {absences.map((absence) => {
                      const employee = allEmployees.find(e => e.number === absence.employeeNumber);
                      const isSingleDay = absence.startDate.getDate() === absence.endDate.getDate() &&
                                         absence.startDate.getMonth() === absence.endDate.getMonth() &&
                                         absence.startDate.getFullYear() === absence.endDate.getFullYear();

                      const absenceColor = absence.type === "Žiadané voľno" ? '#ffd966' : '#ffb3ba';

                      return (
                        <div
                          key={absence.id}
                          className="flex items-center justify-between p-3 rounded-2xl"
                          style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}
                        >
                          <div className="text-sm">
                            <span className="font-medium">{employee?.number} {employee?.surname}</span>
                            {' - '}
                            <span>
                              {absence.startDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}
                              {!isSingleDay && `-${absence.endDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}`}
                            </span>
                            {' - '}
                            <span className="px-2 py-1 rounded" style={{ backgroundColor: absenceColor }}>
                              {absence.type}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveAbsence(absence.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Odstrániť
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Vacations for selected month */}
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <h3 className="text-lg mb-4 text-gray-900"><strong>Dovolenky v mesiaci {monthName} {selectedYear}:</strong></h3>

              {vacationsByEmployee.length === 0 ? (
                <p className="text-sm text-gray-600">Žiadne dovolenky v tomto mesiaci</p>
              ) : (
                <div className="space-y-2">
                  {vacationsByEmployee
                    .filter(({ employee }) => employee !== null && employee !== undefined)
                    .map(({ employeeNumber, employee, vacations }) => (
                    <div
                      key={employeeNumber}
                      className="p-3 rounded-2xl text-sm"
                      style={{ backgroundColor: '#c8e6c9', border: '2px solid #a5d6a7' }}
                    >
                      <span className="font-medium">{employee?.number} {employee?.surname}</span>
                      {' - '}
                      {vacations.map((vacation, index) => {
                        const startDate = new Date(vacation.startDate);
                        const endDate = new Date(vacation.endDate);
                        const isSingleDay = startDate.getDate() === endDate.getDate() &&
                                           startDate.getMonth() === endDate.getMonth() &&
                                           startDate.getFullYear() === endDate.getFullYear();

                        return (
                          <span key={vacation.id}>
                            {index > 0 && ', '}
                            {startDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}
                            {!isSingleDay && `-${endDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}`}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGenerateSchedule}
                className="px-8 py-3 rounded-full text-lg transition-all hover:brightness-95 active:brightness-90"
                style={{ backgroundColor: '#ffd966', color: '#000' }}
              >
                Generuj rozpis
              </button>
              {generatedSchedule && (
                <button
                  onClick={() => {
                    if (!currentUser) return;

                    // Check if there's already an approved schedule
                    if (approvedSchedule) {
                      const confirmed = window.confirm(
                        "Už existuje schválený rozpis. Chcete ho nahradiť novo-vygenerovaným rozpisom?"
                      );

                      if (!confirmed) {
                        // User clicked "No" - discard changes
                        return;
                      }
                    }

                    // Approve the schedule (either first time or after confirmation)
                    approveSchedule({
                      month: generatedSchedule.month,
                      year: generatedSchedule.year,
                      days: generatedSchedule.days,
                      schedule: generatedSchedule.schedule,
                      approvedAt: new Date(),
                      approvedBy: currentUser.number
                    });
                    alert("Rozpis bol schválený a odoslaný všetkým užívateľom!");
                  }}
                  className="px-8 py-3 rounded-full text-lg transition-all hover:brightness-95 active:brightness-90"
                  style={{ backgroundColor: '#c8e6c9', color: '#000' }}
                >
                  Schváľ rozpis
                </button>
              )}
            </div>

            {/* Generated Schedule */}
            {generatedSchedule && (
              <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
                <h2 className="text-xl mb-4 text-center text-gray-900">
                  <strong>Rozpis služieb ATCO na mesiac {monthName} {selectedYear}</strong>
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
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const date = new Date(selectedYear, selectedMonth, day);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        const holidayInfo = isHoliday(date, selectedYear);

                        const daySchedule = generatedSchedule?.schedule?.[day];
                        const positions = ['ES', 'ECA', 'PCA', 'ECT', 'ECG', 'RLC'];

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
            )}

            {/* Rejected Requests */}
            {rejectedRequests.length > 0 && (
              <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #ffb3ba' }}>
                <h3 className="text-lg mb-4 text-gray-900">
                  <strong>Neakceptované žiadosti o voľno:</strong>
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nasledujúce žiadosti o voľno nebolo možné akceptovať kvôli potrebe dodržať pravidlá rozpisu služieb:
                </p>
                <div className="space-y-2">
                  {rejectedRequests.map((request, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-2xl text-sm"
                      style={{ backgroundColor: '#ffe8e8', border: '2px solid #ffb3ba' }}
                    >
                      {request}
                    </div>
                  ))}
                </div>
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
