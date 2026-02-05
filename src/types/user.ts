export interface User {
  id: string
  name: string
  email: string
  role: 'secretary' | 'teacher' | 'parents' | 'student'
}
