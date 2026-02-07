"use client"

import { UserRole } from "@/types/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface RoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg space-y-2">
      <Label className="text-xs font-semibold text-gray-500">DEV: Simular Role</Label>
      <Select value={value} onValueChange={(val) => onChange(val as UserRole)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">👤 Admin</SelectItem>
          <SelectItem value="SECRETARY">👥 Secretaria</SelectItem>
          <SelectItem value="TEACHER">🎓 Professor</SelectItem>
          <SelectItem value="PARENT">👨‍👩‍👧 Responsável</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
