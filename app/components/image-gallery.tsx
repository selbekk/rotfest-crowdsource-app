"use client"

import { useState, useEffect, useRef } from "react"
import { subscribeToImages } from "@/lib/image-service"
import type { ImageData } from "@/types/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function ImageGallery() {
  const [images, setImages] = useState<ImageData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Subscribe to image updates from Firestore
    const unsubscribe = subscribeToImages((newImages) => {
      setImages(newImages)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // Set up the interval to change images every 5 seconds
    const interval = setInterval(() => {
      if (images.length > 6) {
        setCurrentIndex((prevIndex) => {
          // Calculate the next index, ensuring we don't go out of bounds
          const nextIndex = prevIndex + 6
          return nextIndex >= images.length ? 0 : nextIndex
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length])

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (galleryRef.current?.requestFullscreen) {
        galleryRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Add loading state to the render
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Laster bildegalleri...</p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="text-2xl mb-4">Ingen bilder ennå</p>
          <p className="text-gray-400">Vent på at noen laster opp det første bildet!</p>
        </div>
      </div>
    )
  }

  // Get the current set of 6 images to display
  const currentImages = images.slice(currentIndex, currentIndex + 6)
  // If we don't have 6 images, add from the beginning
  if (currentImages.length < 6 && images.length > 6) {
    currentImages.push(...images.slice(0, 6 - currentImages.length))
  }

  return (
    <div ref={galleryRef} className="w-full h-full bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <h1 className="text-2xl font-bold">Rotfest Bildegalleri</h1>
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
        >
          {isFullscreen ? "Avslutt fullskjerm" : "Fullskjerm"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-4 w-full h-full">
          <AnimatePresence mode="wait">
            {currentImages.map((image, index) => (
              <motion.div
                key={`${image.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-900"
              >
                <img
                  src={image.processedUrl || image.originalUrl || "/placeholder.svg"}
                  alt={`Bilde fra ${image.userName || "Anonym"}`}
                  className="w-full h-full object-cover"
                />
                {image.status === "processing" && !image.processedUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white mr-2" />
                    <p className="text-white text-sm font-semibold">Behandler...</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white font-medium">{image.userName || "Anonym"}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 bg-black text-white text-center">
        <p>
          Totalt {images.length} bilder • Viser {Math.min(currentIndex + 1, images.length)}-
          {Math.min(currentIndex + 6, images.length)} av {images.length}
        </p>
      </div>
    </div>
  )
}
