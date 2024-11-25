"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { LoadingScreen } from "@/components/loading"; // Certifique-se de que o caminho esteja correto

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

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

  // Função para simular o carregamento (remova isso e use um método real de carregamento)
  const handleMenuClick = () => {
    setIsLoading(true); // Ativa o estado de carregamento
    setTimeout(() => {
      setIsLoading(false); // Desativa o estado de carregamento após 2 segundos (simulação)
    }, 1000); // Ajuste conforme necessário
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden ">
      {isLoading && <LoadingScreen />} {/* Mostra o loading se isLoading for true */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        onMenuClick={handleMenuClick} // Passa a função de clique do menu
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
  );
}