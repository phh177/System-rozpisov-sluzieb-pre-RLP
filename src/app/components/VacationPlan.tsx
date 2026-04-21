import { useState, useMemo, useEffect, useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import PendingVacations from "./PendingVacations";
import { allEmployees } from "../data/employees";
import { teams } from "../data/teams";
import { useAuth } from "../context/AuthContext";
import { useVacations } from "../context/VacationContext";
import { isHoliday, isWeekend, isWorkingDay } from "../utils/holidays";

export default function VacationPlan() {
  const { currentUser } = useAuth();
  const currentEmployee = allEmployees.find((emp) => emp.number === currentUser?.number);
  const { vacations, addVacation, removeVacation, updateVacation } = useVacations();

  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"monthly" | "yearly" | "grid">("grid");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployeeNumber, setSelectedEmployeeNumber] = useState<number | null>(null);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  const selectedEmployeeRef = useRef<HTMLTableRowElement>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempVacations, setTempVacations] = useState<typeof vacations>([]);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [vacationToApprove, setVacationToApprove] = useState<number | null>(null);

  // Scroll to selected employee in grid view
  useEffect(() => {
    if (viewMode === "grid" && selectedEmployeeNumber && selectedEmployeeRef.current) {
      selectedEmployeeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedEmployeeNumber, viewMode]);

  // Functions for edit mode
  const handleEditClick = () => {
    setTempVacations(vacations);
    setIsEditMode(true);
  };

  const mergeConsecutiveVacations = (vacationList: typeof tempVacations) => {
    // Group by employee first
    const byEmployee = new Map<number, typeof tempVacations>();
    vacationList.forEach(v => {
      const existing = byEmployee.get(v.employeeNumber) || [];
      byEmployee.set(v.employeeNumber, [...existing, v]);
    });

    const merged: typeof tempVacations = [];

    // Process each employee separately
    byEmployee.forEach((empVacations, employeeNumber) => {
      // Sort by start date
      const sorted = [...empVacations].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      for (const vacation of sorted) {
        // Find last vacation for this employee in merged array
        const lastForEmployee = [...merged]
          .filter(v => v.employeeNumber === employeeNumber)
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

        if (!lastForEmployee) {
          merged.push({ ...vacation });
          continue;
        }

        const lastEnd = new Date(lastForEmployee.endDate);
        const currentStart = new Date(vacation.startDate);

        // Check if current vacation starts the day after or on the same day as last vacation ends
        const oneDayAfter = new Date(lastEnd);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);

        if (currentStart <= oneDayAfter && vacation.employeeNumber === lastForEmployee.employeeNumber) {
          // Merge: extend the end date of the last vacation
          if (vacation.endDate > lastForEmployee.endDate) {
            lastForEmployee.endDate = new Date(vacation.endDate);
          }
        } else {
          // Not consecutive, add as new vacation
          merged.push({ ...vacation });
        }
      }
    });

    return merged;
  };

  const handleSaveClick = () => {
    if (!currentUser) return;

    const isAdmin = currentUser.number === 1;

    // Get vacations to work with (all for admin, only current user for others)
    const relevantVacations = isAdmin
      ? vacations
      : vacations.filter(v => v.employeeNumber === currentUser.number);

    const relevantTempVacations = isAdmin
      ? tempVacations
      : tempVacations.filter(v => v.employeeNumber === currentUser.number);

    // Merge consecutive vacations
    const mergedTempVacations = mergeConsecutiveVacations(relevantTempVacations);

    // Find vacations to add (in temp but not in original)
    mergedTempVacations.forEach(tempVac => {
      const exists = relevantVacations.find(v => {
        // Check if this exact vacation already exists
        const sameDay = v.startDate.getFullYear() === tempVac.startDate.getFullYear() &&
                        v.startDate.getMonth() === tempVac.startDate.getMonth() &&
                        v.startDate.getDate() === tempVac.startDate.getDate() &&
                        v.endDate.getFullYear() === tempVac.endDate.getFullYear() &&
                        v.endDate.getMonth() === tempVac.endDate.getMonth() &&
                        v.endDate.getDate() === tempVac.endDate.getDate() &&
                        v.employeeNumber === tempVac.employeeNumber;
        return sameDay;
      });

      if (!exists) {
        // Determine status: if admin editing other employees, auto-approve
        let vacationStatus: "Schválené" | "Čaká na schválenie" = "Čaká na schválenie";
        if (isAdmin && tempVac.employeeNumber !== currentUser.number) {
          vacationStatus = "Schválené";
        }

        addVacation({ ...tempVac, status: vacationStatus });
      }
    });

    // Find vacations to remove (in original but not in temp)
    relevantVacations.forEach(originalVac => {
      const stillExists = mergedTempVacations.find(v => {
        const sameDay = v.startDate.getFullYear() === originalVac.startDate.getFullYear() &&
                        v.startDate.getMonth() === originalVac.startDate.getMonth() &&
                        v.startDate.getDate() === originalVac.startDate.getDate() &&
                        v.endDate.getFullYear() === originalVac.endDate.getFullYear() &&
                        v.endDate.getMonth() === originalVac.endDate.getMonth() &&
                        v.endDate.getDate() === originalVac.endDate.getDate() &&
                        v.employeeNumber === originalVac.employeeNumber;
        return sameDay;
      });

      if (!stillExists) {
        removeVacation(originalVac.id);
      }
    });

    setIsEditMode(false);
    setTempVacations([]);
  };

  const handleCancelClick = () => {
    setTempVacations([]);
    setIsEditMode(false);
  };

  const handleCellClickInEditMode = (employeeNumber: number, day: number) => {
    // Admin can edit all vacations, others can only edit their own
    const isAdmin = currentUser?.number === 1;
    if (!currentUser || (!isAdmin && employeeNumber !== currentUser.number)) return;

    const date = new Date(currentYear, currentMonth, day);

    // Check if vacation exists on this day
    const existingVacation = tempVacations.find(v =>
      v.employeeNumber === employeeNumber &&
      date >= v.startDate &&
      date <= v.endDate
    );

    if (existingVacation) {
      // Remove vacation - if it's a single day, remove the whole vacation
      // If it's multi-day, we need to split or trim it
      const isSingleDay = existingVacation.startDate.getTime() === existingVacation.endDate.getTime();

      if (isSingleDay) {
        // Remove the whole vacation
        setTempVacations(prev => prev.filter(v => v.id !== existingVacation.id));
      } else {
        // For simplicity, remove the whole vacation (can be enhanced later)
        setTempVacations(prev => prev.filter(v => v.id !== existingVacation.id));
      }
    } else {
      // Add single day vacation
      // If admin editing other employees, set as approved; otherwise pending
      const vacationStatus: "Schválené" | "Čaká na schválenie" =
        (isAdmin && employeeNumber !== currentUser.number) ? "Schválené" : "Čaká na schválenie";

      const newVacation = {
        id: Math.max(0, ...tempVacations.map(v => v.id)) + 1,
        employeeNumber: employeeNumber,
        startDate: date,
        endDate: date,
        status: vacationStatus,
      };
      setTempVacations(prev => [...prev, newVacation]);
    }
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Calculate days to display
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 });

  // Check if a date has vacation for displayed user (used in monthly view)
  const getVacationsForDate = (day: number) => {
    const displayEmployeeNumber = selectedEmployeeNumber || currentUser?.number;
    if (!displayEmployeeNumber) return [];
    const date = new Date(currentYear, currentMonth, day);
    return vacations.filter((vacation) => {
      return vacation.employeeNumber === displayEmployeeNumber &&
             date >= vacation.startDate &&
             date <= vacation.endDate;
    });
  };

  // Filter employees for search - only show if name STARTS with search term
  const filteredEmployees = useMemo(() => {
    if (!searchEmployee) return showEmployeeDropdown ? allEmployees : [];
    return allEmployees.filter((emp) =>
      emp.fullName.toLowerCase().startsWith(searchEmployee.toLowerCase()) ||
      emp.surname.toLowerCase().startsWith(searchEmployee.toLowerCase()) ||
      emp.name.toLowerCase().startsWith(searchEmployee.toLowerCase()) ||
      emp.number.toString().startsWith(searchEmployee)
    );
  }, [searchEmployee, showEmployeeDropdown]);

  const handleSelectEmployee = (employeeNumber: number) => {
    setSelectedEmployeeNumber(employeeNumber);
    setSearchEmployee("");
    setShowEmployeeDropdown(false);
  };

  const handleClearEmployee = () => {
    setSelectedEmployeeNumber(null);
    setSearchEmployee("");
    setShowEmployeeDropdown(false);
  };

  const toggleDropdown = () => {
    setShowEmployeeDropdown(!showEmployeeDropdown);
  };

  const displayedEmployee = selectedEmployeeNumber
    ? allEmployees.find((emp) => emp.number === selectedEmployeeNumber)
    : currentEmployee;

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calculate working days (excluding weekends and holidays)
  const calculateWorkingDays = (start: Date, end: Date) => {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      if (isWorkingDay(current, current.getFullYear())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  // Calculate total used vacation days for current employee
  const usedVacationDays = useMemo(() => {
    if (!currentUser) return 0;

    const employeeVacations = vacations.filter(v =>
      v.employeeNumber === currentUser.number && v.status === "Schválené"
    );
    let total = 0;

    employeeVacations.forEach(vacation => {
      total += calculateWorkingDays(vacation.startDate, vacation.endDate);
    });

    return total;
  }, [vacations, currentUser]);

  const remainingDays = currentEmployee
    ? currentEmployee.vacationDaysTotal + currentEmployee.vacationDaysCarriedOver - usedVacationDays
    : 0;

  const minimumRequired = currentEmployee
    ? currentEmployee.vacationDaysTotal - 10
    : 0;

  const showWarning = currentEmployee && usedVacationDays < minimumRequired;
  const daysToSchedule = minimumRequired - usedVacationDays;

  const handleAddVacation = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser || !currentEmployee || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError("Nie je možné naplánovať dovolenku do minulosti");
      return;
    }

    if (start > end) {
      setError("Začiatok dovolenky musí byť pred koncom dovolenky");
      return;
    }

    const requestedDays = calculateWorkingDays(start, end);

    if (requestedDays > remainingDays) {
      setError(`Nemáte dostatok dní dovolenky. Zostáva vám ${remainingDays} pracovných dní, požadujete ${requestedDays} pracovných dní.`);
      return;
    }

    // Find employee's team
    const employeeTeam = teams.find(team => team.employeeNumbers.includes(currentUser.number));

    // Check summer period (1.7 - 30.9) - max 21 calendar days
    const summerStart = new Date(start.getFullYear(), 6, 1); // July 1
    const summerEnd = new Date(start.getFullYear(), 8, 30); // September 30

    // Check if any part of vacation overlaps with summer period
    const overlapsSummer = (start <= summerEnd && end >= summerStart);

    if (overlapsSummer) {
      // Calculate total calendar days in summer for this employee including this vacation
      const employeeSummerVacations = vacations.filter(v => {
        if (v.employeeNumber !== currentUser.number || v.status !== "Schválené") return false;
        const vStart = new Date(v.startDate);
        const vEnd = new Date(v.endDate);
        return (vStart <= summerEnd && vEnd >= summerStart);
      });

      let totalSummerDays = 0;
      employeeSummerVacations.forEach(v => {
        const vStart = new Date(v.startDate);
        const vEnd = new Date(v.endDate);
        const overlapStart = vStart < summerStart ? summerStart : vStart;
        const overlapEnd = vEnd > summerEnd ? summerEnd : vEnd;
        const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalSummerDays += days;
      });

      // Add days from current request
      const requestOverlapStart = start < summerStart ? summerStart : start;
      const requestOverlapEnd = end > summerEnd ? summerEnd : end;
      const requestSummerDays = Math.ceil((requestOverlapEnd.getTime() - requestOverlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalSummerDays += requestSummerDays;

      if (totalSummerDays > 21) {
        setError(`V letnom období (1.7 - 30.9) môžete naplánovať max 21 kalendárnych dní. S touto dovolenkou by ste mali ${totalSummerDays} dní.`);
        return;
      }
    }

    // Check each day of the requested vacation period
    const current = new Date(start);
    while (current <= end) {
      // Count how many employees have vacation on this day
      const employeesOnVacation = vacations.filter(v => {
        const vDate = new Date(current);
        return v.status === "Schválené" && vDate >= v.startDate && vDate <= v.endDate;
      });

      // Rule 1: Max 6 employees on vacation at the same time
      if (employeesOnVacation.length >= 6) {
        setError(`Dňa ${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()} už má dovolenku 6 riadiacich. Maximálne 6 riadiacich môže mať dovolenku naraz.`);
        return;
      }

      // Rule 2: Max 4 from the same team (min 3 must be available)
      if (employeeTeam) {
        const teamMembersOnVacation = employeesOnVacation.filter(v =>
          employeeTeam.employeeNumbers.includes(v.employeeNumber)
        );

        if (teamMembersOnVacation.length >= 4) {
          setError(`Dňa ${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()} už majú 4 členovia z tímu ${employeeTeam.name} dovolenku. Minimálne 3 členovia tímu musia byť dostupní.`);
          return;
        }
      }

      // Rule 3: Max 2 shift leaders from the same team
      if (employeeTeam && currentEmployee.isShiftLeader) {
        const shiftLeadersOnVacation = employeesOnVacation.filter(v => {
          const emp = allEmployees.find(e => e.number === v.employeeNumber);
          return emp && emp.isShiftLeader && employeeTeam.employeeNumbers.includes(v.employeeNumber);
        });

        if (shiftLeadersOnVacation.length >= 2) {
          setError(`Dňa ${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()} už majú 2 vedúci zmeny z tímu ${employeeTeam.name} dovolenku. Maximálne 2 vedúci zmeny z jedného tímu môžu mať dovolenku naraz.`);
          return;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    const newVacation = {
      id: vacations.length + 1,
      employeeNumber: currentUser.number,
      startDate: start,
      endDate: end,
      status: "Čaká na schválenie" as const,
    };

    addVacation(newVacation);
    setStartDate("");
    setEndDate("");
    setShowAddForm(false);
    setError("");
  };

  const monthNames = [
    "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
    "Júl", "August", "September", "Október", "November", "December"
  ];

  const dayNames = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

  // Get tomorrow's date for min date validation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Grid view function - get vacation status for employee on this day
  const getVacationStatusOnDay = (employeeNumber: number, day: number): "Schválené" | "Čaká na schválenie" | null => {
    const date = new Date(currentYear, currentMonth, day);
    const vacationsToUse = isEditMode ? tempVacations : vacations;
    const vacation = vacationsToUse.find(v =>
      v.employeeNumber === employeeNumber &&
      date >= v.startDate &&
      date <= v.endDate
    );
    return vacation ? vacation.status : null;
  };

  // Validate vacation approval
  const validateVacationApproval = (vacationId: number): string | null => {
    const vacation = vacations.find(v => v.id === vacationId);
    if (!vacation) return "Dovolenka nebola nájdená";

    const employee = allEmployees.find(e => e.number === vacation.employeeNumber);
    if (!employee) return "Zamestnanec nebol nájdený";

    const start = new Date(vacation.startDate);
    const end = new Date(vacation.endDate);

    // Find employee's team
    const employeeTeam = teams.find(team => team.employeeNumbers.includes(vacation.employeeNumber));

    // Check summer period (1.7 - 30.9) - max 21 calendar days
    const summerStart = new Date(start.getFullYear(), 6, 1); // July 1
    const summerEnd = new Date(start.getFullYear(), 8, 30); // September 30
    const overlapsSummer = (start <= summerEnd && end >= summerStart);

    if (overlapsSummer) {
      // Calculate total calendar days in summer for this employee including this vacation
      const employeeSummerVacations = vacations.filter(v => {
        if (v.employeeNumber !== vacation.employeeNumber || v.id === vacationId || v.status !== "Schválené") return false;
        const vStart = new Date(v.startDate);
        const vEnd = new Date(v.endDate);
        return (vStart <= summerEnd && vEnd >= summerStart);
      });

      let totalSummerDays = 0;
      employeeSummerVacations.forEach(v => {
        const vStart = new Date(v.startDate);
        const vEnd = new Date(v.endDate);
        const overlapStart = vStart < summerStart ? summerStart : vStart;
        const overlapEnd = vEnd > summerEnd ? summerEnd : vEnd;
        const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalSummerDays += days;
      });

      // Add days from current vacation
      const requestOverlapStart = start < summerStart ? summerStart : start;
      const requestOverlapEnd = end > summerEnd ? summerEnd : end;
      const requestSummerDays = Math.ceil((requestOverlapEnd.getTime() - requestOverlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalSummerDays += requestSummerDays;

      if (totalSummerDays > 21) {
        return `Nie je možné schváliť: V letnom období (1.7 - 30.9) by zamestnanec ${employee.fullName} mal ${totalSummerDays} kalendárnych dní. Maximum je 21 dní.`;
      }
    }

    // Check each day of the vacation period for conflicts
    const current = new Date(start);
    while (current <= end) {
      // Count employees on vacation (excluding this one)
      const employeesOnVacation = vacations.filter(v => {
        if (v.id === vacationId || v.status !== "Schválené") return false; // Exclude current vacation
        const vDate = new Date(current);
        return vDate >= v.startDate && vDate <= v.endDate;
      });

      // Rule 1: Max 6 employees on vacation at the same time
      if (employeesOnVacation.length >= 6) {
        return `Nie je možné schváliť: Dňa ${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()} už má dovolenku 6 riadiacich. Maximálne 6 riadiacich môže mať dovolenku naraz.`;
      }

      // Rule 2: Max 4 from the same team (min 3 must be available)
      if (employeeTeam) {
        const teamMembersOnVacation = employeesOnVacation.filter(v =>
          employeeTeam.employeeNumbers.includes(v.employeeNumber)
        );

        if (teamMembersOnVacation.length >= 4) {
          return `Nie je možné schváliť: Dňa ${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()} už majú 4 členovia z tímu ${employeeTeam.name} dovolenku. Minimálne 3 členovia tímu musia byť dostupní.`;
        }
      }

      // Rule 3: Max 2 shift leaders from the same team
      if (employeeTeam && employee.isShiftLeader) {
        const shiftLeadersOnVacation = employeesOnVacation.filter(v => {
          const emp = allEmployees.find(e => e.number === v.employeeNumber);
          return emp && emp.isShiftLeader && employeeTeam.employeeNumbers.includes(v.employeeNumber);
        });

        if (shiftLeadersOnVacation.length >= 2) {
          return `Nie je možné schváliť: Dňa ${current.getDate()}.${current.getMonth() + 1}.${current.getFullYear()} už majú 2 vedúci zmeny z tímu ${employeeTeam.name} dovolenku. Maximálne 2 vedúci zmeny z jedného tímu môžu mať dovolenku naraz.`;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return null; // No errors, can be approved
  };

  // Handle vacation approval
  const handleApproveVacation = (vacationId: number) => {
    setApprovalError(null);
    setVacationToApprove(null);

    const validationError = validateVacationApproval(vacationId);
    if (validationError) {
      setApprovalError(validationError);
      setVacationToApprove(vacationId);
      return;
    }

    // Approve vacation
    const vacation = vacations.find(v => v.id === vacationId);
    if (vacation) {
      updateVacation(vacationId, { ...vacation, status: "Schválené" });
    }
  };

  // Handle vacation rejection
  const handleRejectVacation = (vacationId: number) => {
    removeVacation(vacationId);
    setApprovalError(null);
    setVacationToApprove(null);
  };

  // Get pending vacations (only for admin)
  const pendingVacations = useMemo(() => {
    return vacations.filter(v => v.status === "Čaká na schválenie");
  }, [vacations]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#faf7f0' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Header currentPage="Plán dovoleniek" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-9 space-y-6">
            {/* Vacation Summary */}
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}>
                  <p className="text-sm text-gray-600 mb-1">Nárok</p>
                  <p className="text-2xl text-gray-900">{currentEmployee?.vacationDaysTotal || 0} dní</p>
                </div>

                <div className="p-4 rounded-2xl" style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}>
                  <p className="text-sm text-gray-600 mb-1">Prenesená dovolenka</p>
                  <p className="text-2xl text-gray-900">{currentEmployee?.vacationDaysCarriedOver || 0} dní</p>
                </div>

                <div className="p-4 rounded-2xl" style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}>
                  <p className="text-sm text-gray-600 mb-1">Využitá dovolenka</p>
                  <p className="text-2xl text-gray-900">{usedVacationDays} dní</p>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: showWarning ? '#ffcccb' : '#faf7f0',
                    border: showWarning ? '2px solid #ff9999' : '2px solid #e8dcc4'
                  }}
                >
                  <p className="text-sm text-gray-600 mb-1">Zostatok dovolenky</p>
                  <p className={`text-2xl ${showWarning ? 'text-red-700' : 'text-gray-900'}`}>
                    {remainingDays} dní
                  </p>
                  {showWarning && (
                    <p className="text-xs text-red-700 mt-2">
                      ⚠️ Musíte naplánovať ešte aspoň {daysToSchedule} dní dovolenky. Môžete preniesť max 10 dní do budúceho roka.
                    </p>
                  )}
                  {remainingDays > 10 && !showWarning && (
                    <p className="text-xs text-orange-700 mt-2">
                      ⚠️ Máte viac ako 10 dní zostatok. Maximálne 10 dní sa môže preniesť do budúceho roka.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <p className="text-sm text-gray-700">
                <strong>Legenda:</strong>
                <span className="ml-2 inline-block px-2 py-1 rounded" style={{ backgroundColor: '#c8e6c9' }}>Schválená dovolenka</span>
                <span className="ml-2 inline-block px-2 py-1 rounded" style={{ backgroundColor: '#fff9e6' }}>Čaká na schválenie</span>
                <span className="ml-2 inline-block px-2 py-1 rounded" style={{ backgroundColor: '#b3d9ff' }}>Sviatok</span>
                <span className="ml-2 inline-block px-2 py-1 rounded" style={{ backgroundColor: '#e8dcc4' }}>Víkend</span>
              </p>
              <p className="text-gray-600 mt-2 text-xs">
                * Víkendy a sviatky sa neodpočítavajú z dní dovolenky
              </p>
            </div>

            {/* Vacation Planning Rules */}
            <div className="rounded-3xl p-6 shadow-lg" style={{ backgroundColor: '#fff9e6', border: '2px solid #ffd966' }}>
              <p className="text-sm text-gray-900 mb-2"><strong>Pravidlá plánovania:</strong></p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>1. Max 6 RLP môže mať dovolenku naraz</li>
                <li>2. Min 3 RLP z jedného tímu musia byť dostupní</li>
                <li>3. Max 2 VS z jedného tímu môžu mať dovolenku naraz</li>
                <li>4. Letné obdobie (1.7 - 30.9): max 21 kalendárnych dní</li>
                <li>5. Max 10 dní možno preniesť do budúceho roka</li>
              </ul>
            </div>

            {/* Add new vacation */}
            <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-900">Naplánovať novú dovolenku</h2>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 rounded-full text-black transition-all hover:brightness-95 active:brightness-90 cursor-pointer"
                    style={{ backgroundColor: '#c8e6c9' }}
                  >
                    + Pridať
                  </button>
                )}
              </div>

              {showAddForm && (
                <form onSubmit={handleAddVacation} className="space-y-4">
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Zamestnanec:</strong> {currentEmployee?.fullName}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Dostupné dni:</strong> {remainingDays} pracovných dní
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-2xl text-sm" style={{ backgroundColor: '#ffcccb', border: '2px solid #ff9999' }}>
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm text-gray-700 mb-2">
                        Začiatok dovolenky
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        min={minDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm text-gray-700 mb-2">
                        Koniec dovolenky
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={startDate || minDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full text-black transition-all hover:brightness-95 active:brightness-90 cursor-pointer"
                      style={{ backgroundColor: '#c8e6c9' }}
                    >
                      Uložiť dovolenku
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="px-4 py-2 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer"
                      style={{ backgroundColor: '#e8dcc4' }}
                    >
                      Zrušiť
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Pending vacation requests - Admin only */}
            {currentUser?.number === 1 && (
              <PendingVacations
                pendingVacations={pendingVacations}
                calculateWorkingDays={calculateWorkingDays}
                onApprove={handleApproveVacation}
                onReject={handleRejectVacation}
                approvalError={approvalError}
                vacationToApprove={vacationToApprove}
              />
            )}

            {/* Calendar/Grid View */}
            <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #e8dcc4' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-900">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-2 items-center">
                  {/* View mode toggle */}
                  <div className="flex rounded-full overflow-hidden mr-2" style={{ border: '2px solid #e8dcc4' }}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-sm transition-all cursor-pointer ${
                        viewMode === "grid" ? "text-gray-900" : "text-gray-600"
                      }`}
                      style={{ backgroundColor: viewMode === "grid" ? '#c8e6c9' : 'transparent' }}
                    >
                      Tabuľka
                    </button>
                    <button
                      onClick={() => setViewMode("monthly")}
                      className={`px-3 py-2 text-sm transition-all cursor-pointer ${
                        viewMode === "monthly" ? "text-gray-900" : "text-gray-600"
                      }`}
                      style={{ backgroundColor: viewMode === "monthly" ? '#c8e6c9' : 'transparent' }}
                    >
                      Mesačný
                    </button>
                    <button
                      onClick={() => setViewMode("yearly")}
                      className={`px-3 py-2 text-sm transition-all cursor-pointer ${
                        viewMode === "yearly" ? "text-gray-900" : "text-gray-600"
                      }`}
                      style={{ backgroundColor: viewMode === "yearly" ? '#c8e6c9' : 'transparent' }}
                    >
                      Ročný
                    </button>
                  </div>
                  <button
                    onClick={handlePreviousMonth}
                    className="w-10 h-10 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: '#d2a679' }}
                  >
                    <span className="text-white text-xl">←</span>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="w-10 h-10 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: '#d2a679' }}
                  >
                    <span className="text-white text-xl">→</span>
                  </button>
                </div>
              </div>

              {/* Employee search and Date selector */}
              <div className="mb-6 relative">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchEmployee}
                      onChange={(e) => {
                        setSearchEmployee(e.target.value);
                        if (e.target.value) setShowEmployeeDropdown(true);
                      }}
                      onFocus={() => {
                        if (!searchEmployee) setShowEmployeeDropdown(true);
                      }}
                      placeholder="Vyhľadať zamestnanca..."
                      className="w-full px-4 py-2 pr-12 rounded-full border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                    />
                    <button
                      onClick={toggleDropdown}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-gray-600">{showEmployeeDropdown ? '▲' : '▼'}</span>
                    </button>
                  </div>

                  {/* Month selector */}
                  <select
                    value={currentMonth}
                    onChange={(e) => setSelectedDate(new Date(currentYear, parseInt(e.target.value), 1))}
                    className="px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all cursor-pointer"
                    style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>

                  {/* Year selector */}
                  <select
                    value={currentYear}
                    onChange={(e) => setSelectedDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                    className="px-4 py-2 rounded-full border focus:outline-none focus:ring-2 transition-all cursor-pointer"
                    style={{ borderColor: '#e8dcc4', backgroundColor: '#faf7f0' }}
                  >
                    {Array.from({ length: 7 }, (_, i) => 2024 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  {selectedEmployeeNumber && (
                    <button
                      onClick={handleClearEmployee}
                      className="px-4 py-2 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer text-sm whitespace-nowrap"
                      style={{ backgroundColor: '#e8dcc4' }}
                    >
                      {viewMode === "grid" ? "Zrušiť výber" : "Zobraziť moju dovolenku"}
                    </button>
                  )}

                  {viewMode === "grid" && !isEditMode && (
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2 rounded-full text-black transition-all hover:brightness-95 active:brightness-90 cursor-pointer text-sm whitespace-nowrap"
                      style={{ backgroundColor: '#c8e6c9' }}
                    >
                      Editovať
                    </button>
                  )}

                  {viewMode === "grid" && isEditMode && (
                    <>
                      <button
                        onClick={handleSaveClick}
                        className="px-4 py-2 rounded-full text-black transition-all hover:brightness-95 active:brightness-90 cursor-pointer text-sm whitespace-nowrap"
                        style={{ backgroundColor: '#c8e6c9' }}
                      >
                        Uložiť
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="px-4 py-2 rounded-full transition-all hover:brightness-95 active:brightness-90 cursor-pointer text-sm whitespace-nowrap"
                        style={{ backgroundColor: '#ffcccb' }}
                      >
                        Zrušiť
                      </button>
                    </>
                  )}
                </div>
                {filteredEmployees.length > 0 && (showEmployeeDropdown || searchEmployee) && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-2xl shadow-lg overflow-y-auto"
                    style={{
                      backgroundColor: 'white',
                      border: '2px solid #e8dcc4',
                      maxHeight: '250px'
                    }}
                  >
                    {filteredEmployees.map((emp, index) => (
                      <button
                        key={emp.number}
                        onClick={() => handleSelectEmployee(emp.number)}
                        className="w-full px-4 py-3 text-left hover:brightness-95 transition-all cursor-pointer"
                        style={{
                          borderBottom: index < filteredEmployees.length - 1 ? '1px solid #e8dcc4' : 'none'
                        }}
                      >
                        <span className="text-gray-900">{emp.fullName}</span>
                        <span className="text-gray-600 ml-2 text-xs">(#{emp.number})</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedEmployeeNumber && displayedEmployee && (
                  <div className="mt-2 p-3 rounded-full text-sm" style={{ backgroundColor: '#c8e6c9' }}>
                    {viewMode === "grid"
                      ? `Zvýraznený zamestnanec: ${displayedEmployee.fullName}`
                      : `Zobrazuje sa dovolenka: ${displayedEmployee.fullName}`}
                  </div>
                )}
                {viewMode === "grid" && isEditMode && (
                  <div className="mt-2 p-3 rounded-full text-sm" style={{ backgroundColor: '#fff9e6', border: '2px solid #ffd966' }}>
                    <strong>Režim úprav:</strong> Kliknutím na políčka pod dátumami pridáte alebo vymažete dovolenku.
                    {currentUser?.number === 1
                      ? ' Ako admin môžete upravovať dovolenky všetkých zamestnancov.'
                      : ` Upravovať môžete len svoj riadok (${currentEmployee?.fullName}).`
                    }
                  </div>
                )}
              </div>

              {viewMode === "grid" ? (
                /* Grid view - Table */
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th
                          className="border p-1 sticky left-0 z-10 text-left whitespace-nowrap"
                          style={{ backgroundColor: '#e8dcc4', borderColor: '#d2a679' }}
                        >
                          Zamestnanec
                        </th>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const date = new Date(currentYear, currentMonth, day);
                          const weekend = isWeekend(date);
                          const holiday = isHoliday(date, currentYear);

                          return (
                            <th
                              key={day}
                              className="border p-1 min-w-[30px] text-center text-xs"
                              style={{
                                backgroundColor: holiday ? '#b3d9ff' : weekend ? '#e8dcc4' : '#faf7f0',
                                borderColor: '#d2a679'
                              }}
                              title={holiday ? holiday.name : ''}
                            >
                              <div className={`${holiday || weekend ? 'font-bold' : ''}`}>
                                {day}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {allEmployees.map((employee) => {
                        const isCurrentUser = employee.number === currentUser?.number;
                        const isSelected = selectedEmployeeNumber === employee.number;
                        const isHovered = hoveredRow === employee.number;

                        return (
                          <tr
                            key={employee.number}
                            ref={isSelected ? selectedEmployeeRef : null}
                            onMouseEnter={() => setHoveredRow(employee.number)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <td
                              className="border p-1 sticky left-0 z-10 text-xs whitespace-nowrap transition-colors"
                              style={{
                                backgroundColor: isSelected
                                  ? '#ffd966'
                                  : isCurrentUser
                                  ? '#c8e6c9'
                                  : isHovered
                                  ? '#faf7f0'
                                  : 'white',
                                borderColor: '#d2a679'
                              }}
                            >
                              <div className="font-medium">{employee.number} {employee.surname}</div>
                            </td>
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const vacationStatus = getVacationStatusOnDay(employee.number, day);
                            const date = new Date(currentYear, currentMonth, day);
                            const weekend = isWeekend(date);
                            const holiday = isHoliday(date, currentYear);

                            // Determine background color
                            let bgColor = 'white';
                            let titleText = '';
                            if (vacationStatus === "Schválené") {
                              bgColor = '#c8e6c9'; // Green for approved
                              titleText = 'Dovolenka - Schválené';
                            } else if (vacationStatus === "Čaká na schválenie") {
                              bgColor = '#fff9e6'; // Light yellow for pending
                              titleText = 'Dovolenka - Čaká na schválenie';
                            } else if (holiday) {
                              bgColor = '#b3d9ff';
                              titleText = holiday.name;
                            } else if (weekend) {
                              bgColor = '#e8dcc4';
                            } else if (isHovered) {
                              bgColor = '#faf7f0'; // Light hover color
                            }

                            const isAdmin = currentUser?.number === 1;
                            const isEditable = isEditMode && (isAdmin || isCurrentUser);
                            const cellCursor = isEditable ? 'cursor-pointer' : '';

                            return (
                              <td
                                key={day}
                                className={`border p-0.5 text-center transition-colors ${cellCursor}`}
                                style={{
                                  backgroundColor: bgColor,
                                  borderColor: '#d2a679'
                                }}
                                title={titleText}
                                onClick={() => isEditable && handleCellClickInEditMode(employee.number, day)}
                              >
                                {vacationStatus && (
                                  <span className="font-bold text-gray-900 text-xs">
                                    D
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : viewMode === "yearly" ? (
                /* Yearly view - 12 months */
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 12 }, (_, monthIndex) => {
                    const monthDate = new Date(currentYear, monthIndex, 1);
                    const monthDays = new Date(currentYear, monthIndex + 1, 0).getDate();
                    const firstDay = new Date(currentYear, monthIndex, 1).getDay();
                    const emptyMonthDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 });
                    const monthDaysArray = Array.from({ length: monthDays }, (_, i) => i + 1);

                    return (
                      <div key={monthIndex} className="p-3 rounded-2xl" style={{ backgroundColor: '#faf7f0', border: '2px solid #e8dcc4' }}>
                        <h3 className="text-sm text-gray-900 mb-2 text-center">{monthNames[monthIndex]}</h3>
                        <div className="grid grid-cols-7 gap-0.5">
                          {['P', 'U', 'S', 'Š', 'P', 'S', 'N'].map((day, dayIdx) => (
                            <div key={`day-${dayIdx}`} className="text-center text-xs text-gray-600">
                              {day}
                            </div>
                          ))}
                          {emptyMonthDays.map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square"></div>
                          ))}
                          {monthDaysArray.map((day) => {
                            const date = new Date(currentYear, monthIndex, day);
                            const displayEmployeeNumber = selectedEmployeeNumber || currentUser?.number;
                            const vacation = displayEmployeeNumber && vacations.find(v =>
                              v.employeeNumber === displayEmployeeNumber &&
                              date >= v.startDate && date <= v.endDate
                            );
                            const holiday = isHoliday(date, currentYear);
                            const weekend = isWeekend(date);

                            let bgColor = 'white';
                            let titleText = '';
                            if (holiday) {
                              bgColor = '#b3d9ff';
                              titleText = holiday.name;
                            } else if (vacation?.status === "Schválené") {
                              bgColor = '#c8e6c9';
                              titleText = 'Dovolenka - Schválené';
                            } else if (vacation?.status === "Čaká na schválenie") {
                              bgColor = '#fff9e6';
                              titleText = 'Dovolenka - Čaká na schválenie';
                            } else if (weekend) {
                              bgColor = '#e8dcc4';
                            }

                            return (
                              <div
                                key={day}
                                className="aspect-square rounded flex items-center justify-center"
                                style={{ backgroundColor: bgColor }}
                                title={titleText}
                              >
                                <div className={`text-xs ${weekend || holiday ? 'font-bold' : ''} ${holiday ? 'text-black' : 'text-gray-900'}`}>
                                  {day}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Monthly view */
                <div className="grid grid-cols-7 gap-2">
                  {/* Day names */}
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-sm text-gray-600 py-2">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for alignment */}
                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square"></div>
                  ))}

                  {/* Days */}
                  {daysArray.map((day) => {
                    const date = new Date(currentYear, currentMonth, day);
                    const dayVacations = getVacationsForDate(day);
                    const vacation = dayVacations.length > 0 ? dayVacations[0] : null;
                    const holiday = isHoliday(date, currentYear);
                    const weekend = isWeekend(date);

                    let bgColor = 'white';
                    let vacationText = '';
                    if (holiday) {
                      bgColor = '#b3d9ff';
                    } else if (vacation?.status === "Schválené") {
                      bgColor = '#c8e6c9';
                      vacationText = 'Dovolenka';
                    } else if (vacation?.status === "Čaká na schválenie") {
                      bgColor = '#fff9e6';
                      vacationText = 'Čaká na schválenie';
                    } else if (weekend) {
                      bgColor = '#e8dcc4';
                    }

                    return (
                      <div
                        key={day}
                        className="aspect-square border rounded-lg p-1 relative"
                        style={{
                          borderColor: '#e8dcc4',
                          backgroundColor: bgColor,
                        }}
                      >
                        <div className={`text-sm ${weekend || holiday ? 'font-bold' : ''} ${holiday ? 'text-black' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        {holiday && (
                          <div className="text-xs mt-1 text-black truncate" title={holiday.name}>
                            {holiday.name}
                          </div>
                        )}
                        {vacation && !holiday && (
                          <div className={`text-xs mt-1 ${vacation.status === "Schválené" ? 'text-green-700' : 'text-orange-700'}`}>
                            {vacationText}
                          </div>
                        )}
                      </div>
                    );
                  })}
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