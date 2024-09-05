"use client";

import * as z from "zod";
import { Hotel, Room } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Pencil, PencilLine } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { UploadButton } from "../uploadthing";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

interface AddRoomFormProps {
  // AddRoomForm properties
  hotel?: Hotel & {
    rooms: Room[];
  };
  room?: Room;
  handleDialogueOpen: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Title must be at least 10 characters long",
  }),
  bedCount: z.coerce.number().min(1, { message: "Bed count is required" }),
  guestCount: z.coerce.number().min(1, { message: "Guest count is required" }),
  bathRoomCount: z.coerce
    .number()
    .min(1, { message: "Bathroom count is required" }),
  kingBed: z.coerce.number().min(0),
  queenBed: z.coerce.number().min(0),
  image: z.string().min(1, {
    message: "Image is required",
  }),
  roomPrice: z.coerce.number().min(1, { message: "Room price is required" }),
  roomService: z.boolean().optional(),
  TV: z.boolean().optional(),
  balcony: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  cityView: z.boolean().optional(),
  oceanView: z.boolean().optional(),
  forestView: z.boolean().optional(),
  mountainView: z.boolean().optional(),
  airCondition: z.boolean().optional(),
  soundProof: z.boolean().optional(),
});

const AddRoomForm = ({ hotel, room, handleDialogueOpen }: AddRoomFormProps) => {
  const [image, setImage] = useState<string | undefined>(room?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: room || {
      title: "",
      description: "",
      bedCount: 0,
      guestCount: 0,
      bathRoomCount: 0,
      kingBed: 0,
      queenBed: 0,
      image: "",
      roomPrice: 0,
      roomService: false,
      TV: false,
      balcony: false,
      freeWifi: false,
      cityView: false,
      oceanView: false,
      forestView: false,
      mountainView: false,
      airCondition: false,
      soundProof: false,
    },
  });
  useEffect(() => {
    if (typeof image === "string") {
      form.setValue("image", image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [image]);
  const handleImageDelete = (image: string) => {
    setImageIsDeleting(true);
    const imageKey = image.substring(image.lastIndexOf("/") + 1);
    axios
      .post("/api/uploadthing/delete", { imageKey })
      .then((res) => {
        if (res.data.success) {
          setImage("");
          setImageIsDeleting(false);
          toast({
            variant: "success",
            description: "🎉 Image Deleted",
          });
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "ERROR - Image Delete Failed",
        });
      })
      .finally(() => {
        setImageIsDeleting(false);
      });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (hotel && room) {
      // Update Hotel
      axios
        .patch(`/api/room/${room.id}`, values)
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Room Updated",
          });
          router.refresh();
          setIsLoading(false);
          handleDialogueOpen();
        })
        .catch((error) => {
          console.log("ERROR at /api/hotel:id PATCH: ", error);
          toast({
            variant: "destructive",
            description: "ERROR - Room Not Updated",
          });
          setIsLoading(false);
        });
    } else {
      // Create Hotel
      if(!hotel) return;
      axios
        .post("/api/room", {...values, hotelId: hotel.id})
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Room Created",
          });
          router.refresh();
          setIsLoading(false);
          handleDialogueOpen();
        })
        .catch((error) => {
          console.log("ERROR at /api/room POST: ", error);
          toast({
            variant: "destructive",
            description: "ERROR - Room Not Created",
          });
          setIsLoading(false);
        });
    }
  }
  return (
    <div className="max-h-[75vh] overflow-y-auto px-2">
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-indigo-500 font-bold text-sm">
                  Room Title *
                </FormLabel>
                <FormDescription>
                  Enter the title of the room, e.g., "Deluxe Room"
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="Double Room"
                    {...field}
                    className="bg-indigo-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-indigo-500 font-bold text-sm">
                  Room Description *
                </FormLabel>
                <FormDescription>
                  Enter the description of the room, e.g., "Deluxe Room with the
                  best view of the city"
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="Best view of the hotel..."
                    {...field}
                    className="bg-indigo-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel className="text-indigo-500 font-bold text-sm">
              {" "}
              Room Amenities{" "}
            </FormLabel>
            <FormDescription>
              What makes this room a good choice?
            </FormDescription>
            <div className="grid grid-cols-2 gap-2 mt-5 bg-indigo-200 rounded-md p-2">
              <FormField
                control={form.control}
                name="roomService"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">
                      24 hrs Room Service
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="TV"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">TV</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balcony"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">Balcony</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freeWifi"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">Free Wifi</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cityView"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">City View</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="oceanView"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">oceanView</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="forestView"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">
                      Forest View
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mountainView"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">
                      Mountain View
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="airCondition"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">
                      Air Condition
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soundProof"
                render={({ field }) => (
                  <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-indigo-500 border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-indigo-500">
                      Sound Proof
                    </FormLabel>
                    
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3">
                <FormLabel className="text-indigo-500 font-bold text-sm text-center mt-5">
                  Room Image *
                </FormLabel>
                <FormControl className="my-8">
                  {!image ? (
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          setImage(res[0].url);
                          field.onChange(res[0].url);
                          toast({
                            variant: "success",
                            description: "🎉 Image Uploaded",
                          });
                        }
                      }}
                      onUploadError={() => {
                        toast({
                          variant: "destructive",
                          description: "ERROR - Image not uploaded",
                        });
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-start space-y-3">
                      <Image
                        src={image}
                        alt="Hotel"
                        width={300}
                        height={300}
                        className="object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        onClick={() => handleImageDelete(image)}
                        disabled={imageIsDeleting}
                      >
                        {imageIsDeleting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete Image
                      </Button>
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <FormField
                control={form.control}
                name="roomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-500 font-bold text-sm">
                      Room Price *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        className="bg-indigo-200"
                        type="number"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-500 font-bold text-sm">
                      Bed Count *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        className="bg-indigo-200"
                        type="number"
                        min={0}
                        max={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-500 font-bold text-sm">
                      Guest Count *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        className="bg-indigo-200"
                        type="number"
                        min={0}
                        max={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathRoomCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-500 font-bold text-sm">
                      Bathroom Count *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        className="bg-indigo-200"
                        type="number"
                        min={0}
                        max={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <FormField
                control={form.control}
                name="kingBed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-500 font-bold text-sm">
                      King Bed Count
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="100"
                        {...field}
                        className="bg-indigo-200"
                        type="number"
                        min={0}
                        max={10}
                      />
                    </FormControl>
                    
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="queenBed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-500 font-bold text-sm">
                      Queen Bed Count
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        className="bg-indigo-200"
                        type="number"
                        min={0}
                        max={10}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="pt-4 pb-2">
            {room ? (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                className="max-w-[150px] bg-indigo-700 hover:bg-indigo-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Updating
                  </>
                ) : (
                  <>
                    <PencilLine className="mr-2 h-4 w-4" /> Update
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                className="max-w-[150px] bg-indigo-700 hover:bg-indigo-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" /> Creating
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" /> Create Room
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddRoomForm;
