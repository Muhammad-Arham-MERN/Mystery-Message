"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import axios from "axios";
import { Message } from "@/model/User";
import { useToast } from "./ui/use-toast";
import { title } from "process";
import { ApiResponse } from "@/types/ApiTypes";

type MessageCardProps = {
    message: Message ;
    onMessageDelete: (messageId: string) => void;
  };

function MessageCard({message, onMessageDelete}: MessageCardProps) {
    const {toast} = useToast()
    const handleMessageDelete = async ()=>{
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
        toast({
            title: response.data.message as string
        })
        onMessageDelete(message._id as string)
    }
  return (
    <div>
      <Card>
        <CardContent>
          <p>{message.content}</p>
        </CardContent>
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><X className="w-5 h-5"/></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMessageDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}

export default MessageCard;
