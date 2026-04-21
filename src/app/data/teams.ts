export interface Team {
  id: number;
  name: string;
  description: string;
  color: string;
  employeeNumbers: number[];
}

export const teams: Team[] = [
  {
    id: 1,
    name: "Tím A",
    description: "",
    color: "#c8e6c9", // green
    employeeNumbers: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 2,
    name: "Tím B",
    description: "",
    color: "#b3d9ff", // blue
    employeeNumbers: [7, 8, 9, 10, 11, 12]
  },
  {
    id: 3,
    name: "Tím C",
    description: "",
    color: "#ffcc99", // orange
    employeeNumbers: [13, 14, 15, 16, 17, 18]
  },
  {
    id: 4,
    name: "Tím D",
    description: "",
    color: "#ffb3ba", // pink
    employeeNumbers: [19, 20, 21, 22, 23, 24]
  },
  {
    id: 5,
    name: "Tím E",
    description: "",
    color: "#e8dcc4", // beige
    employeeNumbers: [25, 26, 27, 28, 29, 30]
  },
  {
    id: 6,
    name: "Tím F",
    description: "",
    color: "#d1c4e9", // purple
    employeeNumbers: [31, 32, 33, 34, 35, 36]
  }
];
