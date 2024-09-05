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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { UploadButton } from "../uploadthing";
import { useToast } from "../ui/use-toast";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  Eye,
  Loader2,
  Pencil,
  PencilLine,
  Plus,
  RocketIcon,
  Trash,
  XCircle,
} from "lucide-react";
import axios from "axios";
import useLocation from "@/hooks/useLocation";
import { ICity, IState } from "country-state-city";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import AddRoomForm from "../room/AddRoomForm";
import RoomCard from "../room/RoomCard";
import { Separator } from "@/components/ui/separator"

interface AddHotelFormProps {
  hotel: HotelWithRooms | null;
}

export type HotelWithRooms = Hotel & {
  rooms: Room[];
};

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" }),
  image: z.string().min(1, { message: "Image is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().min(2, { message: "State is required" }),
  city: z.string().min(2, { message: "City is required" }),
  address: z.string().min(10, { message: "Address is required" }),
  locationDescription: z
    .string()
    .min(10, { message: "Location Description is required" }),
  gym: z.boolean().optional(),
  spa: z.boolean().optional(),
  bar: z.boolean().optional(),
  laundry: z.boolean().optional(),
  pool: z.boolean().optional(),
  breakfast: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
});

export const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
  const [image, setImage] = useState<string | undefined>(hotel?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState(false);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHotelDeleting, setIsHotelDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    getAllCountries,
    getCountryByCode,
    getStateByCode,
    getCountryStates,
    getStateCities,
  } = useLocation();
  const countries = getAllCountries();

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: hotel || {
      title: "",
      description: "",
      image: "",
      country: "",
      state: "",
      city: "",
      address: "",
      locationDescription: "",
      gym: false,
      spa: false,
      bar: false,
      laundry: false,
      pool: false,
      breakfast: false,
      freeWifi: false,
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

  useEffect(() => {
    const selectedCountry = form.watch("country");
    const countryStates = getCountryStates(selectedCountry);
    if (countryStates) {
      setStates(countryStates);
    }
  }, [form.watch("country")]);

  useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedState = form.watch("state");
    const stateCities = getStateCities(selectedCountry, selectedState);
    if (stateCities) {
      setCities(stateCities);
    }
  }, [form.watch("country"), form.watch("state")]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (hotel) {
      // Update Hotel
      axios
        .patch(`/api/hotel/${hotel.id}`, values)
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Hotel Updated",
          });
          router.push(`/hotel/${res.data.id}`);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log("ERROR at /api/hotel:id PATCH: ", error);
          toast({
            variant: "destructive",
            description: "ERROR - Hotel Not Updated",
          });
          setIsLoading(false);
        });
    } else {
      // Create Hotel
      axios
        .post("/api/hotel", values)
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Hotel Created",
          });
          router.push(`/hotel/${res.data.id}`);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log("ERROR at /api/hotel POST: ", error);
          toast({
            variant: "destructive",
            description: "ERROR - Hotel Not Created",
          });
          setIsLoading(false);
        });
    }
  }

  const handleDeleteHotel = async (hotel: HotelWithRooms) => {
    setIsHotelDeleting(true);
    const getImageKey = (src: string) =>
      src.substring(src.lastIndexOf("/") + 1);

    try {
      const imageKey = getImageKey(hotel.image);
      await axios.post("/api/uploadthing/delete", { imageKey });
      await axios.delete(`/api/hotel/${hotel.id}`);

      setIsHotelDeleting(false);
      toast({
        variant: "success",
        description: "🎉 Hotel Deleted",
      });
      router.push("/hotel/new");
    } catch (error) {
      setIsHotelDeleting(false);
      console.log(error);
      toast({
        variant: "destructive",
        description: "Hotel cannot be deleted, try again later.",
      });
    }
  };

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

  const handleDialogueOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
        <h3 className="mt-8 font-bold text-indigo-500 text-3xl md:text-5xl">
          {hotel ? "Update your hotel" : "Describe your hotel"}
        </h3>
        <div className="flex flex-col md:flex-row gap-6 bg-indigo-500 p-5 rounded-md shadow-md">
          <div className="flex-1 flex flex-col gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel className="text-white font-bold text-lg">
                    Hotel Title *
                  </FormLabel>
                  <FormDescription className="text-gray-300 text-md">
                    Provide your hotel name
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Beach Hotel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel className="text-white font-bold text-lg ">
                    Hotel Description *
                  </FormLabel>
                  <FormDescription className="text-gray-300 text-md">
                    Provide your hotel description
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Beach Hotel with the best view in the city..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8">
              <FormLabel className="text-white font-bold text-lg ">
                Choose Amenities
              </FormLabel>
              <FormDescription className="text-gray-300 text-md">
                Select the amenities your hotel offers..
              </FormDescription>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="gym"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Gym</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spa"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Spa</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bar"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Bar</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="laundry"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Laundry</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pool"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Pool</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breakfast"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-end space-x-3 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Breakfast</FormLabel>
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
                          className="bg-white border-white"
                        />
                      </FormControl>
                      <FormLabel className="text-white">Free Wifi</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6 mt-3">
            <div className="w-full space-y-3">
              <h2 className="text-white font-bold text-lg">Upload Image</h2>
              <FormLabel className="text-white font-bold text-sm">
                Select a cover photo for your hotel *
              </FormLabel>
              <div className="flex flex-row space-x-3 w-full h-full">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="flex-1 w-full h-full">
                      <FormControl>
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
              </div>
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold text-sm">
                    Select a Country *
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem
                            key={country.isoCode}
                            value={country.isoCode}
                          >
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold text-sm">
                    Select a State *
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                      }}
                      defaultValue={field.value}
                      disabled={states.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold text-sm">
                    Select a City *
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e);
                      }}
                      defaultValue={field.value}
                      disabled={cities.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a City" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold text-sm">
                    Address *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Springfield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold text-sm">
                    Location Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Located in the heart of the city with easy access to..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hotel && !hotel?.rooms.length && (
              <Alert className="bg-indigo-500 text-white">
                <RocketIcon className="h-4 w-4 stroke-white" />
                <AlertTitle className="font-bold">One last step!</AlertTitle>
                <AlertDescription className="mt-2 font-light">
                  Your hotel was created successfully🔥
                  <div className="">
                    Please add rooms to your hotel to complete your hotel setup.
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between gap-2 flex-wrap">
              {hotel && (
                <Button
                  onClick={() => handleDeleteHotel(hotel)}
                  variant="ghost"
                  type="button"
                  className="max-w-[150px] text-white "
                  disabled={isHotelDeleting || isLoading}
                >
                  {isHotelDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4" /> Deleting
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}

              {hotel && (
                <Button
                  onClick={() => router.push(`/hotel-details/${hotel.id}`)}
                  type="button"
                  variant="outline"
                  className=""
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              )}

              {hotel && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="max-w-[150px]"
                    >
                      {" "}
                      <Plus className="mr-2 h-4 w-4" /> Add Rooms
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[900px] w-[90%] rounded-md">
                    <DialogHeader className="px-2">
                      <DialogTitle>Add Rooms</DialogTitle>
                      <DialogDescription>
                        Add details about a room in your hotel
                      </DialogDescription>
                    </DialogHeader>
                    <AddRoomForm
                      hotel={hotel}
                      handleDialogueOpen={handleDialogueOpen}
                    />
                  </DialogContent>
                </Dialog>
              )}

              {hotel ? (
                <Button
                  type="submit"
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
                  type="submit"
                  className="max-w-[150px] bg-indigo-700 hover:bg-indigo-900"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4" /> Creating
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" /> Create Hotel
                    </>
                  )}
                </Button>
              )}
            </div>
            {hotel && !!hotel.rooms.length && (
              <div>
                <Separator />
                <h3 className="font-bold text-xl text-white mt-7">
                  Hotel Rooms
                </h3>
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-5">
                  {hotel.rooms.map((room) => {
                    return <RoomCard key={room.id} hotel={hotel} room={room} />;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
export default AddHotelForm;
