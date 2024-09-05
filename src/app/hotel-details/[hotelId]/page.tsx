
import HotelDetailsClient from "@/components/hotel/HotelDetailsClient";
import { getHotelById } from "../../../../actions/getHotelById";


interface HotelDetailsProps {
    params: {
        hotelId: string;
    }

}


const HotelDetails = async ({params}: HotelDetailsProps) => {
    const hotel = await getHotelById(params.hotelId);
    if (!hotel) {
        return <div>Hotel not found</div>;
    }
    return (
        <div>
            <HotelDetailsClient hotel={hotel}  />
        </div>
    );
}
 
export default HotelDetails;