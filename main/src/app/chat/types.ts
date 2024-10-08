export type AIMessageContent = {
    general_response: string;
    restaurants: Restaurant[];
};

export type MessageData = {
    message_type: string;
    content: string | AIMessageContent;
};

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

export type Message = {
    text: string;
    isBot: boolean;
    restaurants?: Restaurant[];
};

export type Conversation = {
    id: string;
    title: string;
    messages: Message[];
};

export type Session = {
    id: string;
    conversation_preview: string;
    last_updated: string;
};

export type SessionData = {
    session_id: string;
    conversation_preview: string;
    last_updated: string;
};