import prismadb from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-04-10'
});

export async function POST(req: Request) {
    try {
        console.log('Retrieving current user...');
        const user = await currentUser();
        console.log('User retrieved:', user);

        if (!user) {
            console.error('Unauthorized access attempt');
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('Parsing request body...');
        const body = await req.json();
        console.log('Request body:', body);

        const { booking, payment_intent_id } = body;

        const bookingData = {
            ...booking,
            userName: user.firstName,
            userEmail: user.emailAddresses[0].emailAddress,
            userId: user.id,
            currency: 'usd',
            paymentIntentId: payment_intent_id
        };

        console.log('Booking data:', bookingData);

        let foundBooking;

        if (payment_intent_id) {
            console.log('Looking for existing booking with payment intent id:', payment_intent_id);
            foundBooking = await prismadb.booking.findUnique({
                where: {
                    paymentIntentId: payment_intent_id,
                    userId: user.id
                }
            });
            console.log('Found booking:', foundBooking);
        }

        if (foundBooking) {
            // Update booking
            console.log('Updating existing booking...');
            await prismadb.booking.update({
                where: { id: foundBooking.id },
                data: bookingData
            });
            console.log('Booking updated successfully');

            return NextResponse.json({ message: 'Booking updated successfully' });
        } else {
            // Create booking
            console.log('Creating new booking...');
            const paymentIntent = await stripe.paymentIntents.create({
                amount: bookingData.totalPrice * 100, // Convert to cents
                currency: bookingData.currency,
                automatic_payment_methods: { enabled: true }
            });

            bookingData.paymentIntentId = paymentIntent.id;
            await prismadb.booking.create({ data: bookingData });
            console.log('Booking created and payment intent:', paymentIntent);

            return NextResponse.json({ paymentIntent });
        }
    } catch (error) {
        console.error('Error processing booking:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
