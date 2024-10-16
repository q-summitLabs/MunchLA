# Routes

## API Endpoint: Delete Message History

### Description:
This API endpoint deletes the message history for a specific session belonging to a user.

### Method:
`POST /api/delete-conversation`

### Input Format (Request Body):
- `user_id` (string, required): The ID of the user whose session you want to delete.
- `session_id` (string, required): The ID of the session that you want to delete from the user's conversation history.

#### Example Request Body:
```json
{
  "user_id": "kaijones@goatlife.com",
  "session_id": "1"
}
```

#### Example Response JSON:
```json
{
  "message": "Message history deleted successfully",
  "status": 200
}
```

-------------------------------------------------

## API Endpoint: Get Next Available Session ID

### Description:
This API endpoint retrieves the next available session ID for a given user based on their previous sessions.

### Method:
`GET /api/get-available-session`

### Input Format (Query Parameters):
- `user_id` (string, required): The ID of the user for whom the next available session ID is being requested.

#### Example Request URL:
`GET /api/get-available-session?user_id=kaijones@goatlife.com`

#### Example Response JSON:
```json
{
  "next_session_id": "2"
}
```

-------------------------------------------------

## API Endpoint: Get Conversation

### Description:
This API endpoint retrieves the conversation history for a specific session of a user. It returns filtered messages that include only human and AI messages.

### Method:
`GET /api/get-conversation`

### Input Format (Query Parameters):
- `user_id` (string, required): The ID of the user whose conversation is being fetched.
- `session_id` (string, required): The ID of the session for which the conversation is requested.

#### Example Request URL:
`GET /api/get-conversation?user_id=kaijones@goatlife.com&session_id=1`

#### Example Reponse JSON
```json
{
  "conversation": [
    {
      "message_type": "human_message_no_prompt",
      "content": "Can you find me a good pizza place?"
    },
    {
      "message_type": "ai_message",
      "content": {
        "general_response": "Here are some pizza places I found near you.",
        "restaurants": [
            {
                "place_id": "ChIJxxxxxxxxxxxxxx",
                "summary_of_restaurant": "Restaurant Name is a popular dining establishment known for its delicious and customizable dishes. It features an efficient ordering system, allowing patrons to personalize their dining experience.",
                "summary_of_reviews": "Reviews highlight the impressive flavors and the overall taste balance, earning Restaurant Name a strong positive sentiment from customers.",
                "address": "123 Example St, City, State 12345, USA",
                "google_maps_url": "https://maps.google.com/?cid=xxxxxxxxxxxx",
                "keywords": "dummy_keyword1, dummy_keyword2, restaurant, food, point_of_interest, establishment",
                "name": "Restaurant Name",
                "num_of_reviews": 100,
                "opening_hours": "Monday: 10:00 AM – 10:00 PM\nTuesday: 10:00 AM – 10:00 PM\nWednesday: 10:00 AM – 10:00 PM\nThursday: 10:00 AM – 10:00 PM\nFriday: 10:00 AM – 11:00 PM\nSaturday: 10:00 AM – 11:00 PM\nSunday: 10:00 AM – 10:00 PM",
                "price_level": "Unknown",
                "rating": 4.0,
                "restaurant_website": "https://www.example-restaurant.com/"
            }
        ]
      }
    }
  ]
}
```
-------------------------------------------------

## API Endpoint: Get Conversations

### Description:
This API endpoint retrieves a list of conversations (sessions) for a given user, including a preview of the conversation and the timestamp of the last update.

### Method:
GET /api/get-conversations

### Input Format (Query Parameters):
- `user_id` (string, required): The ID of the user for whom the conversations are being retrieved.

#### Example Request URL:
`GET /api/get-conversations?user_id=kaijones@goatlife.com`

### Example JSON Response:
```json
{
    "sessions": [
        {
        "session_id": "1",
        "conversation_preview": "Last AI message content or fallback text",
        "last_updated": "2024-09-29T12:34:56.000Z"
        },
        {
        "session_id": "2",
        "conversation_preview": "Another AI message content or fallback text",
        "last_updated": "2024-09-28T10:23:45.000Z"
        }
    ]
}
```

-

## API Endpoint: Get Restaurant Details (Photos)

### Description:
This API endpoint fetches the photos of a restaurant by its Place ID from Google Places API. It returns up to three photo URLs.

### Method:
GET /api/restaurant-details

### Input Format (Query Parameters):
- `placeId` (string, required): The Place ID for which restaurant details (photos) are being requested.

#### Example Request URL:
GET /api/restaurant-details?placeId=sdfoisdjfoisdjoij

### Example JSON Response:
  ```json
  {
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=PHOTO_REFERENCE_1&key=API_KEY",
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=PHOTO_REFERENCE_2&key=API_KEY",
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=PHOTO_REFERENCE_3&key=API_KEY"
    ]
  }



## `POST /api/send-message`

Handles POST requests to send a message from the user and get a response from the AI, along with restaurant data if applicable.

### Input Format (Request Body)
- `user_id` (string, required): The unique identifier of the user sending the message.
- `session_id` (string, required): The session ID to associate the message with.
- `message` (string, required): The content of the message the user is sending.

#### Example Request Body:
```json
{
  "user_id": "kaijones@goatlife.com",
  "session_id": "1",
  "message": "I'm the goat, infinite unlimited money"
}
```


#### Example Response JSON:
```json
{
  "combinedResponse": {
    "general_response": "Your AI response here",
    "restaurants": [
        {
            "place_id": "ChIJxxxxxxxxxxxxxx",
            "summary_of_restaurant": "Restaurant Name is a popular dining establishment known for its delicious and customizable dishes. It features an efficient ordering system, allowing patrons to personalize their dining experience.",
            "summary_of_reviews": "Reviews highlight the impressive flavors and the overall taste balance, earning Restaurant Name a strong positive sentiment from customers.",
            "address": "123 Example St, City, State 12345, USA",
            "google_maps_url": "https://maps.google.com/?cid=xxxxxxxxxxxx",
            "keywords": "dummy_keyword1, dummy_keyword2, restaurant, food, point_of_interest, establishment",
            "name": "Restaurant Name",
            "num_of_reviews": 100,
            "opening_hours": "Monday: 10:00 AM – 10:00 PM\nTuesday: 10:00 AM – 10:00 PM\nWednesday: 10:00 AM – 10:00 PM\nThursday: 10:00 AM – 10:00 PM\nFriday: 10:00 AM – 11:00 PM\nSaturday: 10:00 AM – 11:00 PM\nSunday: 10:00 AM – 10:00 PM",
            "price_level": "Unknown",
            "rating": 4.0,
            "restaurant_website": "https://www.example-restaurant.com/"
        }
    ]
  }
}
```
