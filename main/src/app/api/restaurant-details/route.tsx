// app/api/restaurant-details/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.result && data.result.photos) {
      const photoUrls = data.result.photos
        .slice(0, 3)
        .map(
          (photo: { photo_reference: string }) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
        );
      return NextResponse.json({ photos: photoUrls });
    } else {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching restaurant details:", error);
    return NextResponse.json(
      { error: "Error fetching restaurant details" },
      { status: 500 }
    );
  }
}
