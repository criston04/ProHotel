import AddHotelForm from "@/components/hotel/AddHotelForm"
import { getHotelById } from "../../../../actions/getHotelById";
import { auth } from '@clerk/nextjs/server';


interface HotelPageProps {
    params : {
        hotelId: string
    }
}

export const HotelCreate = async ({params}: HotelPageProps) => {
    const hotel = await getHotelById(params.hotelId);
    const { userId } = auth();

    if (!userId) return <div>Not authenticated.</div>;
    if (hotel && hotel.userId !== userId) return <div>Unauthorized.</div>;
  return (
    <div>
        <AddHotelForm hotel={hotel} />
    </div>
  )
}

export default HotelCreate