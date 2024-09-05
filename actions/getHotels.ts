import prismadb from "@/lib/prismadb";


export const getHotels = async (searchParams: {title: string; country: string; city:string;}) => {
    try {
        const {title, country, city} = searchParams;
        const hotels = await prismadb.hotel.findMany({
            where: {
                title: {
                    contains: title,
                },
                city,
                country
            },
            include: {rooms: true, }
        })
        return hotels;
    } catch (error: any) {
        console.log(error);
        throw new Error('Failed to fetch hotels');
    }
}

