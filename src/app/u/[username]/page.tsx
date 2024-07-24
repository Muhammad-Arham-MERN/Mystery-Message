"use client";

import { Button } from "@/components/ui/button";
import { ApiResponse } from "@/types/ApiTypes";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { sendMessageSchema } from "@/schemas/sendMessageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";


export default function MessageSendUser({ params }: { params: { username: string } }) {
  const [suggestMessages,setSuggestMessages] = useState('')


  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });
  const session = useSession();
  const [canSend, setCanSend] = useState(false);
  useEffect(() => {
    const functiodsad = async () => {
      try {
        const axiosResult = await axios.get<ApiResponse>(
          `/api/check-username?username=${params.username}`
        );
        if (axiosResult.data.message === false) {
          setCanSend(false);
        } else {
          setCanSend(true);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        if (
          axiosError.response?.data.message === false ||
          axiosError.response?.status === 404
        ) {
          setCanSend(false);
        } else {
          setCanSend(false);
        }
      }
    };
    functiodsad();
  }, [session, params.username]);

  const handleMessageSubmit = async (data: { message: string }) => {
    try {
      const axiosResponse = await axios.post("/api/send-messages", {
        username: params.username,
        content: data.message,
      });
      if (!axiosResponse) {
        toast({
          title: "Sorry we could not send message",
          variant: "destructive",
        });
        
      }
      toast({
        title: "Message sent successfully",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast ({
        title: axiosError.response?.data.message as string,
        variant: "destructive"
      })
    }
  };

  if (!session || !session.data?.user) {
    return (
      <div className="text-center mt-12">
        <h1 className="font-bold text-2xl">Sorry you are not Signed in</h1>
        <Link href="/sign-in">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  } else {
    if (canSend) {
      return (
        <div className="w-full grid grid-cols-1 justify-items-center p-10">
          <h1 className="text-4xl font-bold my-6">
            Communicate With Anonimies!
          </h1>
          <div className="flex w-2/3 ">
            <h1 className="text-lg font-semibold">
              Send message to @{params.username}
            </h1>
          </div>
          <div className="w-full">
            <Form {...form}>
              <form
                className="text-center"
                onSubmit={form.handleSubmit(handleMessageSubmit)}
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex justify-center">
                      <Textarea
                        placeholder="send message here..."
                        className="w-2/3 h-40  focus-visible:border-black"
                        {...field}
                      />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-5 w-fit">
                  Submit Message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center mt-12">
          <h1 className="font-bold text-2xl">Sorry user not available</h1>
        </div>
      );
    }
  }
}
