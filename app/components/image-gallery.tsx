"use client";

import { subscribeToImages } from "@/lib/image-service";
import type { ImageData } from "@/types/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Maximize, Minimize, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const IMAGES_PER_PAGE = 6;
const MD_BREAKPOINT = 768;

export default function ImageGallery() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);

  const [isMobileView, setIsMobileView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numImagesToShow, setNumImagesToShow] = useState(IMAGES_PER_PAGE);
  const [isAutoplaying, setIsAutoplaying] = useState(true);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < MD_BREAKPOINT);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToImages((newImages) => {
      setImages(newImages);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isAutoplaying && !isMobileView && images.length > IMAGES_PER_PAGE) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + IMAGES_PER_PAGE;
          return nextIndex >= images.length ? 0 : nextIndex;
        });
      }, 15000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoplaying, isMobileView, images.length, setCurrentIndex]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (galleryRef.current?.requestFullscreen) {
        galleryRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Laster bildegalleri...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="text-2xl mb-4">Ingen bilder ennå</p>
          <p className="text-gray-400">
            Vent på at noen laster opp det første bildet!
          </p>
        </div>
      </div>
    );
  }

  let currentImages: ImageData[] = [];
  if (isMobileView) {
    currentImages = images.slice(0, numImagesToShow);
  } else {
    currentImages = images.slice(currentIndex, currentIndex + IMAGES_PER_PAGE);
    if (
      currentImages.length < IMAGES_PER_PAGE &&
      images.length > IMAGES_PER_PAGE
    ) {
      currentImages.push(
        ...images.slice(0, IMAGES_PER_PAGE - currentImages.length)
      );
    }
  }
  if (images.length > 0 && images.length < IMAGES_PER_PAGE && !isMobileView) {
    currentImages = [...images];
  }

  const handleLoadMore = () => {
    setNumImagesToShow((prev) =>
      Math.min(prev + IMAGES_PER_PAGE, images.length)
    );
  };

  return (
    <div ref={galleryRef} className="w-full h-full bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <h1 className="text-2xl font-bold">Minner fra Rotfest</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="hidden md:block px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
          {!isMobileView && (
            <button
              onClick={() => setIsAutoplaying((prev) => !prev)}
              className="hidden md:block px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors ml-2"
              aria-label={isAutoplaying ? "Pause autoplay" : "Start autoplay"}
            >
              {isAutoplaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={`grid ${
            isMobileView && numImagesToShow < 3
              ? `grid-cols-${numImagesToShow}`
              : "md:grid-cols-3"
          } grid-cols-1 gap-4 w-full h-full`}
        >
          <AnimatePresence mode="popLayout">
            {currentImages.map((image) => (
              <motion.div
                key={`${image.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-900"
              >
                <img
                  src={
                    image.processedUrl ||
                    image.originalUrl ||
                    "/placeholder.svg"
                  }
                  alt={`Bilde fra ${image.userName || "Anonym"}`}
                  className="w-full h-full object-cover"
                />
                {image.status === "processing" && !image.processedUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white mr-2" />
                    <p className="text-white text-sm font-semibold">
                      Fornorsker...
                    </p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white font-medium">
                    {image.userName || "Anonym"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 bg-black text-white text-center">
        <p>
          Totalt {images.length} bilder • Viser{" "}
          {isMobileView
            ? `${images.length > 0 ? 1 : 0}-${Math.min(
                numImagesToShow,
                images.length
              )}`
            : `${
                images.length > 0
                  ? Math.min(currentIndex + 1, images.length)
                  : 0
              }-${Math.min(currentIndex + IMAGES_PER_PAGE, images.length)}`}
          {" av "}
          {images.length}
        </p>
        {isMobileView && numImagesToShow < images.length && (
          <button
            onClick={handleLoadMore}
            className="md:hidden mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            Last inn flere bilder
          </button>
        )}
      </div>

      <img
        src="/qrcode.png"
        alt="QR Code"
        className="hidden md:block fixed bottom-4 right-4 w-40 h-40 z-50 rounded-md border-2 border-white shadow-lg"
      />
    </div>
  );
}
