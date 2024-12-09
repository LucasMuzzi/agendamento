"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "./login/auth/page";
import Cookies from "js-cookie";
import { LoadingScreen } from "@/components/loading";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("info");
    if (token) {
      setIsLoggedIn(true);
      router.push("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isLoggedIn) {
    return null;
  }

  return <LoginPage />;
}
