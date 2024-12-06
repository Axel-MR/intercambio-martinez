"use client";

import localFont from "next/font/local";
import "./globals.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (window.location.pathname === "/login" || window.location.pathname === "/") {
          router.push("/inicio");
        }
      } else {
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          router.push("/login");
        }
      }
    });
  
    return () => unsubscribe();
  }, [router]);
  

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}