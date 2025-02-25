"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Badge } from "./ui/badge";

import { Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";

function Profile() {
  const router = useRouter();

  const { userProfile } = useGlobalContext();

  // const { profilePicture, name, profession, email } = userProfile;
  const { name, profession, email } = userProfile;

  return (
    <DropdownMenu>
      <div className="flex items-center gap-4">
        <Badge>{profession}</Badge>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Image
            // src={profilePicture ? profilePicture : "/user.png"}
            src="/user.png"
            alt="avatar"
            width={36}
            height={36}
            className="rounded-lg"
          />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            router.push(
              `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}${process.env.NEXT_PUBLIC_SERVER_PORT}/logout`
            );
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>LogOut</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Profile;
