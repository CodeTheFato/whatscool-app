import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FinancialSummary() {
  const financialItems = [
    {
      icon: CheckCircle2,
      label: "Pago",
      value: "R$ 142.500",
      subtitle: "285 alunos",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Clock,
      label: "Pendente",
      value: "R$ 21.000",
      subtitle: "42 alunos",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon: AlertCircle,
      label: "Atrasado",
      value: "R$ 7.500",
      subtitle: "15 alunos",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Resumo Financeiro</CardTitle>
        <button className="text-sm text-primary hover:underline">Ver todos</button>
      </CardHeader>
      <CardContent className="space-y-4">
        {financialItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.iconBg}`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
