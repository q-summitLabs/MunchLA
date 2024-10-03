import { NextRequest, NextResponse } from "next/server";
import middleware from "../../middleware";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { RequestBody } from "@/datatypes/dataTypes";

// interface RequestBody {
//     user_id: string;
//     session_id: string;
//     message: string;
// }

export async function POST (req: NextRequest): Promise<Response> {
    const success = await middleware(req);
    if (!success) {
        return NextResponse.json(
            { error: "Rate limit exceeded. Please try again after a cooldown." },
            { status: 429}
        )
    }

        if (req.method !== "POST") {
        return NextResponse.json(
            { error: "Only POST requests are allowed" },
            { status: 405 }
        );
    }

    try {
    const { user_id, session_id }: RequestBody = await req.json();

    if (!user_id ||  !session_id) {
        return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
        );
    }

    await dbConnect();

    const updatedDB = await Conversation.updateOne(
        { _id: user_id },
        { $unset: { [`sessions.${session_id}`]: "" } }
      );

    if ( updatedDB && updatedDB.modifiedCount === 0) {
        return NextResponse.json(
            { error: "No session found for the provided user_id and session_id"},
            { status: 404}
        );
    }

    return NextResponse.json(
        { message: "Message history deleted successfully"},
        { status: 200 }
    );

    } catch (error) {
    console.error("Error deleting message history: ", error);
    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 200 }
    );
    }    
}