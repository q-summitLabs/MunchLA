import { Card } from "@/components/ui/card";
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

  return (
    <Card className="bg-gray-100 dark:bg-gray-800 border-none p-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
          {getIcon()}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
      </div>
    </Card>
  );
}
