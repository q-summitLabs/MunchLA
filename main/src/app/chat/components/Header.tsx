import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GridIcon, UtensilsIcon } from "lucide-react";
import { Session } from "next-auth";

type HeaderProps = {
  loginInfo: Session | null;
};

export default function Header({ loginInfo }: HeaderProps) {
  return (
    <header className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <GridIcon className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <UtensilsIcon className="h-6 w-6" />
        </Button>
      </div>
      <Avatar>
        <AvatarImage
          src={loginInfo?.user?.image ?? ""}
          alt={loginInfo?.user?.name ?? "User"}
        />
        <AvatarFallback>{loginInfo?.user?.name?.[0] ?? "U"}</AvatarFallback>
      </Avatar>
    </header>
  );
}
