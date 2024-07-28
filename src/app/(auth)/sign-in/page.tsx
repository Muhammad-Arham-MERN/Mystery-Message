"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignIn() {
  //Session

  const { data: session } = useSession();

  //Other variables/initiators
  const { toast } = useToast();
  const router = useRouter();

  //States
  const [isSubmitting, setIsSubmitting] = useState(false);

  //zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  //form submit functionality
  const SubmitFunctionality = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    console.log(data.identifier, " | ", data.password);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast({
          title: "Login Failed",
          description: "Incorrect username or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    }

    if (result?.url) {
      toast({
        title: "Success",
        description: result.error,
      });
      router.replace("/dashboard");
    }
  };

  if (session) {
    return (
      <div>
        <h1>You are already logged in</h1>
        <Link href="/dashboard">
          <Button>Go To Dashboard</Button>
        </Link>
        <Button onClick={() => signOut()}>sign out</Button>
      </div>
    );
  }

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
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Email/Username" {...field} />
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
                  Logging in
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
            <Button className="bg-blue-500" onClick={() => signIn("google")}>
              
              <p>login with google</p>
            </Button>
        </Form>
        <div>
          Not a member yet?{" "}
          <Link href="/Register" className="text-blue-500">
            register
          </Link>
        </div>
      </div>
    </div>
  );
}
