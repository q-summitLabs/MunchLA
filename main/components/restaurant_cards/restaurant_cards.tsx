import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star, MapPin, DollarSign, Clock, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageProps, Restaurant } from '@/datatypes/dataTypes'

export default function AIResponse({ isBot, text, restaurants }: MessageProps) {
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`inline-block p-4 rounded-lg max-w-[80%] ${
          isBot
            ? "bg-background shadow-md"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="mb-4">{text}</p>
        {restaurants && restaurants.length > 0 && (
          <div className="grid gap-6 mt-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={index} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHoursExpanded, setIsHoursExpanded] = useState(false)

  const openingHours = restaurant.opening_hours ? restaurant.opening_hours.split('\n') : []

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{restaurant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{restaurant.address}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-sm font-medium">{restaurant.price_level}</span>
            </div>
          </div>
          {openingHours.length > 0 && (
            <div className="flex items-start">
              <Clock className="w-4 h-4 mr-2 mt-1 text-muted-foreground" />
              <div className="flex flex-col">
                {isHoursExpanded ? (
                  openingHours.map((hours, index) => (
                    <span key={index} className="text-sm text-muted-foreground">{hours}</span>
                  ))
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">{openingHours[0]}</span>
                    {openingHours.length > 1 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-blue-500"
                        onClick={() => setIsHoursExpanded(true)}
                      >
                        Show more hours
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <a href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-500 hover:underline">
              <MapPin className="w-4 h-4 mr-1" />
              View on Google Maps
            </a>
            {restaurant.restaurant_website && (
              <a href={restaurant.restaurant_website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-500 hover:underline">
                <Globe className="w-4 h-4 mr-1" />
                Website
              </a>
            )}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={{
                expanded: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Restaurant Summary</h4>
                  <p className="text-sm text-muted-foreground">{restaurant.summary_of_restaurant}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Review Summary</h4>
                  <p className="text-sm text-muted-foreground">{restaurant.summary_of_reviews}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4"
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
      </CardContent>
    </Card>
  )
}