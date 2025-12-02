"use client";

import localFont from "next/font/local";
import "./globals.css";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Header from './components/Header';

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (pathname === "/login" || pathname === "/") {
          router.push("/inicio");
        }
      } else {
        if (pathname !== "/login" && pathname !== "/register") {
          router.push("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const showHeader = pathname !== "/login" && pathname !== "/register";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased gradient-anim min-h-screen`}> 
        {showHeader && <Header />}
        <main className="max-w-xl mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}