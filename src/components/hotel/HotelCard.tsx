"use client";

import { usePathname, useRouter } from "next/navigation";
import { HotelWithRooms } from "./AddHotelForm";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { Dumbbell, MapPin, PencilIcon, Verified } from "lucide-react";
import { Button } from "../ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const HotelCard = ({ hotel }: { hotel: HotelWithRooms }) => {
  const pathname = usePathname();
  const isMyHotels = pathname.includes("my-hotels");
  const router = useRouter();

  return (
    <div
      className={cn(
        "shadow-xl rounded-lg col-span-1  transition hover:scale-103",
        isMyHotels && "cursor-default"
      )}
    >
      <div className="flex flex-col bg-background/50 rounded-lg">
        <div className="aspect-w-16 aspect-h-9 overflow-hidden relative w-full h-[200px] rounded-t-lg">
          <Image
            fill
            src={hotel.image}
            alt={hotel.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between gap-1 p-4 text-sm rounded-b-lg">
          <div className="text-green-600 flex justify-end">
            <HoverCard>
              <HoverCardTrigger className="cursor-pointer">
                <AmenityItem >
                  <Verified className="w-3 h-3" />
                  <p className="text-xs">Verified</p>
                </AmenityItem>
              </HoverCardTrigger>
              <HoverCardContent className="bg-gray-300 border border-gray-300">
                <p className="text-xs text-green-600">
                  This hotel has been verified for quality and service.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <h3 className="font-bold text-indigo-500 text-2xl">{hotel.title}</h3>
          <div className="text-primary/90 my-1">
            {hotel.description.substring(0, 45)}...
          </div>
          <div className="text-gray-500 flex flex-col my-2">
            <AmenityItem>
              <MapPin className="w-3 h-3" />
              <p className="text-xs">
                {hotel.city + ", " + hotel.state + ", " + hotel.country}
              </p>
            </AmenityItem>
            <p className="mt-5">
              {hotel.gym && (
                <AmenityItem>
                  <Dumbbell className="w-3 h-3" />
                  <p className="text-xs">Gym</p>
                </AmenityItem>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {hotel.rooms[0]?.roomPrice && (
                <>
                  <div className="text-xl font-semibold text-indigo-600">
                    ${hotel.rooms[0].roomPrice}
                  </div>
                  <div className="text-xs text-indigo-600">USD</div>
                </>
              )}
            </div>
            {isMyHotels && (
              <Button
                className="bg-indigo-500 hover:bg-indigo-800 hover:text-white text-white font-bold"
                onClick={() => router.push(`/hotel/${hotel.id}`)}
                variant="outline"
              >
                Edit
              </Button>
            )}
          </div>
          <Button
            onClick={() =>
              !isMyHotels && router.push(`/hotel-details/${hotel.id}`)
            }
            className=" bg-indigo-500 hover:bg-indigo-800 hover:text-white text-white font-bold mt-7"
          >
            {" "}
            Check it{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
