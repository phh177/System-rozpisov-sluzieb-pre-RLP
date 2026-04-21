import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MyProfile from "./components/MyProfile";
import EmployeeList from "./components/EmployeeList";
import Teams from "./components/Teams";
import VacationPlan from "./components/VacationPlan";
import TrainingPlan from "./components/TrainingPlan";
import WorkTimeAccount from "./components/WorkTimeAccount";
import CreateSchedule from "./components/CreateSchedule";
import ViewApprovedSchedule from "./components/ViewApprovedSchedule";

// Router component
export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/vacation" element={<VacationPlan />} />
        <Route path="/training" element={<TrainingPlan />} />
        <Route path="/worktime" element={<WorkTimeAccount />} />
        <Route path="/create-schedule" element={<CreateSchedule />} />
        <Route path="/view-schedule" element={<ViewApprovedSchedule />} />
      </Routes>
    </BrowserRouter>
  );
}
