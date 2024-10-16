import { NextResponse } from "next/server";

// Google Places API key from environment variables
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Handles GET requests to fetch restaurant details, specifically photos, from Google Places API.
 *
 * Input Format (Query Parameters):
 * - placeId (string, required): The Place ID for which restaurant details are being requested.
 *
 * Output Format (Response):
 * - Success Response (200):
 *   {
 *     "photos": [
 *       "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=PHOTO_REFERENCE&key=API_KEY",
 *       ...
 *     ]
 *   }
 * - Error Responses:
 *   - 400: Missing placeId
 *     {
 *       "error": "Place ID is required"
 *     }
 *   - 404: No photos found for the provided Place ID
 *     {
 *       "error": "No photos found"
 *     }
 *   - 500: Internal server error
 *     {
 *       "error": "Error fetching restaurant details"
 *     }
 *
 * @param request - The incoming Next.js request object containing query parameters.
 * @returns JSON response with photo URLs or error messages.
 */

export async function GET(request: Request) {
  // Extract placeId from query parameters
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  // If no placeId is provided, return a 400 error
  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 }
    );
  }

  try {
    // Make an API request to Google Places to fetch photos for the given placeId
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${API_KEY}`
    );
    const data = await response.json();

    // If photos are found, return the first three photo URLs
    if (data.result && data.result.photos) {
      const photoUrls = data.result.photos
        .slice(0, 3)
        .map(
          (photo: { photo_reference: string }) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
        );
      return NextResponse.json({ photos: photoUrls });
    } else {
      // If no photos are found, return a 404 error
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }
  } catch (error) {
    // Log and handle any server errors
    console.error("Error fetching restaurant details:", error);
    return NextResponse.json(
      { error: "Error fetching restaurant details" },
      { status: 500 }
    );
  }
}
