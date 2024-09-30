import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, MicIcon, SendIcon, Loader2Icon } from "lucide-react";

type InputAreaProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export default function InputArea({
  prompt,
  setPrompt,
  handleSubmit,
  isLoading,
}: InputAreaProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 sticky bottom-0">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="Ask about LA's food scene..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-800 border-none text-gray-900 dark:text-white pl-4 pr-20 py-7 rounded-full text-sm"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-gray-500 dark:text-gray-400"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-gray-500 dark:text-gray-400"
          >
            <MicIcon className="h-5 w-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
