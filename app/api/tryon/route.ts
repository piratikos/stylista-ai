import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Model ID for Gemini image generation
const MODEL_ID = "gemini-2.0-flash-exp-image-generation";

// Lazy-init the AI client using the stable @google/generative-ai SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _genAI: any = null;
async function getGenAI() {
  if (!_genAI) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const key = process.env.GEMINI_API_KEY || "";
    if (!key) console.error("Missing GEMINI_API_KEY environment variable.");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}

export async function POST(req: NextRequest) {
  let formData;
  try {
    formData = await req.formData();
  } catch (formError) {
    console.error("Error parsing FormData request body:", formError);
    return NextResponse.json(
      {
        error: "Invalid request body: Failed to parse FormData.",
        details: formError instanceof Error ? formError.message : String(formError),
      },
      { status: 400 }
    );
  }

  try {
    const userImageFile = formData.get("userImage") as File | null;
    const clothingImageFile = formData.get("clothingImage") as File | null;

    if (!userImageFile || !clothingImageFile) {
      return NextResponse.json(
        { error: "Both userImage and clothingImage files are required" },
        { status: 400 }
      );
    }

    // Construct the detailed prompt
    const detailedPrompt = `Generate a photorealistic virtual try-on image.
Take the person from the first image and dress them in the clothing item shown in the second image.

CRITICAL RULES:
- Preserve the person's EXACT facial identity, features, skin tone, and expression. ZERO alterations to the face.
- Preserve the EXACT color, pattern, texture, and style of the clothing item. ZERO deviations.
- Generate a new clean background (neutral studio or fashion-appropriate setting).
- Keep the person's body pose exactly as shown.
- Make the clothing drape naturally on the person's body.
- Ensure consistent lighting between person, garment, and background.
- Do NOT alter the person's face or body shape.
- Do NOT change the clothing's appearance.
- Output a single high-quality photorealistic image.`;

    // Convert files to Base64
    const userImageBuffer = await userImageFile.arrayBuffer();
    const userImageBase64 = arrayBufferToBase64(userImageBuffer);
    const userImageMimeType = userImageFile.type || "image/jpeg";

    const clothingImageBuffer = await clothingImageFile.arrayBuffer();
    const clothingImageBase64 = arrayBufferToBase64(clothingImageBuffer);
    const clothingImageMimeType = clothingImageFile.type || "image/png";

    console.log(`User Image: ${userImageMimeType}, size: ${userImageBase64.length}`);
    console.log(`Clothing Image: ${clothingImageMimeType}, size: ${clothingImageBase64.length}`);

    // Use @google/generative-ai SDK
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        topK: 40,
        // @ts-expect-error - responseModalities is valid for image generation models
        responseModalities: ["Text", "Image"],
      },
    });

    const result = await model.generateContent([
      detailedPrompt,
      {
        inlineData: {
          mimeType: userImageMimeType,
          data: userImageBase64,
        },
      },
      {
        inlineData: {
          mimeType: clothingImageMimeType,
          data: clothingImageBase64,
        },
      },
    ]);

    const response = result.response;
    console.log("Gemini API response received");

    let textResponse = null;
    let imageData = null;
    let imageMimeType = "image/png";

    // Process the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts) {
        console.log("Number of parts in response:", parts.length);

        for (const part of parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            imageMimeType = part.inlineData.mimeType || "image/png";
            if (imageData) {
              console.log("Image data received, length:", imageData.length, "MIME type:", imageMimeType);
            }
          } else if (part.text) {
            textResponse = part.text;
            console.log("Text response:", textResponse.substring(0, 100));
          }
        }
      } else {
        console.log("No parts found in response candidate.");
      }
    } else {
      console.log("No candidates in API response.");
      const feedback = response?.promptFeedback;
      if (feedback?.blockReason) {
        console.error("Content blocked:", feedback.blockReason);
        throw new Error(`Η δημιουργία εικόνας απαγορεύτηκε: ${feedback.blockReason}`);
      }
      throw new Error("Κενή απάντηση από το API. Δοκίμασε διαφορετική φωτογραφία.");
    }

    return NextResponse.json({
      image: imageData ? `data:${imageMimeType};base64,${imageData}` : null,
      description: textResponse || "AI description not available.",
    });
  } catch (error) {
    console.error("Error processing virtual try-on request:", error);
    return NextResponse.json(
      {
        error: "Failed to process virtual try-on request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
