/* eslint-disable @next/next/no-img-element */
export function FlexLogo({ className = "", size = "default", variant = "default" }: { className?: string; size?: "small" | "default" | "large"; variant?: "default" | "light" }) {
  const sizes = {
    small: { width: 100, height: 20 },
    default: { width: 150, height: 30 },
    large: { width: 200, height: 40 }
  }

  const isLight = variant === "light"
  const filterClass = isLight ? "brightness-0 invert" : ""
  
  // Direct URL to the Flex logo
  const logoUrl = "https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/Green_V3%20Symbol%20%26%20Wordmark%20(1).png"

  return (
    <img
      src={logoUrl}
      alt="The Flex"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`object-contain ${filterClass} ${className}`}
      style={{ width: sizes[size].width, height: sizes[size].height }}
    />
  )
}