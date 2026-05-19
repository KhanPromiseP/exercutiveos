"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Smartphone,
  LogOut,
  Trash2,
  Download,
  Loader2,
} from "lucide-react"
import { signOut } from "next-auth/react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { setTheme, theme } = useTheme()
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
  })
  const [preferences, setPreferences] = useState({
    theme: "system",
    compactMode: false,
    animations: true,
    twoFactor: false,
    sessionTimeout: true,
    pushNotifications: true,
    emailDigests: false,
    taskReminders: true,
    habitReminders: true,
    offlineMode: true,
    backgroundSync: true,
  })

  useEffect(() => {
    fetch("/api/user/settings")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserProfile({ name: data.user.name, email: data.user.email })
          if (data.user.preferences) {
            setPreferences(prev => ({ ...prev, ...data.user.preferences }))
            if (data.user.preferences.theme) {
              setTheme(data.user.preferences.theme)
            }
          }
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error("Failed to load settings")
        setIsLoading(false)
      })
  }, [setTheme])

  const handleProfileSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userProfile.name })
      })
      
      if (!res.ok) throw new Error("Failed to save profile")
      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    
    if (key === "theme" && typeof value === "string") {
      setTheme(value)
    }

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { [key]: value } })
      })
      
      if (!res.ok) throw new Error("Failed to save preference")
    } catch (err) {
      toast.error("Failed to update setting")
      // Revert on failure
      setPreferences(preferences)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userProfile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                </div>
              </div>
              <Button onClick={handleProfileSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button variant="outline" onClick={() => toast.info("Password updates coming soon")}>Update Password</Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch 
                  checked={preferences.twoFactor}
                  onCheckedChange={(v) => handlePreferenceChange("twoFactor", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-lock after inactivity
                  </p>
                </div>
                <Switch 
                  checked={preferences.sessionTimeout}
                  onCheckedChange={(v) => handlePreferenceChange("sessionTimeout", v)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose light, dark, or system theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing for more content
                  </p>
                </div>
                <Switch 
                  checked={preferences.compactMode}
                  onCheckedChange={(v) => handlePreferenceChange("compactMode", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions
                  </p>
                </div>
                <Switch 
                  checked={preferences.animations}
                  onCheckedChange={(v) => handlePreferenceChange("animations", v)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts on your device
                  </p>
                </div>
                <Switch 
                  checked={preferences.pushNotifications}
                  onCheckedChange={(v) => handlePreferenceChange("pushNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Digests</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily summary via email
                  </p>
                </div>
                <Switch 
                  checked={preferences.emailDigests}
                  onCheckedChange={(v) => handlePreferenceChange("emailDigests", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts for upcoming deadlines
                  </p>
                </div>
                <Switch 
                  checked={preferences.taskReminders}
                  onCheckedChange={(v) => handlePreferenceChange("taskReminders", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habit Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily habit check-in reminders
                  </p>
                </div>
                <Switch 
                  checked={preferences.habitReminders}
                  onCheckedChange={(v) => handlePreferenceChange("habitReminders", v)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PWA Section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile App
              </CardTitle>
              <CardDescription>
                Install and manage the PWA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Offline Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Access content without internet
                  </p>
                </div>
                <Switch 
                  checked={preferences.offlineMode}
                  onCheckedChange={(v) => handlePreferenceChange("offlineMode", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Background Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync data when back online
                  </p>
                </div>
                <Switch 
                  checked={preferences.backgroundSync}
                  onCheckedChange={(v) => handlePreferenceChange("backgroundSync", v)}
                />
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={item}>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sign Out Everywhere</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out from all devices
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out All
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div variants={item}>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
