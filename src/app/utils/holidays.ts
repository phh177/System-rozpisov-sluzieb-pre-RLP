// Slovak public holidays
export interface Holiday {
  date: Date;
  name: string;
}

export function getSlovakHolidays(year: number): Holiday[] {
  // Calculate Easter (Veľká noc) - using Computus algorithm
  const calculateEaster = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  };

  const easter = calculateEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 3);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  return [
    { date: new Date(year, 0, 1), name: "Deň vzniku SR" },
    { date: new Date(year, 0, 6), name: "Zjavenie Pána" },
    { date: goodFriday, name: "Veľký piatok" },
    { date: easterMonday, name: "Veľkonočný pondelok" },
    { date: new Date(year, 4, 1), name: "Sviatok práce" },
    { date: new Date(year, 4, 8), name: "Deň víťazstva nad fašizmom" },
    { date: new Date(year, 6, 5), name: "Sviatok sv. Cyrila a Metoda" },
    { date: new Date(year, 7, 29), name: "Výročie SNP" },
    { date: new Date(year, 8, 1), name: "Deň ústavy SR" },
    { date: new Date(year, 8, 15), name: "Sedembolestná Panna Mária" },
    { date: new Date(year, 10, 1), name: "Sviatok všetkých svätých" },
    { date: new Date(year, 10, 17), name: "Deň boja za slobodu a demokraciu" },
    { date: new Date(year, 11, 24), name: "Štedrý deň" },
    { date: new Date(year, 11, 25), name: "1. sviatok vianočný" },
    { date: new Date(year, 11, 26), name: "2. sviatok vianočný" },
  ];
}

export function isHoliday(date: Date, year: number): Holiday | null {
  const holidays = getSlovakHolidays(year);
  const holiday = holidays.find((h) =>
    h.date.getDate() === date.getDate() &&
    h.date.getMonth() === date.getMonth() &&
    h.date.getFullYear() === date.getFullYear()
  );
  return holiday || null;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function isWorkingDay(date: Date, year: number): boolean {
  return !isWeekend(date) && !isHoliday(date, year);
}
