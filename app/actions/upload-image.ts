"use server"

import { v4 as uuidv4 } from "uuid"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { processImageWithOpenAI } from "@/lib/openai-service"

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("image") as File
    const userName = formData.get("userName") as string

    if (!file) {
      throw new Error("Ingen fil valgt")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Kun bildefiler er tillatt")
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Bildet er for stort. Maksimal størrelse er 10MB")
    }

    // Generate a unique ID for the image
    const imageId = uuidv4()

    // Upload original image to Firebase Storage
    const originalImageRef = ref(storage, `original/${imageId}`)
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    await uploadBytes(originalImageRef, bytes)

    // Get the download URL for the original image
    const originalUrl = await getDownloadURL(originalImageRef)

    // Process the image with OpenAI
    let processedUrl = originalUrl // Fallback to original if processing fails
    try {
      const processedImageUrl = await processImageWithOpenAI(originalUrl)

      if (processedImageUrl && processedImageUrl !== originalUrl) {
        // Download the processed image and upload to Firebase Storage
        console.log("downloading image");
        const processedImageResponse = await fetch(processedImageUrl)
        const processedImageBlob = await processedImageResponse.blob()
        const processedImageRef = ref(storage, `processed/${imageId}`)
        console.log("uploading to firebase")
        await uploadBytes(processedImageRef, processedImageBlob)
        console.log("uploaded to firebase");
        processedUrl = await getDownloadURL(processedImageRef)
        console.log("url found");
      }
    } catch (aiError) {
      console.warn("AI processing failed, using original image:", aiError)
    }

    // Save image metadata to Firestore
    await addDoc(collection(db, "images"), {
      id: imageId,
      originalUrl,
      processedUrl,
      userName: userName || "Anonym",
      createdAt: Date.now(),
    })

    return { success: true, imageId }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { success: false, error: (error as Error).message }
  }
}
