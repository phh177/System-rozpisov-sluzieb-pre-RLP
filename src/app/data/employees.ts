export interface Employee {
  number: number;
  name: string;
  surname: string;
  fullName: string;
  age: number;
  position: string;
  isShiftLeader: boolean;
  station?: string;
  vacationDaysTotal: number;
  vacationDaysUsed: number;
  vacationDaysCarriedOver: number;
}

export const allEmployees: Employee[] = Array.from({ length: 36 }, (_, i) => {
  const number = i + 1;
  const name = i === 0 ? "Admin" : i === 1 ? "User" : `Meno${i + 1}`;
  const surname = i === 0 ? "Adminová" : i === 1 ? "Userovský" : `Priezvisko${i + 1}`;
  const age = i === 0 ? 23 : i === 1 ? 28 : 25 + (i % 20);

  // First 3 from each team are shift leaders (1-3, 7-9, 13-15, 19-21, 25-27, 31-33)
  const shiftLeaderNumbers = [1, 2, 3, 7, 8, 9, 13, 14, 15, 19, 20, 21, 25, 26, 27, 31, 32, 33];
  const isShiftLeader = shiftLeaderNumbers.includes(number);

  let position = "Riadiaci letovej prevádzky";
  if (i === 0) {
    position = "Vedúca stanovíšť APP/TWR Štefánik; Vedúci zmeny; Riadiaca letovej prevádzky";
  } else if (isShiftLeader) {
    position = "Vedúci zmeny; Riadiaci letovej prevádzky";
  }

  const station = i === 0 ? "APP/TWR Štefánik" : i === 1 ? "APP/TWR Štefánik" : undefined;

  // Calculate vacation days based on age
  const vacationDaysTotal = age >= 33 ? 30 : 25;
  const vacationDaysUsed = i === 0 ? 14 : i === 1 ? 14 : 0; // Mock used days
  const vacationDaysCarriedOver = i === 0 ? 5 : i === 1 ? 3 : 0; // Mock carried over days

  return {
    number,
    name,
    surname,
    fullName: `${name} ${surname}`,
    age,
    position,
    isShiftLeader,
    station,
    vacationDaysTotal,
    vacationDaysUsed,
    vacationDaysCarriedOver,
  };
});
