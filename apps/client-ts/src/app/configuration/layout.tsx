'use client'
import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useStytchSession } from "@stytch/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import config from "@/lib/config";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session } = useStytchSession();
  const router = useRouter();
  // useEffect(() => {
  //   if(config.DISTRIBUTION !== "selfhost" && !session){
  //     router.replace("/b2c/login");
  //   }
  // }, [session, router]);
  
  return (
    <>
        <RootLayout/>
        {children}
    </>
  );
}
