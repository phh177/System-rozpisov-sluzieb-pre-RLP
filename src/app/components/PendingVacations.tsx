import { allEmployees } from "../data/employees";

interface PendingVacationsProps {
  pendingVacations: Array<{
    id: number;
    employeeNumber: number;
    startDate: Date;
    endDate: Date;
    status: "Schválené" | "Čaká na schválenie";
  }>;
  calculateWorkingDays: (start: Date, end: Date) => number;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  approvalError: string | null;
  vacationToApprove: number | null;
}

export default function PendingVacations({
  pendingVacations,
  calculateWorkingDays,
  onApprove,
  onReject,
  approvalError,
  vacationToApprove,
}: PendingVacationsProps) {
  if (pendingVacations.length === 0) return null;

  return (
    <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: '#fff9e6', border: '2px solid #ffd966' }}>
      <h2 className="text-xl text-gray-900 mb-6">Žiadosti čakajúce na schválenie ({pendingVacations.length})</h2>
      
      <div className="space-y-4">
        {pendingVacations.map((vacation) => {
          const employee = allEmployees.find(emp => emp.number === vacation.employeeNumber);
          const workingDays = calculateWorkingDays(vacation.startDate, vacation.endDate);
          const isCurrentError = vacationToApprove === vacation.id;

          return (
            <div 
              key={vacation.id} 
              className="p-4 rounded-2xl" 
              style={{ 
                backgroundColor: 'white', 
                border: isCurrentError ? '2px solid #ff9999' : '2px solid #e8dcc4' 
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">
                    <strong>{employee?.fullName}</strong> (#{employee?.number})
                  </p>
                  <p className="text-xs text-gray-700">
                    {vacation.startDate.getDate()}.{vacation.startDate.getMonth() + 1}.{vacation.startDate.getFullYear()} - {vacation.endDate.getDate()}.{vacation.endDate.getMonth() + 1}.{vacation.endDate.getFullYear()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {workingDays} pracovných dní
                  </p>
                  
                  {isCurrentError && approvalError && (
                    <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: '#ffcccb', border: '1px solid #ff9999' }}>
                      ⚠️ {approvalError}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(vacation.id)}
                    className="px-3 py-1.5 rounded-full text-xs text-black transition-all hover:brightness-95 active:brightness-90 cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: '#c8e6c9' }}
                  >
                    ✓ Schváliť
                  </button>
                  <button
                    onClick={() => onReject(vacation.id)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all hover:brightness-95 active:brightness-90 cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: '#ffcccb' }}
                  >
                    ✗ Zamietnuť
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
