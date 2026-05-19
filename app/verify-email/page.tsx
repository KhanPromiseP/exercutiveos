"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found.")
      return
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || "Your email has been verified!")
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("An unexpected error occurred.")
      })
  }, [token])

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        <CardDescription>
          {status === "loading" &&
            "We're verifying your email address..."}

          {status === "success" &&
            "Your account is now verified."}

          {status === "error" &&
            "Verification could not be completed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying your email address...</p>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-center">{message}</p>
            <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
              Continue to Login
            </Button>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-lg font-medium text-center text-destructive">{message}</p>
            <Button variant="outline" className="mt-6 w-full" onClick={() => router.push("/login")}>
              Return to Login
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
