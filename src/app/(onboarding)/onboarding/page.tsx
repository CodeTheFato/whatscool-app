"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronLeft, ChevronRight, Building2, Users, UserPlus, Phone, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { RoleSelector } from "@/components/auth/RoleSelector"
import { UserRole } from "@/types/auth"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = currentRole === "ADMIN" ? 3 : 2

  // Step 1 - Criar Escola (apenas ADMIN)
  const [schoolName, setSchoolName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // Step 2 - Usuários Internos
  const [secretaryName, setSecretaryName] = useState("")
  const [secretaryEmail, setSecretaryEmail] = useState("")
  const [teachers, setTeachers] = useState<Array<{ name: string; email: string; status: string }>>([])
  const [newTeacherName, setNewTeacherName] = useState("")
  const [newTeacherEmail, setNewTeacherEmail] = useState("")

  // Step 3 - Alunos e Responsáveis
  const [students, setStudents] = useState<Array<{ id: string; name: string; class: string }>>([])
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentClass, setNewStudentClass] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [parents, setParents] = useState<Record<string, Array<{ name: string; email: string; whatsapp: string; status: string }>>>({})

  const addTeacher = () => {
    if (newTeacherName && newTeacherEmail) {
      setTeachers([...teachers, { name: newTeacherName, email: newTeacherEmail, status: "Convite enviado" }])
      setNewTeacherName("")
      setNewTeacherEmail("")
      toast.success("Professor adicionado!")
    }
  }

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index))
  }

  const addStudent = () => {
    if (newStudentName && newStudentClass) {
      const id = `student-${Date.now()}`
      setStudents([...students, { id, name: newStudentName, class: newStudentClass }])
      setParents({ ...parents, [id]: [] })
      setNewStudentName("")
      setNewStudentClass("")
      toast.success("Aluno adicionado!")
    }
  }

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id))
    const newParents = { ...parents }
    delete newParents[id]
    setParents(newParents)
  }

  const addParent = (studentId: string, parent: { name: string; email: string; whatsapp: string }) => {
    const currentParents = parents[studentId] || []
    if (currentParents.length >= 2) {
      toast.error("Um aluno pode ter no máximo 2 responsáveis")
      return
    }
    setParents({
      ...parents,
      [studentId]: [...currentParents, { ...parent, status: "Convite enviado" }]
    })
    toast.success("Responsável adicionado!")
  }

  const sendSecretaryInvite = () => {
    if (secretaryName && secretaryEmail) {
      toast.success("Convite enviado para a Secretaria!")
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && currentRole === "ADMIN") {
      if (!schoolName || !city || !state || !whatsapp) {
        toast.error("Preencha todos os campos obrigatórios")
        return
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    toast.success("Configuração inicial concluída!")
    // Redirecionar baseado no role
    if (currentRole === "ADMIN") {
      router.push("/admin")
    } else if (currentRole === "SECRETARY") {
      router.push("/secretary")
    } else {
      router.push("/secretary")
    }
  }

  const getStepInfo = () => {
    if (currentRole === "ADMIN") {
      return [
        { number: 1, label: "Escola", icon: Building2 },
        { number: 2, label: "Usuários", icon: Users },
        { number: 3, label: "Alunos", icon: UserPlus }
      ]
    } else {
      return [
        { number: 1, label: "Usuários", icon: Users },
        { number: 2, label: "Alunos", icon: UserPlus }
      ]
    }
  }

  const steps = getStepInfo()
  const adjustedStep = currentRole === "ADMIN" ? currentStep : currentStep + 1

  return (
    <>
      <RoleSelector value={currentRole} onChange={setCurrentRole} />

      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = step.number === adjustedStep
              const isCompleted = step.number < adjustedStep

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                        ? "bg-primary border-primary text-white"
                        : isActive
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-400"
                        }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 ${isCompleted ? "bg-primary" : "bg-gray-300"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Card className="shadow-lg">
          {/* Step 1 - Criar Escola (apenas ADMIN) */}
          {currentRole === "ADMIN" && currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Criar Escola</CardTitle>
                <CardDescription>
                  Preencha as informações básicas da sua instituição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nome da Escola *</Label>
                  <Input
                    id="schoolName"
                    placeholder="Escola Municipal..."
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">UF *</Label>
                    <Input
                      id="state"
                      placeholder="SP"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp da Escola *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      placeholder="+55 11 98765-4321"
                      className="pl-10"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2 - Criar Usuários Internos */}
          {((currentRole === "ADMIN" && currentStep === 2) || (currentRole !== "ADMIN" && currentStep === 1)) && (
            <>
              <CardHeader>
                <CardTitle>Criar Usuários Internos</CardTitle>
                <CardDescription>
                  Cadastre membros da secretaria e professores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Secretaria */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Secretaria
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        placeholder="Maria Silva"
                        value={secretaryName}
                        onChange={(e) => setSecretaryName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        placeholder="maria@escola.com"
                        value={secretaryEmail}
                        onChange={(e) => setSecretaryEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={sendSecretaryInvite} variant="outline" className="w-full">
                    Enviar Convite
                  </Button>
                </div>

                {/* Professores */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Professores
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        placeholder="João Santos"
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        placeholder="joao@escola.com"
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={addTeacher} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Professor
                  </Button>

                  {teachers.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <Label className="text-sm text-muted-foreground">Professores Adicionados</Label>
                      {teachers.map((teacher, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{teacher.status}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTeacher(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3 - Cadastrar Alunos e Responsáveis */}
          {((currentRole === "ADMIN" && currentStep === 3) || (currentRole !== "ADMIN" && currentStep === 2)) && (
            <>
              <CardHeader>
                <CardTitle>Cadastrar Alunos e Responsáveis</CardTitle>
                <CardDescription>
                  Adicione os alunos e vincule seus responsáveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Adicionar Aluno */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Adicionar Aluno</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Aluno</Label>
                      <Input
                        placeholder="Pedro Souza"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Turma</Label>
                      <Select value={newStudentClass} onValueChange={setNewStudentClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G3">G3</SelectItem>
                          <SelectItem value="1ºA">1º Ano A</SelectItem>
                          <SelectItem value="2ºB">2º Ano B</SelectItem>
                          <SelectItem value="3ºA">3º Ano A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addStudent} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Aluno
                  </Button>
                </div>

                {/* Lista de Alunos */}
                {students.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Alunos Cadastrados</Label>
                    {students.map((student) => (
                      <div key={student.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">Turma: {student.class}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {parents[student.id]?.length || 0}/2 responsáveis
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeStudent(student.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Responsáveis */}
                        <div className="pl-4 border-l-2 space-y-2">
                          <Label className="text-xs">Responsáveis</Label>
                          {parents[student.id]?.map((parent, idx) => (
                            <div key={idx} className="text-sm bg-muted p-2 rounded">
                              <p className="font-medium">{parent.name}</p>
                              <p className="text-muted-foreground">{parent.email}</p>
                              <p className="text-muted-foreground">{parent.whatsapp}</p>
                              <Badge variant="secondary" className="mt-1">{parent.status}</Badge>
                            </div>
                          ))}
                          {(!parents[student.id] || parents[student.id].length < 2) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Mock - adicionar responsável
                                const parentName = prompt("Nome do responsável:")
                                const parentEmail = prompt("E-mail:")
                                const parentWhatsapp = prompt("WhatsApp:")
                                if (parentName && parentEmail && parentWhatsapp) {
                                  addParent(student.id, { name: parentName, email: parentEmail, whatsapp: parentWhatsapp })
                                }
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar Responsável
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish}>
                Concluir Configuração
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
