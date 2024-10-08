
export type RequestBody = {
    user_id: string;
    session_id: string;
    message: string;
}

export type Restaurant = {
    name: string;
    place_id: string;
    address: string;
    rating: number;
    price: string;
    summary: string;
}

export type AIMessageContent = {
    general_response: string;
    restaurants: Restaurant[];
}

export type Message = {
    message_type: string;
    content: string | AIMessageContent;
}

export type Session = {
    last_updated: string;
    messages: Message[];
}

export type Sessions = {
    [sessionId: string]: Session;
}

export type SessionsDataToReturn = {
    session_id: string;
    conversation_preview: string;
    last_updated: string;
}

export type UserDocument = {
    _id: string;
    sessions: Sessions;
}


