export interface ImageData {
  id: string
  originalUrl: string
  processedUrl?: string
  createdAt: number
  userName?: string
  status?: "processing" | "completed" | "failed"
}
