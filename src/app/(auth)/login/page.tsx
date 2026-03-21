"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, LogIn, CheckCircle2, ShieldCheck, Zap } from "lucide-react"
import { toast } from "sonner"
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel"

const BRANDING_FEATURES = [
  { icon: Zap, title: "Acesso Instantâneo", description: "Entre em segundos" },
  { icon: ShieldCheck, title: "100% Seguro", description: "Dados criptografados" },
  { icon: CheckCircle2, title: "Suporte 24/7", description: "Sempre disponível" },
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Email ou senha incorretos")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/session")
      const session = await response.json()

      if (session?.user?.role) {
        const roleRoutes: Record<string, string> = {
          ADMIN: "/admin",
          SECRETARY: "/secretary",
          TEACHER: "/teacher",
          PARENT: "/parents",
          STUDENT: "/student",
        }

        const redirectPath = roleRoutes[session.user.role] || "/secretary"
        toast.success("Login realizado com sucesso!")
        router.push(redirectPath)
        router.refresh()
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white">
      <AuthBrandingPanel
        title="Gestão Escolar Moderna"
        subtitle="Conecte toda a comunidade escolar em uma única plataforma. Simples, segura e eficiente."
        features={BRANDING_FEATURES}
      />

      <div className="p-8 md:p-12 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
            {isLoading ? "Entrando..." : (
              <>
                Entrar
                <LogIn className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
            OU
          </span>
        </div>

        <div className="space-y-3">
          <Link href="/activate" className="block">
            <Button variant="outline" className="w-full h-11">
              Ativar Convite
            </Button>
          </Link>

          <p className="text-center text-sm text-muted-foreground">
            Recebeu um convite?{" "}
            <Link href="/activate" className="text-primary font-medium hover:underline">
              Clique aqui para ativar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
