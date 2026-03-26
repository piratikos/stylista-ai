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

// Primary: gemini-2.5-flash-preview-04-17, Fallback: gemini-2.5-flash-image
const MODEL_ID = "gemini-2.5-flash-preview-04-17";
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

    const prompt = `You are a virtual fitting room AI. Your task:

1. Image 1 = THE PERSON (the model/customer)
2. Image 2 = THE CLOTHING ITEM (could be: a photo of clothing on a person/model, a flat-lay product photo, a screenshot from an e-shop, clothing on a hanger, or clothing on a mannequin)

STEP 1 - IDENTIFY THE CLOTHING:
- Detect what TYPE of garment Image 2 shows: top/shirt/blouse, pants/trousers, dress, jacket/coat, shoes, skirt, shorts, suit, etc.
- Detect color, pattern, material, and style
- IGNORE any person/model wearing the clothing in Image 2 - focus ONLY on the garment itself
- If Image 2 has background, mentally remove it and focus on the clothing item

STEP 2 - APPLY ONLY THAT GARMENT:
- If Image 2 is a TOP (shirt, blouse, t-shirt, sweater, hoodie):
  → Change ONLY the top on the person. Keep their existing pants/bottom UNCHANGED
- If Image 2 is PANTS/TROUSERS (jeans, shorts, skirt):
  → Change ONLY the bottom on the person. Keep their existing top UNCHANGED
- If Image 2 is a DRESS or FULL OUTFIT:
  → Replace the entire outfit
- If Image 2 is a JACKET/COAT:
  → ADD the jacket over their existing outfit
- If Image 2 is SHOES:
  → Change ONLY the shoes. Keep everything else UNCHANGED
- If Image 2 is an ACCESSORY (hat, bag, scarf, sunglasses):
  → ADD the accessory. Keep everything else UNCHANGED

STEP 3 - PRESERVE THE PERSON:
- PRESERVE EXACTLY: face, facial features, sunglasses, accessories, hairstyle, skin tone, body shape, pose, hand position
- PRESERVE the original background from Image 1
- PRESERVE all clothing items that should NOT change
- DO NOT crop or cut the person - same framing as Image 1
- DO NOT remove any accessories (watches, bracelets, glasses, jewelry)

STEP 4 - REALISTIC FIT:
- Adapt the clothing to fit the person's body naturally
- Correct draping, proportions, fabric texture
- If clothing is from different gender, adapt the style while keeping color, pattern, and material
- Maintain realistic lighting and shadows from Image 1
- Result must look like a REAL untouched photograph

Generate ONE high-quality photorealistic image.`;

    // Convert files to Base64
    const userImageBase64 = arrayBufferToBase64(await userImageFile.arrayBuffer());
    const userImageMime = userImageFile.type || "image/jpeg";

    const clothingImageBase64 = arrayBufferToBase64(await clothingImageFile.arrayBuffer());
    const clothingImageMime = clothingImageFile.type || "image/png";

    console.log(`[TryOn] User image: ${userImageMime} (${userImageBase64.length} chars)`);
    console.log(`[TryOn] Clothing image: ${clothingImageMime} (${clothingImageBase64.length} chars)`);

    // Try primary model, fallback to gemini-2.5-flash-image
    const models = [MODEL_ID, "gemini-2.5-flash-image"];

    for (const model of models) {
      console.log(`[TryOn] Trying model: ${model}`);

      const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

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
          responseModalities: ["TEXT", "IMAGE"],
        },
      };

      const apiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const apiResult = await apiResponse.json();

      if (!apiResponse.ok) {
        console.error(`[TryOn] ${model} error:`, JSON.stringify(apiResult, null, 2));
        // If model not found, try next
        if (apiResult.error?.code === 404 || apiResult.error?.status === "NOT_FOUND") {
          console.log(`[TryOn] Model ${model} not found, trying next...`);
          continue;
        }
        const errMsg = apiResult.error?.message || apiResponse.statusText;
        throw new Error(`Gemini API: ${errMsg}`);
      }

      console.log(`[TryOn] ${model} response status:`, apiResponse.status);
      console.log(`[TryOn] Full response:`, JSON.stringify(apiResult, null, 2).substring(0, 500));

      // Extract image and text from response
      let textResponse = null;
      let imageData = null;
      let imageMimeType = "image/png";

      const candidates = apiResult.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0]?.content?.parts;
        if (parts) {
          console.log(`[TryOn] Response has ${parts.length} parts`);
          for (const part of parts) {
            if (part.inlineData) {
              imageData = part.inlineData.data;
              imageMimeType = part.inlineData.mimeType || "image/png";
              console.log(`[TryOn] IMAGE found: ${imageMimeType}, length: ${imageData?.length}`);
            } else if (part.text) {
              textResponse = part.text;
              console.log(`[TryOn] TEXT found: ${textResponse.substring(0, 200)}`);
            }
          }
        } else {
          console.log(`[TryOn] No parts in candidate:`, JSON.stringify(candidates[0], null, 2).substring(0, 300));
        }

        // If we got an image, return it
        if (imageData) {
          return NextResponse.json({
            image: `data:${imageMimeType};base64,${imageData}`,
            description: textResponse || "Virtual try-on complete.",
          });
        }

        // If no image but got text, try next model
        if (!imageData && textResponse) {
          console.log(`[TryOn] ${model} returned text only, trying next model...`);
          continue;
        }
      } else {
        const blockReason = apiResult.promptFeedback?.blockReason;
        if (blockReason) {
          console.error(`[TryOn] Blocked: ${blockReason}`);
          throw new Error(`Η εικόνα απορρίφθηκε: ${blockReason}`);
        }
        console.log(`[TryOn] Empty response from ${model}, trying next...`);
        continue;
      }
    }

    // All models failed to produce image
    throw new Error("Δεν επέστρεψε εικόνα. Δοκίμασε ξανά.");

  } catch (error) {
    console.error("[TryOn] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process virtual try-on request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
