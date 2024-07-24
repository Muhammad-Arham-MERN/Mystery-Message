"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { User } from "next-auth";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: Session } = useSession();
  const user: User = Session?.user as User;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex md:flex-row justify-between items-center">
        <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
          Unknown-NotificationZ
        </Link>
        {Session ? (
          <div className="lg:space-x-6 sm:space-x-0 flex items-center">
            <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span>
            <div className="md:space-x-4 space-x-0 "> 
              <Button
                className="w-full md:w-auto bg-slate-100 text-black lg:mb-0 sm:mb-2"
                variant="outline"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
              <Link href="/dashboard">
                <Button
                  className="w-full md:w-auto bg-slate-100 text-black"
                  variant={"outline"}
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button
              className="w-full md:w-auto bg-slate-100 text-black"
              variant={"outline"}
            >
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
