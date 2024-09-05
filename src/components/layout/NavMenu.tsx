import * as React from "react"
import { BookOpenCheck, ChevronsUpDown, Hotel, Plus  } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";

export function NavMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <ChevronsUpDown className="text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="gap-2 bg-gray-300">
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/hotel/new')}>
           <Plus size={15} className="text-gray-500 mr-2 " /> <span className="text-gray-500">Add Hotel</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/my-hotels')}>
           <Hotel size={15} className="text-gray-500 mr-2 cursor-pointer" /> <span className="text-gray-500">My Hotels</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/hotel/new')}>
           <BookOpenCheck size={15} className="text-gray-500 mr-2 cursor-pointer" /> <span className="text-gray-500">My Bookings</span>
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
