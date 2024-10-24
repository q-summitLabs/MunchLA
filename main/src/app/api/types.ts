
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
    price_level: string;
    summary_of_restaurant: string;
    summary_of_reviews: string;
    google_maps_url: string;
    opening_hours: string;
    restaurant_website: string;
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

export type MessageProps = {
    isBot: boolean;
    text: string;
    restaurants?: Restaurant[];
  };
