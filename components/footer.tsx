import Link from "next/link"

export function Footer() {
  return (
    <footer className="px-20 mt-auto py-6 text-center text-sm text-muted-foreground border-t border-border">
      <div className="px-4 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p>
          &copy; {new Date().getFullYear()} Executive OS. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:underline underline-offset-4">Privacy</Link>
          <Link href="/terms" className="hover:underline underline-offset-4">Terms</Link>
          <Link href="/support" className="hover:underline underline-offset-4">Support</Link>
        </div>
      </div>
    </footer>
  )
}
