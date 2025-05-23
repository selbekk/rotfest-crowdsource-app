"use server";

import { db, storage } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { cookies } from 'next/headers';

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    const userNameFromForm = formData.get("userName") as string;

    const cookieStore = await cookies();
    const userNameFromCookie = cookieStore.get('rotfest-user-name')?.value;

    const userNameToSave = userNameFromForm || userNameFromCookie || "Anonym";

    if (!file) {
      throw new Error("Ingen fil valgt");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Kun bildefiler er tillatt");
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Bildet er for stort. Maksimal størrelse er 10MB");
    }

    // Generate a unique ID for the image
    const imageId = uuidv4();

    // Upload original image to Firebase Storage
    const originalImageRef = ref(storage, `original/${imageId}`);
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    await uploadBytes(originalImageRef, bytes);

    // Get the download URL for the original image
    const originalUrl = await getDownloadURL(originalImageRef);

    // The OpenAI processing will now be handled by a Firebase Cloud Function
    // triggered by the creation of this Firestore document.

    // Save image metadata to Firestore, indicating processing is pending
    await addDoc(collection(db, "images"), {
      id: imageId,
      originalUrl,
      // processedUrl will be added by the Cloud Function
      userName: userNameToSave,
      createdAt: Date.now(),
      status: "processing", // New status field
    });

    return { success: true, imageId };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error: (error as Error).message };
  }
}
