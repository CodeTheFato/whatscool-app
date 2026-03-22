"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { School, Mail, Lock, User, Key, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel"

const STEP_BRANDING = {
  1: {
    title: "Bem-vindo!",
    subtitle: "Valide seu convite e comece a fazer parte da nossa comunidade educacional.",
  },
  2: {
    title: "Quase lá!",
    subtitle: "Configure sua conta e tenha acesso completo à plataforma.",
  },
}

const BRANDING_FEATURES = [
  { icon: ShieldCheck, title: "Seguro e Confiável", description: "Seus dados protegidos" },
  { icon: CheckCircle2, title: "Acesso Rápido", description: "Configure em minutos" },
]

export default function ActivatePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")

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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao ativar conta")
      }

      toast.success("Conta ativada com sucesso!")
      setTimeout(() => {
        router.push("/login?email=" + encodeURIComponent(email))
      }, 1000)
    } catch (error) {
      console.error("Error activating account:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao ativar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const branding = STEP_BRANDING[step]

  return (
    <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white">
      <AuthBrandingPanel
        title={branding.title}
        subtitle={branding.subtitle}
        features={BRANDING_FEATURES}
      />

      <div className="p-8 md:p-12">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step === 1 ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
            {step === 1 ? "1" : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div className={`h-1 w-12 rounded-full transition-colors ${step === 2 ? "bg-primary" : "bg-gray-200"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${step === 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
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
