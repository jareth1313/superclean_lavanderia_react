import { cn } from "../../lib/utils"

export function Field({ label, htmlFor, children, className, hint }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const base =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"

export function Input({ className, ...props }) {
  return <input className={cn(base, className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(base, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  )
}
