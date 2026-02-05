import { FileText, Ticket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PendingAuthorizations() {
  const authorizations = [
    {
      icon: FileText,
      title: "Early Dismissal",
      subtitle: "John Silva - 5th Grade A",
      status: "Pending",
      statusColor: "text-yellow-600 bg-yellow-50",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Ticket,
      title: "Field Trip - Museum",
      subtitle: "18/25 authorizations",
      status: "In Progress",
      statusColor: "text-blue-600 bg-blue-50",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: FileText,
      title: "Early Dismissal",
      subtitle: "Mary Santos - 3rd Grade B",
      status: "Pending",
      statusColor: "text-yellow-600 bg-yellow-50",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Pending Authorizations</CardTitle>
        <button className="text-sm text-primary hover:underline">View all</button>
      </CardHeader>
      <CardContent className="space-y-3">
        {authorizations.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.iconBg}`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${item.statusColor}`}>{item.status}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
