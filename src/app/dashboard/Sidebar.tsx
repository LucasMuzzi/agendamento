"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginClass } from "../api/services/authServices";

const loginClass = new LoginClass();

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onMenuClick: () => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  isMobile,
  onMenuClick,
}: SidebarProps) {
  const [logo] = useState("/placeholder.svg?height=50&width=50");
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await loginClass.logout();
      router.push("/login/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleMenuClick = () => {
    if (isMobile) onToggle();
    onMenuClick(); 
  };

  return (
    <>
      {/* Div fixa no topo para o botão de menu */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 w-full bg-white shadow-md z-50 h-12 flex items-center px-4"
          style={{ zIndex: 100 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="p-2 rounded-full"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Menu lateral */}
      <aside
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full z-40 bg-white shadow-md transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative h-screen bg-white shadow-md"
        } flex flex-col ${isOpen ? "w-64" : "w-16"}`}
        style={isMobile ? { zIndex: 99, marginTop: "3rem" } : {}}
      >
        <div className="p-4 flex items-center justify-between">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? "w-auto" : "w-0"
            }`}
          >
            <Image src={logo} alt="Logo" width={50} height={50} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="rounded-full p-2"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-2 p-2">
          <SidebarLink
            href="/dashboard/agendamentos"
            icon={<Menu className="w-5 h-5" />}
            isActive={pathname === "/dashboard/agendamentos"}
            isExpanded={isOpen}
            onClick={() => {
              handleMenuClick(); // Chama a função de clique do menu
              // Aqui você pode adicionar lógica adicional, se necessário
            }}
          >
            Agendamentos
          </SidebarLink>
          <SidebarLink
            href="/dashboard/clientes"
            icon={<Users className="w-5 h-5" />}
            isActive={pathname === "/dashboard/clientes"}
            isExpanded={isOpen}
            onClick={() => {
              handleMenuClick(); // Chama a função de clique do menu
            }}
          >
            Cadastro de Clientes
          </SidebarLink>
          <SidebarLink
            href="/dashboard/configuracao"
            icon={<Settings className="w-5 h-5" />}
            isActive={pathname === "/dashboard/configuracao"}
            isExpanded={isOpen}
            onClick={() => {
              handleMenuClick(); // Chama a função de clique do menu
            }}
          >
            Configurações
          </SidebarLink>
        </nav>
        <div className="mt-auto p-4">
          <button
            onClick={() => {
              handleLogout();
              handleMenuClick();
            }}
            className={`flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors w-full
                ${isOpen ? "justify-start" : "justify-center"}`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Espaço para o conteúdo principal */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}

function SidebarLink({
  href,
  icon,
  children,
  isActive,
  isExpanded,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
        ${
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }
        ${isExpanded ? "justify-start" : "justify-center"}`}
      onClick={onClick}
    >
      {icon}
      {isExpanded && <span>{children}</span>}
    </Link>
  );
}
