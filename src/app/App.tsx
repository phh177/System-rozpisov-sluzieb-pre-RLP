import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { VacationProvider } from "./context/VacationContext";
import { ScheduleProvider } from "./context/ScheduleContext";

// Main application component
export default function App() {
  return (
    <AuthProvider>
      <VacationProvider>
        <ScheduleProvider>
          <AppRoutes />
        </ScheduleProvider>
      </VacationProvider>
    </AuthProvider>
  );
}
