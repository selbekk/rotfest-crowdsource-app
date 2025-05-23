import OpenAI from "openai";

export async function processImageWithOpenAI(
  imageUrl: string
): Promise<string | null> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    // Download the image first
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageFile = new File([imageBuffer], "image.jpg", {
      type: "image/jpeg",
    });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: [imageFile],
      prompt: `Transform this uploaded image into a Norwegian national romantic style with traditional rosemaling decorative elements. Add beautiful rosemaling patterns around the edges and enhance the colors to match the traditional Norwegian aesthetic. Keep the main subject but make it more artistic and decorative in the style of Norwegian folk art.`,
    });

    console.log("open ai done generating");

    return response.data?.[0].b64_json || null;
  } catch (error) {
    console.error("Error processing image with OpenAI:", error);
    // Fallback: return the original image if processing fails
    return null;
  }
}
