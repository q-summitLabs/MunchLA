// types.ts for util files

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