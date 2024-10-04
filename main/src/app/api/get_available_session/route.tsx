import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import middleware from "../../../middleware";
import { UserDocument } from "@/datatypes/dataTypes";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // GET request check
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }
  try {
    // Extract query parameters from the URL
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    // Validate that user_id is provided
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Connect to MongoDB using Mongoose
    await dbConnect();

    // Retrieve the user document using the Conversation model
    const userDocument = (await Conversation.findOne({
      _id: user_id,
    }).lean()) as UserDocument;

    // If user doesn't exist or doesn't have any sessions, return session_id as 1
    if (
      !userDocument ||
      !userDocument.sessions ||
      Object.keys(userDocument.sessions).length === 0
    ) {
      return NextResponse.json({ next_session_id: 1 }, { status: 200 });
    }

    // Convert the Mongoose document to a plain JS object and retrieve the keys of the sessions object
    const sessionIds = Object.keys(userDocument.sessions);

    let nextSessionId = 1;
    // Find the first missing session_id starting from 1
    while (sessionIds.includes(nextSessionId.toString())) {
      nextSessionId++;
    }

    // Return the next available session ID
    return NextResponse.json(
      { next_session_id: String(nextSessionId) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching next session ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}