"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { LoadingScreen } from "@/components/loading";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleMenuClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          onMenuClick={handleMenuClick}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main
            className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
              isMobile && isSidebarOpen ? "opacity-50" : ""
            }`}
          >
            <div className={`${isMobile ? "overflow-hidden" : ""}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
