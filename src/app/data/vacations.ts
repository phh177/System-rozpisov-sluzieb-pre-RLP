export interface Vacation {
  id: number;
  employeeNumber: number;
  startDate: Date;
  endDate: Date;
  status: "Schválené" | "Čaká na schválenie";
}

export const mockVacations: Vacation[] = [
  // Tím A (1-6) - vedúci zmeny: 1
  { id: 1, employeeNumber: 1, startDate: new Date(2026, 6, 1), endDate: new Date(2026, 6, 14), status: "Schválené" },
  { id: 2, employeeNumber: 1, startDate: new Date(2026, 10, 2), endDate: new Date(2026, 10, 8), status: "Schválené" },
  { id: 3, employeeNumber: 2, startDate: new Date(2026, 7, 3), endDate: new Date(2026, 7, 16), status: "Schválené" },
  { id: 4, employeeNumber: 2, startDate: new Date(2026, 11, 1), endDate: new Date(2026, 11, 7), status: "Schválené" },
  { id: 5, employeeNumber: 3, startDate: new Date(2026, 5, 8), endDate: new Date(2026, 5, 21), status: "Schválené" },
  { id: 6, employeeNumber: 3, startDate: new Date(2026, 9, 5), endDate: new Date(2026, 9, 11), status: "Schválené" },
  { id: 7, employeeNumber: 4, startDate: new Date(2026, 6, 20), endDate: new Date(2026, 7, 2), status: "Schválené" },
  { id: 8, employeeNumber: 4, startDate: new Date(2026, 10, 16), endDate: new Date(2026, 10, 22), status: "Schválené" },
  { id: 9, employeeNumber: 5, startDate: new Date(2026, 7, 17), endDate: new Date(2026, 7, 30), status: "Schválené" },
  { id: 10, employeeNumber: 5, startDate: new Date(2026, 11, 14), endDate: new Date(2026, 11, 20), status: "Schválené" },
  { id: 11, employeeNumber: 6, startDate: new Date(2026, 5, 22), endDate: new Date(2026, 6, 5), status: "Schválené" },
  { id: 12, employeeNumber: 6, startDate: new Date(2026, 9, 19), endDate: new Date(2026, 9, 25), status: "Schválené" },

  // Tím B (7-12) - vedúci stanovišťa: 7
  { id: 15, employeeNumber: 7, startDate: new Date(2026, 4, 18), endDate: new Date(2026, 4, 31), status: "Schválené" },
  { id: 16, employeeNumber: 7, startDate: new Date(2026, 9, 12), endDate: new Date(2026, 9, 18), status: "Schválené" },
  { id: 17, employeeNumber: 8, startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 14), status: "Schválené" },
  { id: 18, employeeNumber: 8, startDate: new Date(2026, 10, 9), endDate: new Date(2026, 10, 15), status: "Schválené" },
  { id: 19, employeeNumber: 9, startDate: new Date(2026, 6, 6), endDate: new Date(2026, 6, 19), status: "Schválené" },
  { id: 20, employeeNumber: 9, startDate: new Date(2026, 11, 7), endDate: new Date(2026, 11, 13), status: "Schválené" },
  { id: 21, employeeNumber: 10, startDate: new Date(2026, 7, 10), endDate: new Date(2026, 7, 23), status: "Schválené" },
  { id: 22, employeeNumber: 10, startDate: new Date(2026, 10, 23), endDate: new Date(2026, 10, 29), status: "Schválené" },
  { id: 23, employeeNumber: 11, startDate: new Date(2026, 5, 15), endDate: new Date(2026, 5, 28), status: "Schválené" },
  { id: 24, employeeNumber: 11, startDate: new Date(2026, 9, 26), endDate: new Date(2026, 10, 1), status: "Schválené" },
  { id: 25, employeeNumber: 12, startDate: new Date(2026, 8, 1), endDate: new Date(2026, 8, 14), status: "Schválené" },
  { id: 26, employeeNumber: 12, startDate: new Date(2026, 11, 28), endDate: new Date(2027, 0, 3), status: "Schválené" },

  // Tím C (13-18) - vedúci zmeny: 13
  { id: 29, employeeNumber: 13, startDate: new Date(2026, 4, 11), endDate: new Date(2026, 4, 24), status: "Schválené" },
  { id: 30, employeeNumber: 13, startDate: new Date(2026, 10, 16), endDate: new Date(2026, 10, 22), status: "Schválené" },
  { id: 31, employeeNumber: 14, startDate: new Date(2026, 5, 29), endDate: new Date(2026, 6, 12), status: "Schválené" },
  { id: 32, employeeNumber: 14, startDate: new Date(2026, 11, 14), endDate: new Date(2026, 11, 20), status: "Schválené" },
  { id: 33, employeeNumber: 15, startDate: new Date(2026, 7, 17), endDate: new Date(2026, 7, 30), status: "Schválené" },
  { id: 34, employeeNumber: 15, startDate: new Date(2026, 10, 9), endDate: new Date(2026, 10, 15), status: "Schválené" },
  { id: 35, employeeNumber: 16, startDate: new Date(2026, 6, 13), endDate: new Date(2026, 6, 26), status: "Schválené" },
  { id: 36, employeeNumber: 16, startDate: new Date(2026, 9, 19), endDate: new Date(2026, 9, 25), status: "Schválené" },
  { id: 37, employeeNumber: 17, startDate: new Date(2026, 4, 25), endDate: new Date(2026, 5, 7), status: "Schválené" },
  { id: 38, employeeNumber: 17, startDate: new Date(2026, 10, 23), endDate: new Date(2026, 10, 29), status: "Schválené" },
  { id: 39, employeeNumber: 18, startDate: new Date(2026, 8, 14), endDate: new Date(2026, 8, 27), status: "Schválené" },
  { id: 40, employeeNumber: 18, startDate: new Date(2026, 11, 21), endDate: new Date(2026, 11, 27), status: "Schválené" },

  // Tím D (19-24) - vedúci stanovišťa: 19
  { id: 43, employeeNumber: 19, startDate: new Date(2026, 3, 13), endDate: new Date(2026, 3, 26), status: "Schválené" },
  { id: 44, employeeNumber: 19, startDate: new Date(2026, 8, 21), endDate: new Date(2026, 8, 27), status: "Schválené" },
  { id: 45, employeeNumber: 20, startDate: new Date(2026, 4, 4), endDate: new Date(2026, 4, 17), status: "Schválené" },
  { id: 46, employeeNumber: 20, startDate: new Date(2026, 10, 2), endDate: new Date(2026, 10, 8), status: "Schválené" },
  { id: 47, employeeNumber: 21, startDate: new Date(2026, 6, 27), endDate: new Date(2026, 7, 9), status: "Schválené" },
  { id: 48, employeeNumber: 21, startDate: new Date(2026, 11, 7), endDate: new Date(2026, 11, 13), status: "Schválené" },
  { id: 49, employeeNumber: 22, startDate: new Date(2026, 5, 22), endDate: new Date(2026, 6, 5), status: "Schválené" },
  { id: 50, employeeNumber: 22, startDate: new Date(2026, 10, 16), endDate: new Date(2026, 10, 22), status: "Schválené" },
  { id: 51, employeeNumber: 23, startDate: new Date(2026, 3, 27), endDate: new Date(2026, 4, 10), status: "Schválené" },
  { id: 52, employeeNumber: 23, startDate: new Date(2026, 9, 12), endDate: new Date(2026, 9, 18), status: "Schválené" },
  { id: 53, employeeNumber: 24, startDate: new Date(2026, 8, 7), endDate: new Date(2026, 8, 20), status: "Schválené" },
  { id: 54, employeeNumber: 24, startDate: new Date(2026, 11, 28), endDate: new Date(2027, 0, 3), status: "Schválené" },

  // Tím E (25-30) - vedúci zmeny: 25
  { id: 57, employeeNumber: 25, startDate: new Date(2026, 3, 20), endDate: new Date(2026, 4, 3), status: "Schválené" },
  { id: 58, employeeNumber: 25, startDate: new Date(2026, 9, 5), endDate: new Date(2026, 9, 11), status: "Schválené" },
  { id: 59, employeeNumber: 26, startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 14), status: "Schválené" },
  { id: 60, employeeNumber: 26, startDate: new Date(2026, 10, 23), endDate: new Date(2026, 10, 29), status: "Schválené" },
  { id: 61, employeeNumber: 27, startDate: new Date(2026, 7, 10), endDate: new Date(2026, 7, 23), status: "Schválené" },
  { id: 62, employeeNumber: 27, startDate: new Date(2026, 11, 14), endDate: new Date(2026, 11, 20), status: "Schválené" },
  { id: 63, employeeNumber: 28, startDate: new Date(2026, 6, 6), endDate: new Date(2026, 6, 19), status: "Schválené" },
  { id: 64, employeeNumber: 28, startDate: new Date(2026, 9, 26), endDate: new Date(2026, 10, 1), status: "Schválené" },
  { id: 65, employeeNumber: 29, startDate: new Date(2026, 4, 11), endDate: new Date(2026, 4, 24), status: "Schválené" },
  { id: 66, employeeNumber: 29, startDate: new Date(2026, 11, 21), endDate: new Date(2026, 11, 27), status: "Schválené" },
  { id: 67, employeeNumber: 30, startDate: new Date(2026, 8, 14), endDate: new Date(2026, 8, 27), status: "Schválené" },
  { id: 68, employeeNumber: 30, startDate: new Date(2026, 10, 2), endDate: new Date(2026, 10, 8), status: "Schválené" },

  // Tím F (31-36) - vedúci stanovišťa: 31
  { id: 71, employeeNumber: 31, startDate: new Date(2026, 3, 6), endDate: new Date(2026, 3, 19), status: "Schválené" },
  { id: 72, employeeNumber: 31, startDate: new Date(2026, 10, 9), endDate: new Date(2026, 10, 15), status: "Schválené" },
  { id: 73, employeeNumber: 32, startDate: new Date(2026, 5, 15), endDate: new Date(2026, 5, 28), status: "Schválené" },
  { id: 74, employeeNumber: 32, startDate: new Date(2026, 11, 7), endDate: new Date(2026, 11, 13), status: "Schválené" },
  { id: 75, employeeNumber: 33, startDate: new Date(2026, 7, 24), endDate: new Date(2026, 8, 6), status: "Schválené" },
  { id: 76, employeeNumber: 33, startDate: new Date(2026, 10, 16), endDate: new Date(2026, 10, 22), status: "Schválené" },
  { id: 77, employeeNumber: 34, startDate: new Date(2026, 6, 13), endDate: new Date(2026, 6, 26), status: "Schválené" },
  { id: 78, employeeNumber: 34, startDate: new Date(2026, 9, 12), endDate: new Date(2026, 9, 18), status: "Schválené" },
  { id: 79, employeeNumber: 35, startDate: new Date(2026, 4, 25), endDate: new Date(2026, 5, 7), status: "Schválené" },
  { id: 80, employeeNumber: 35, startDate: new Date(2026, 11, 21), endDate: new Date(2026, 11, 27), status: "Schválené" },
  { id: 81, employeeNumber: 36, startDate: new Date(2026, 8, 21), endDate: new Date(2026, 8, 27), status: "Schválené" },
  { id: 82, employeeNumber: 36, startDate: new Date(2026, 11, 28), endDate: new Date(2027, 0, 3), status: "Schválené" },
];
