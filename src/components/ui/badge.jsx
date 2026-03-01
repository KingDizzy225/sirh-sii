import React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/80",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/80",
    outline: "text-slate-950 border border-slate-200",
    success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80",
    warning: "bg-amber-100 text-amber-700 hover:bg-amber-100/80",
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
    purple: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
}

function Badge({ className, variant = "default", ...props }) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
