import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { mockVacations, Vacation } from "../data/vacations";

interface VacationContextType {
  vacations: Vacation[];
  addVacation: (vacation: Vacation) => void;
  removeVacation: (id: number) => void;
  updateVacation: (id: number, vacation: Vacation) => void;
  isLoading: boolean;
}

const VacationContext = createContext<VacationContextType | null>(null);

// Merge consecutive vacations for each employee
const mergeConsecutiveVacations = (vacationList: Vacation[]): Vacation[] => {
  // Group by employee
  const byEmployee = new Map<number, Vacation[]>();
  vacationList.forEach(v => {
    const existing = byEmployee.get(v.employeeNumber) || [];
    byEmployee.set(v.employeeNumber, [...existing, v]);
  });

  const merged: Vacation[] = [];

  // Process each employee's vacations
  byEmployee.forEach((empVacations, employeeNumber) => {
    // Sort by start date
    const sorted = empVacations.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    for (const vacation of sorted) {
      // Find if there's an existing vacation we can merge with
      const canMergeWith = merged.find(m => {
        if (m.employeeNumber !== employeeNumber) return false;

        const mEnd = new Date(m.endDate);
        const vStart = new Date(vacation.startDate);

        // Check if current vacation starts the day after or on the same day as existing vacation ends
        const oneDayAfter = new Date(mEnd);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);

        return vStart <= oneDayAfter;
      });

      if (canMergeWith) {
        // Merge: extend the end date if needed
        if (vacation.endDate > canMergeWith.endDate) {
          canMergeWith.endDate = new Date(vacation.endDate);
        }
      } else {
        // Not consecutive, add as new vacation
        merged.push({
          ...vacation,
          startDate: new Date(vacation.startDate),
          endDate: new Date(vacation.endDate)
        });
      }
    }
  });

  return merged;
};

export function VacationProvider({ children }: { children: ReactNode }) {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vacations");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const loadedVacations = parsed.map((v: any) => ({
          ...v,
          startDate: new Date(v.startDate),
          endDate: new Date(v.endDate)
        }));

        // Merge consecutive vacations
        const mergedVacations = mergeConsecutiveVacations(loadedVacations);
        setVacations(mergedVacations);
      } else {
        // If no stored data, use mockVacations
        setVacations(mergeConsecutiveVacations(mockVacations));
      }
    } catch (e) {
      console.error("Failed to load vacations from localStorage:", e);
      // Fallback to mockVacations on error
      setVacations(mergeConsecutiveVacations(mockVacations));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever vacations change (after initial load)
  useEffect(() => {
    if (isLoading) return;

    try {
      localStorage.setItem("vacations", JSON.stringify(vacations));
    } catch (e) {
      console.error("Failed to save vacations to localStorage:", e);
    }
  }, [vacations, isLoading]);

  const addVacation = (vacation: Vacation) => {
    setVacations(prev => [...prev, vacation]);
  };

  const removeVacation = (id: number) => {
    setVacations(prev => prev.filter(v => v.id !== id));
  };

  const updateVacation = (id: number, vacation: Vacation) => {
    setVacations(prev => prev.map(v => v.id === id ? vacation : v));
  };

  return (
    <VacationContext.Provider value={{ vacations, addVacation, removeVacation, updateVacation, isLoading }}>
      {children}
    </VacationContext.Provider>
  );
}

export function useVacations() {
  const context = useContext(VacationContext);
  if (!context) {
    throw new Error("useVacations must be used within VacationProvider");
  }
  return context;
}
