"use client"

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Dashboard() {
  // states
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string>("");

  // other variables
  const { toast } = useToast();
  const { data: session } = useSession();

  // form variables
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  // handling delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  // handle the switch to accept message or not
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "error receiving message acceptance status",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  // handle fetch messages to user dashboard
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>("/api/show-messages");
        setMessages(response.data.messages || []);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error displaying messages",
          description: axiosError.response?.data.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setMessages, setIsLoading, toast]
  );

  // run fetchMessage() and fetchAcceptMessage() functions
  useEffect(() => {
    fetchAcceptMessages();
    fetchMessages();
  }, [setValue, fetchAcceptMessages, fetchMessages]);

  // handle change switch
  const handleSwitchChange = async () => {
    try {
      await axios.post<ApiResponse>("/api/accept-messages", {
        messageAcceptOrNot: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: `Message acceptance status updated to: ${!acceptMessages}`,
      });
    } catch (error) {
      const axiosErrorResponse = error as AxiosError<ApiResponse>;
      toast({
        title: axiosErrorResponse.response?.data.message as string,
        variant: "destructive",
      });
    }
  };

  // handle copy to clipboard
  useEffect(() => {
    if (session?.user.username) {
      const username = session.user.username;
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
  }, [session]);

  const copyToClipboard = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "URL Copied!",
        description: "Profile URL has been copied to clipboard.",
      });
    }
  };

  // handle user response if no session available
  if (!session || !session.user) {
    return (
      <div>
        <p>Sorry you are not signed in</p>
        <Link href="/sign-in">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl overflow-hidden">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}
