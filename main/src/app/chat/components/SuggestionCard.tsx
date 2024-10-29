import { Card } from "@/src/components/ui/card";
import { MapPinIcon, CameraIcon, ListIcon, IceCreamIcon } from "lucide-react";

type SuggestionCardProps = {
  text: string;
  icon: string;
};

export default function SuggestionCard({ text, icon }: SuggestionCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "MapPin":
        return <MapPinIcon className="h-6 w-6" />;
      case "Camera":
        return <CameraIcon className="h-6 w-6" />;
      case "List":
        return <ListIcon className="h-6 w-6" />;
      case "IceCream":
        return <IceCreamIcon className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getShortText = () => {
    switch (icon) {
      case "MapPin":
        return "Find Restaurants";
      case "Camera":
        return "Visual Search";
      case "List":
        return "Best Sushi";
      case "IceCream":
        return "Ice Cream Shops";
      default:
        return "Suggestion";
    }
  };

  return (
    <Card className="bg-gray-100 dark:bg-gray-800 border-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
      <div className="p-3 sm:p-4">
        <div className="sm:hidden flex flex-col items-center justify-center space-y-2">
          <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full">
            {getIcon()}
          </div>
          <p className="text-xs text-center text-gray-700 dark:text-gray-300">
            {getShortText()}
          </p>
        </div>
        <div className="hidden sm:flex items-start space-x-4">
          <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
            {getIcon()}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
        </div>
      </div>
    </Card>
  );
}
