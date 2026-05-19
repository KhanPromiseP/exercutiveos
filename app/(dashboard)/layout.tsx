import { auth } from "@/lib/auth"
import { AppShell } from "@/components/app-shell"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { AIController } from "@/components/ai-controller"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <AppShell user={session?.user}>
      {children}
      <PWAInstallPrompt />
      <AIController />
    </AppShell>
  )
}
