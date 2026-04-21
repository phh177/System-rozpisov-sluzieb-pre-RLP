import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ApprovedSchedule {
  month: number;
  year: number;
  days: number;
  schedule: any;
  approvedAt: Date;
  approvedBy: number;
}

interface ScheduleContextType {
  approvedSchedule: ApprovedSchedule | null;
  approveSchedule: (schedule: ApprovedSchedule) => void;
  isLoading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [approvedSchedule, setApprovedSchedule] = useState<ApprovedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("approvedSchedule");
      if (stored) {
        const parsed = JSON.parse(stored);
        setApprovedSchedule({
          ...parsed,
          approvedAt: new Date(parsed.approvedAt)
        });
      }
    } catch (e) {
      console.error("Failed to load approved schedule from localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever approved schedule changes
  useEffect(() => {
    if (isLoading) return;

    try {
      if (approvedSchedule) {
        localStorage.setItem("approvedSchedule", JSON.stringify(approvedSchedule));
      } else {
        localStorage.removeItem("approvedSchedule");
      }
    } catch (e) {
      console.error("Failed to save approved schedule to localStorage:", e);
    }
  }, [approvedSchedule, isLoading]);

  const approveSchedule = (schedule: ApprovedSchedule) => {
    setApprovedSchedule(schedule);
  };

  return (
    <ScheduleContext.Provider value={{ approvedSchedule, approveSchedule, isLoading }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within ScheduleProvider");
  }
  return context;
}
