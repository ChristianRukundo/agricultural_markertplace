"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { useGSAP } from "@/components/providers/gsap-provider"

interface ToggleSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  icon?: React.ReactNode
}

const ToggleSwitch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, ToggleSwitchProps>(
  ({ className, icon, ...props }, ref) => {
    const thumbRef = React.useRef<HTMLSpanElement>(null)
    const gsap = useGSAP()

    React.useEffect(() => {
      if (!thumbRef.current) return

      const thumb = thumbRef.current

      const handleToggle = () => {
        gsap.to(thumb, {
          scale: 1.2,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }

      thumb.addEventListener("click", handleToggle)
      return () => thumb.removeEventListener("click", handleToggle)
    }, [gsap])

    return (
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className,
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          ref={thumbRef}
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 flex items-center justify-center",
          )}
        >
          {icon && <span className="text-xs">{icon}</span>}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    )
  },
)
ToggleSwitch.displayName = "ToggleSwitch"

export { ToggleSwitch }
