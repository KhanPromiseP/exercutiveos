import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Shield,
  LayoutDashboard,
  FolderKanban,
  Target,
  Lightbulb,
  Zap,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Executive Dashboard",
    description: "Get a bird's eye view of your entire life with intelligent alerts and analytics.",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Organize and track personal projects with milestones, deadlines, and progress tracking.",
  },
  {
    icon: Target,
    title: "Habit Tracking",
    description: "Build powerful habits with streak tracking, consistency analytics, and daily check-ins.",
  },
  {
    icon: Lightbulb,
    title: "Decision Logging",
    description: "Record strategic decisions, reasoning, and outcomes to train your executive thinking.",
  },
  {
    icon: Zap,
    title: "Quick Capture",
    description: "Instantly capture ideas, tasks, and reminders with minimal friction.",
  },
]

const benefits = [
  "Life domains for holistic management",
  "Daily, weekly, and monthly reviews",
  "Smart reminders and notifications",
  "Offline-ready PWA experience",
  "Secure and private by design",
  "Mobile-first, responsive design",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Executive OS</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
              Your Personal
              <span className="text-primary"> Life Command Center</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              The executive operating system for ambitious individuals. Manage projects, track habits, log decisions, and take control of your life with strategic clarity.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  Sign in to Dashboard
                </Link>
              </Button>
            </div>

          </div>
        </div>
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Everything you need to
              <span className="text-primary"> execute with precision</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete system for managing your life, projects, and personal growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Built for ambitious
                <span className="text-primary"> visionaries</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Executive OS is designed for individuals who want to take control of their life with the same rigor and clarity that top executives bring to their organizations.
              </p>
              <div className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[var(--success)] flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border p-8 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="h-24 w-24 text-primary mx-auto mb-6" />
                  <p className="text-2xl font-bold text-foreground">Executive OS</p>
                  <p className="text-muted-foreground mt-2">Your Life, Systematized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Ready to take control?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of ambitious individuals using Executive OS to manage their lives with strategic clarity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create Free Account
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Executive OS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your Personal Executive Operating System
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
