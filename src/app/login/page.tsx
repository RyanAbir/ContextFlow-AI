"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [loading, router, user])

  const handleLogin = async () => {
    setIsSubmitting(true)

    try {
      await signInWithGoogle()
      router.replace("/dashboard")
    } catch (error) {
      console.error("Google sign-in failed", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-card/95 p-10 shadow-2xl shadow-black/10">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">ContextFlow AI</p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Sign in and continue building contextual AI workflows.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
            Securely log in with Google to access your dashboard and get started with ContextFlow AI.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleLogin}
            disabled={isSubmitting || loading}
            className="w-full max-w-sm"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Continue with Google"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Use your Google account to access the secure ContextFlow AI workspace.
          </p>
        </div>
      </div>
    </div>
  )
}
