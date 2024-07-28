"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import message from "@/messages.json";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { RefreshCcw, MoveUpRight } from "lucide-react";

import { ApiResponse, homePageUsers } from "@/types/ApiTypes";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { signIn, signOut } from "next-auth/react";

type messages = {
  title: string;
  content: string;
  received: string;
};

export default function Home() {
  const [usersLoading, setUsersLoading] = useState(false);
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [homepageUsers, setHomePageUsers] = useState<homePageUsers[]>([]);
  const { toast } = useToast();
  useEffect(() => {
    setUsersLoading(true);
    const gettingUsers = async () => {
      try {
        const result = await axios.get<ApiResponse>("/api/homepage-users");
        setHomePageUsers(result.data.users ? result.data.users : []);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: axiosError.response?.data.message as string,
        });
      } finally {
        setUsersLoading(false);
      }
    };

    gettingUsers();
  }, [refreshUsers, toast]);

  const handleRefreshUsers = () => {
    setUsersLoading(true);
    setRefreshUsers((prev) => !prev);
  };
  const all_messages: messages[] = message;
  return (
    <main className="">
      <div className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-800 text-white ">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Start getting unknown notificationZ today, bzzzz
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            You have fun buzzing and we protect your identity
          </p>
        </section>
        <Carousel className="w-full max-w-lg">
          <CarouselContent>
            {all_messages.map((content, index) => (
              <CarouselItem key={index}>
                <div className="p-1 w-full ">
                  <Card>
                    <CardContent className="w-full text-center">
                      <div className="text-3xl font-bold font-sans">
                        {content.title}
                      </div>
                      <div className="text-xl font-semibold">
                        {content.content}
                      </div>
                      <div className="text-lg font-semibold">
                        {content.received}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div className="flex justify-center mt-8">
        <Button onClick={() => handleRefreshUsers()} className="bg-blue-950">
          <RefreshCcw
            className={`w-8 h-8 ${
              usersLoading ? "animate-spin" : "animate-none"
            }`}
          />
        </Button>
      </div>
      {usersLoading ? (
        <div className="sm:grid xl:grid-cols-3 sm:grid-cols-1 gap-x-1 mx-8 mt-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="sm:grid xl:grid-cols-3 sm:grid-cols-1 gap-x-1 bg-gray-100 xl:space-x-8 sm:space-x-0 px-8 items-center mx-8 my-4 rounded-2xl">
          {homepageUsers.map((messages, index) => (
            <div key={index} className=" border-white pr-10 py-3">
              <div className="flex space-x-2">
                <h1 className="text-3xl text-black font-bold">Username:</h1>
                <h1 className="text-2xl text-slate-700 font-semibold">
                  {messages.username}
                </h1>
              </div>
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <p>Message acceptance: </p>
                  <p>{messages.isAcceptingMessage ? "true" : "false"}</p>
                </div>
                <div className="flex">
                  <span className="bg-slate-800 p-1 rounded-sm">
                    <Link
                      href={`/u/${messages.username}`}
                      rel="noopener noreferrer"
                    >
                      <MoveUpRight className="text-slate-100 w-8 h-8 hover:scale-110 hover:animate-pulse hover:delay-100 tranistion ease-in-out" />
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
