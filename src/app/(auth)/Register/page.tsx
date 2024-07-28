"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useDebounceValue, useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/SignUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiTypes";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function Register() {
  //Other variables/initiators
  const { toast } = useToast();
  const router = useRouter();

  //States
  const [username, setUsername] = useState("");
  const [usernameAvailMsg, setUsernameAvailMsg] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 500);

  //zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  //Registration process
  useEffect(() => {
    const sendUsernameForChecking = async () => {
      if (username) {
        setCheckingUsername(true);
        try {
          const response = await axios.get(
            `api/username-uniqueness-test?username=${username}`
          );
          setUsernameAvailMsg(response.data.message);
        } catch (error) {
          console.log("error checking username", error);
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameAvailMsg(
            axiosError.response?.data.message as string ??
              "Error checking username availbility"
          );
        } finally {
          setCheckingUsername(false);
        }
      }
    };
    sendUsernameForChecking();
  }, [username]);

  //form submit functionality
  const SubmitFunctionality = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`api/register`, data);
      if (!response) {
        toast({
          title: "Failed to receive response from server",
          variant: "destructive",
        });
      }
      toast({
        title:
          "User registered successfully, redirecting to verification page...",
        variant: "default",
      });
      router.replace(`/verify/${username}`);
      console.log("all processes of registering finished");
    } catch (error) {
      console.error("error signing up", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: "Error registering user",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Now
          </h1>
          <p className="mb-4">Sign up to start chatting anonymous lads!</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(SubmitFunctionality)}
            className="space-y-4"
          >
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {checkingUsername && (
                    <Loader2 className="animate-spin w-4 h-4" />
                  )}
                  <p className={`text-sm ${usernameAvailMsg === "Username is unique" ? "text-green-500":"text-red-500"}`}>{usernameAvailMsg}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex space-x-2">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Registering
                </div>
              ) : (
                "Register"
              )}
            </Button>
            <Button onClick={() => signIn("google")}>login with google</Button>
          </form>
        </Form>
        <div>
          Already a member? <Link href="/sign-in" className="text-blue-500">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
