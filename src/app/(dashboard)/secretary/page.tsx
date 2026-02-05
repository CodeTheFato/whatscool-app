import { StatsCards } from "@/components/secretary/StatsCards"
import { FinancialSummary } from "@/components/secretary/FinancialSummary"
import { PendingAuthorizations } from "@/components/secretary/PendingAuthorizations"
import { ModuleCards } from "@/components/secretary/ModuleCards"

export default function SecretaryDashboard() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Secretary Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>
      <StatsCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialSummary />
        <PendingAuthorizations />
      </div>
      <ModuleCards />
    </main>
  )
}
