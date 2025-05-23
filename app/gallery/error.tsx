"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-white text-center p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Noe gikk galt!</h2>
        <p className="mb-6">Beklager, vi kunne ikke laste bildegalleriet.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline">
            Prøv igjen
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="default">
            Gå til forsiden
          </Button>
        </div>
      </div>
    </div>
  )
}
