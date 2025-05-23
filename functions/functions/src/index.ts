import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

// Corrected paths assuming lib and types are at the project root
import { processImageWithOpenAI } from "./openai-service";

// Define the OPENAI_API_KEY secret
const openaiApiKey = defineSecret("OPENAI_API_KEY");

admin.initializeApp();

const db = getFirestore();
const storage = getStorage().bucket(); // Default bucket

export const processUploadedImage = onDocumentWritten(
  {
    document: "images/{imageId}", // Listen to writes on any document in the 'images' collection
    secrets: [openaiApiKey], // Make the secret available to this function
    region: "europe-west2",
    timeoutSeconds: 300,
  },
  async (event) => {
    logger.info(
      "Image processing function triggered for imageId:",
      event.params.imageId
    );

    // Ensure it's a create event or a relevant update
    if (!event.data) {
      logger.info(
        "No data associated with the event, likely a delete. Exiting."
      );
      return;
    }

    const snapshot = event.data.after;
    const beforeSnapshot = event.data.before;

    // Only process if it's a new document or if status was just set to 'processing'
    if (!snapshot.exists) {
      logger.info("Document does not exist (deleted). Exiting.");
      return;
    }

    const imageData = snapshot.data() as ImageData;

    // Check if the image is already processed or if it's a new upload needing processing
    if (
      imageData.status !== "processing" ||
      (beforeSnapshot.exists && beforeSnapshot.data()?.status === "processing")
    ) {
      logger.info(
        `Image status is '${imageData.status}'. No action needed or already being processed. Exiting.`
      );
      return;
    }

    logger.info(
      `Processing image: ${imageData.id} with original URL: ${imageData.originalUrl}`
    );

    try {
      const processedImageBase64String = await processImageWithOpenAI(
        imageData.originalUrl
      );

      if (processedImageBase64String) {
        const imageId = imageData.id;
        const processedImageRefPath = `processed/${imageId}`;
        const file = storage.file(processedImageRefPath);

        // The base64 string from OpenAI might include the data URI prefix
        // e.g., "data:image/jpeg;base64,"
        // We need to strip that if present before saving to a buffer
        const base64Data = processedImageBase64String.startsWith("data:")
          ? processedImageBase64String.split(",")[1]
          : processedImageBase64String;

        const buffer = Buffer.from(base64Data, "base64");

        await file.save(buffer, {
          metadata: {
            contentType: "image/jpeg", // Assuming JPEG, adjust if necessary
          },
        });
        logger.info(`Uploaded processed image to: ${processedImageRefPath}`);

        // Make the file public to get a download URL (alternative: getSignedUrl)
        await file.makePublic();
        const processedUrl = file.publicUrl();

        await db.collection("images").doc(snapshot.id).update({
          processedUrl: processedUrl,
          status: "completed",
        });
        logger.info(
          `Image ${imageId} processed and Firestore updated with URL: ${processedUrl}`
        );
      } else {
        throw new Error("OpenAI processing returned no data.");
      }
    } catch (error) {
      logger.error("Error processing image:", imageData.id, error);
      try {
        await db
          .collection("images")
          .doc(snapshot.id)
          .update({
            status: "failed",
            error: (error as Error).message, // Store error message
          });
      } catch (dbError) {
        logger.error("Error updating Firestore to failed status:", dbError);
      }
    }
  }
);

export interface ImageData {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  createdAt: number;
  userName?: string;
  status?: "processing" | "completed" | "failed";
}
