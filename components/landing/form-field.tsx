export function FormField({
  label,
  help,
  children,
}: {
  label: string
  help: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="type-monospaced text-foreground uppercase">{label}</p>
      {children}
      <p className="font-mono text-[11px] leading-snug text-foreground/55 sm:text-xs sm:leading-tight sm:text-foreground/70">{help}</p>
    </div>
  )
}
