// Activity types for scheduling
export type ActivityType = 'D';

export interface ActivityCode {
  code: ActivityType;
  name: string;
  color: string;
  limit: number | null; // null means no specific limit
  description: string;
}

// Legend
export const activityCodes: ActivityCode[] = [
  {
    code: 'D',
    name: 'Dovolenka',
    color: '#c8e6c9', // green
    limit: 6, // max 6 consecutive days
    description: 'Bežná dovolenka'
  }
];

export interface ScheduleEntry {
  id: number;
  employeeNumber: number;
  date: Date;
  activityType: ActivityType;
  status: "Schválené" | "Čaká na schválenie";
}

// Mock schedule data
export const mockSchedules: ScheduleEntry[] = [
  // Admin's vacation
  {
    id: 1,
    employeeNumber: 1,
    date: new Date(2026, 6, 15),
    activityType: 'D',
    status: "Schválené"
  },
  {
    id: 2,
    employeeNumber: 1,
    date: new Date(2026, 6, 16),
    activityType: 'D',
    status: "Schválené"
  },
  {
    id: 3,
    employeeNumber: 1,
    date: new Date(2026, 6, 17),
    activityType: 'D',
    status: "Schválené"
  },
];

// Validation rules based on image-1.png
export interface SchedulingRules {
  maxConsecutiveVacationDays: number;
  maxControllersWithLimitedAvailability: number;
  maxLeadingControllersOnVacation: number;
  summerPeriodStart: { month: number; day: number };
  summerPeriodEnd: { month: number; day: number };
  maxVacationDaysInSummer: number;
  minControllersRequired: number;
}

export const schedulingRules: SchedulingRules = {
  maxConsecutiveVacationDays: 6,
  maxControllersWithLimitedAvailability: 3,
  maxLeadingControllersOnVacation: 2,
  summerPeriodStart: { month: 6, day: 15 }, // July 15
  summerPeriodEnd: { month: 7, day: 31 }, // August 31
  maxVacationDaysInSummer: 0, // No vacation in summer for leading controllers
  minControllersRequired: 10, // Minimum controllers that must be available
};
