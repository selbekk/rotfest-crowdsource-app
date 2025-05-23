"use client"

import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "./firebase"
import type { ImageData } from "@/types/image"

export function subscribeToImages(callback: (images: ImageData[]) => void) {
  const imagesQuery = query(collection(db, "images"), orderBy("createdAt", "desc"))

  return onSnapshot(imagesQuery, (snapshot) => {
    const images = snapshot.docs.map((doc) => {
      const data = doc.data() as ImageData
      return {
        ...data,
        id: doc.id,
      }
    })
    callback(images)
  })
}

export async function getImages(): Promise<ImageData[]> {
  const imagesQuery = query(collection(db, "images"), orderBy("createdAt", "desc"))

  const snapshot = await getDocs(imagesQuery)
  return snapshot.docs.map((doc) => {
    const data = doc.data() as ImageData
    return {
      ...data,
      id: doc.id,
    }
  })
}
