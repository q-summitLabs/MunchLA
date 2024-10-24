import { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  Star,
  MapPin,
  DollarSign,
  Globe,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Restaurant } from "../types";

// Price level mapping with tighter spacing
const priceLevelMap = {
  PRICE_LEVEL_FREE: {
    label: "Free",
    icon: <DollarSign className="w-3 h-3 opacity-50" />,
  },
  PRICE_LEVEL_INEXPENSIVE: {
    label: "Inexpensive",
    icon: <DollarSign className="w-3 h-3" />,
  },
  PRICE_LEVEL_MODERATE: {
    label: "Moderate",
    icon: (
      <div className="flex -space-x-1">
        <DollarSign className="w-3 h-3" />
        <DollarSign className="w-3 h-3" />
      </div>
    ),
  },
  PRICE_LEVEL_EXPENSIVE: {
    label: "Expensive",
    icon: (
      <div className="flex -space-x-1">
        <DollarSign className="w-3 h-3" />
        <DollarSign className="w-3 h-3" />
        <DollarSign className="w-3 h-3" />
      </div>
    ),
  },
  PRICE_LEVEL_VERY_EXPENSIVE: {
    label: "Very Expensive",
    icon: (
      <div className="flex -space-x-1">
        <DollarSign className="w-3 h-3" />
        <DollarSign className="w-3 h-3" />
        <DollarSign className="w-3 h-3" />
        <DollarSign className="w-3 h-3" />
      </div>
    ),
  },
};

// Create a cache object outside the component to persist across renders
const imageCache: { [key: string]: string[] } = {};

export default function EnhancedRestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const openingHours = restaurant.opening_hours
    ? restaurant.opening_hours.split("\n")
    : [];

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      if (imageCache[restaurant.place_id]) {
        setImages(imageCache[restaurant.place_id]);
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `/api/restaurant-details?placeId=${restaurant.place_id}`
        );
        const data = await response.json();
        if (data.photos) {
          setImages(data.photos);
          imageCache[restaurant.place_id] = data.photos;
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
      setIsLoading(false);
    };

    fetchImages();
  }, [restaurant.place_id]);

  const priceLevel =
    priceLevelMap[restaurant.price_level as keyof typeof priceLevelMap] ||
    priceLevelMap["PRICE_LEVEL_FREE"];

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : images.length > 0 ? (
            <Image
              src={images[0]}
              alt={`${restaurant.name} image`}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-2xl font-bold text-white mb-2">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-400 text-yellow-900">
                <Star className="w-4 h-4 mr-1" />
                {restaurant.rating}
              </Badge>
              <Badge className="bg-green-500 text-white flex items-center">
                {priceLevel.icon}
                <span className="ml-1 text-xs">{priceLevel.label}</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <p className="text-sm flex items-start">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-1" />
            {restaurant.address}
          </p>

          <div className="flex items-center justify-between text-sm">
            <a
              href={restaurant.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <MapPin className="w-4 h-4 mr-1" />
              View on Maps
            </a>
            {restaurant.restaurant_website && (
              <a
                href={restaurant.restaurant_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <Globe className="w-4 h-4 mr-1" />
                Website
              </a>
            )}
          </div>

          <Separator className="my-3 bg-gray-200 dark:bg-gray-700" />

          <div className="text-sm">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Restaurant Summary
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {restaurant.summary_of_restaurant}
            </p>
          </div>

          {isExpanded && (
            <>
              <Separator className="my-3 bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Opening Hours
                  </h4>
                  {openingHours.map((hours, index) => (
                    <p key={index} className="text-gray-600 dark:text-gray-300">
                      {hours}
                    </p>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Review Summary
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {restaurant.summary_of_reviews}
                  </p>
                </div>
              </div>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
