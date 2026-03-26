import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const MODEL_ID = "gemini-2.0-flash-exp-image-generation";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function POST(req: NextRequest) {
  let formData;
  try {
    formData = await req.formData();
  } catch (formError) {
    return NextResponse.json(
      { error: "Invalid request body", details: String(formError) },
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

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const prompt = `Generate a photorealistic virtual try-on image.
Take the person from the first image and dress them in the clothing item shown in the second image.

CRITICAL RULES:
- Preserve the person's EXACT facial identity, features, skin tone, and expression.
- Preserve the EXACT color, pattern, texture, and style of the clothing item.
- Generate a new clean background (neutral studio or fashion-appropriate setting).
- Keep the person's body pose exactly as shown.
- Make the clothing drape naturally on the person's body.
- Ensure consistent lighting between person, garment, and background.
- Output a single high-quality photorealistic image.`;

    // Convert files to Base64
    const userImageBase64 = arrayBufferToBase64(await userImageFile.arrayBuffer());
    const userImageMime = userImageFile.type || "image/jpeg";

    const clothingImageBase64 = arrayBufferToBase64(await clothingImageFile.arrayBuffer());
    const clothingImageMime = clothingImageFile.type || "image/png";

    console.log(`User: ${userImageMime} (${userImageBase64.length}), Clothing: ${clothingImageMime} (${clothingImageBase64.length})`);

    // Direct REST API call — no SDK needed
    const url = `${API_BASE}/${MODEL_ID}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: userImageMime, data: userImageBase64 } },
            { inlineData: { mimeType: clothingImageMime, data: clothingImageBase64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        topK: 40,
        responseModalities: ["Text", "Image"],
      },
    };

    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const apiResult = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API error:", JSON.stringify(apiResult, null, 2));
      const errMsg = apiResult.error?.message || apiResponse.statusText;
      throw new Error(`Gemini API: ${errMsg}`);
    }

    console.log("Gemini API response received, status:", apiResponse.status);

    // Extract image and text from response
    let textResponse = null;
    let imageData = null;
    let imageMimeType = "image/png";

    const candidates = apiResult.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            imageMimeType = part.inlineData.mimeType || "image/png";
            console.log("Image received:", imageMimeType, "length:", imageData?.length);
          } else if (part.text) {
            textResponse = part.text;
            console.log("Text:", textResponse.substring(0, 100));
          }
        }
      }
    } else {
      const blockReason = apiResult.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Η εικόνα απορρίφθηκε: ${blockReason}`);
      }
      throw new Error("Κενή απάντηση. Δοκίμασε διαφορετική φωτογραφία.");
    }

    return NextResponse.json({
      image: imageData ? `data:${imageMimeType};base64,${imageData}` : null,
      description: textResponse || "AI description not available.",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process virtual try-on request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
