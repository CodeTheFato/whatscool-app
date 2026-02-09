"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { School, Mail, Lock, User, Key, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function ActivatePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Step 1 - Validar convite
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")

  // Step 2 - Dados do usuário
  const [inviteData, setInviteData] = useState<any>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Preencha o e-mail para reenviar o código")
      return
    }

    setIsResending(true)

    try {
      const response = await fetch("/api/users/resend-activation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao reenviar código")
      }

      toast.success("Código reenviado com sucesso! Verifique seu e-mail.")
    } catch (error) {
      console.error("Error resending code:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao reenviar código")
    } finally {
      setIsResending(false)
    }
  }

  const handleValidateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/users/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Token inválido")
      }

      const data = await response.json()

      if (data.valid) {
        setInviteData(data.user)
        toast.success("Convite validado com sucesso!")
        setStep(2)
      } else {
        toast.error("Token inválido ou expirado")
      }
    } catch (error) {
      console.error("Error validating invite:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao validar convite")
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/users/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao ativar conta")
      }

      const data = await response.json()
      toast.success("Conta ativada com sucesso!")

      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        // Redirecionar baseado no role
        if (inviteData?.role === "PARENT") {
          router.push("/login?email=" + encodeURIComponent(email))
        } else if (inviteData?.role === "ADMIN") {
          router.push("/login?email=" + encodeURIComponent(email))
        } else if (inviteData?.role === "SECRETARY") {
          router.push("/login?email=" + encodeURIComponent(email))
        } else if (inviteData?.role === "TEACHER") {
          router.push("/login?email=" + encodeURIComponent(email))
        } else {
          router.push("/login?email=" + encodeURIComponent(email))
        }
      }, 1000)
    } catch (error) {
      console.error("Error activating account:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao ativar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white">
      {/* Left Side - Illustration/Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div>
          <div className="inline-flex items-center gap-2 mb-8">
            <School className="w-8 h-8" />
            <span className="text-2xl font-bold">Whatscool</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            {step === 1 ? "Bem-vindo!" : "Quase lá!"}
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            {step === 1
              ? "Valide seu convite e comece a fazer parte da nossa comunidade educacional."
              : "Configure sua conta e tenha acesso completo à plataforma."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Seguro e Confiável</p>
              <p className="text-sm text-blue-100">Seus dados protegidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Acesso Rápido</p>
              <p className="text-sm text-blue-100">Configure em minutos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="p-8 md:p-12">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step === 1 ? "bg-primary text-white" : "bg-green-500 text-white"
            }`}>
            {step === 1 ? "1" : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div className={`h-1 w-12 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-gray-200"
            }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step === 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            }`}>
            2
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {step === 1 ? "Ativar Conta" : "Criar Sua Senha"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1
              ? "Valide o código enviado para você"
              : "Defina uma senha segura para acessar sua conta"}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleValidateInvite} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm font-medium">Código do Convite</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="token"
                  placeholder="ABCD-1234-EFGH"
                  className="pl-10 h-11"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Código enviado por e-mail ou WhatsApp
              </p>
              <p className="text-xs text-blue-600 font-medium">
                Para testes, utilize o código: <strong>123456</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? "Validando..." : (
                <>
                  Validar Convite
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || !email}
                className="text-sm text-foreground/90 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline-offset-4 hover:underline font-medium"
              >
                {isResending ? "Reenviando..." : "Não recebeu o código? Reenviar por e-mail"}
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Voltar para Login
            </Button>
          </form>
        ) : (
          <form onSubmit={handleActivateAccount} className="space-y-5">
            {inviteData && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{inviteData.schoolName}</span>
                    </div>
                    <Badge variant="secondary">{inviteData.role}</Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{inviteData.name}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Criar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  className="pl-10 h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? "Ativando..." : (
                <>
                  Ativar Conta
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
