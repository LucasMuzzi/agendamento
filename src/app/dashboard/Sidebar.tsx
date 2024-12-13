"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginClass } from "../api/services/authServices";
import { SettingsSerivce } from "../api/services/settingsServices";

const loginClass = new LoginClass();
const settings = new SettingsSerivce();

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onMenuClick: () => void;
}

export default function Sidebar({ isMobile, onMenuClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logo, setLogo] = useState("/placeholder.svg?height=50&width=50");
  const pathname = usePathname();

  useEffect(() => {
    const storedState = localStorage.getItem("sidebarOpen");
    if (storedState) {
      setIsOpen(JSON.parse(storedState));
    }

    const fetchLogo = async () => {
      try {
        const imageUrl = await settings.fetchImage();
        console.log("URL da imagem:", imageUrl);
        setLogo(imageUrl);
      } catch (error) {
        console.error("Erro ao buscar o logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  const handleLogout = async () => {
    try {
      await loginClass.logout();
      window.location.href = "/login/auth";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      {isMobile && !isOpen && (
        <Button
  variant="ghost"
  size="icon"
  onClick={handleToggle}
  className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background shadow-md"
>
          <Menu className="h-6 w-6" />
        </Button>
      )}

      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 bg-background text-foreground border-r border-border shadow-md transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative h-screen bg-background text-foreground border-r border-border shadow-md"
        } flex flex-col ${isOpen ? "w-64" : "w-24"}`}
      >
        <div className="p-4 flex flex-col items-center justify-center relative">
          <div
            className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
              isOpen ? "w-16 h-16" : "w-12 h-12"
            }`}
          >
            <div className="relative w-full h-full overflow-hidden bg-muted rounded-full">
              <Image
                src={logo}
                alt="Logo"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
          </div>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className={`absolute top-4 right-0 z-10 h-8 w-8 rounded-full border border-border bg-background p-0 hover:bg-accent hover:text-accent-foreground ${
                isOpen ? "-right-4" : "-right-3"
              }`}
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <nav className="space-y-2 p-2 flex-grow">
          <SidebarLink
            href="/dashboard/home"
            icon={<Home className="w-5 h-5" />}
            isActive={pathname === "/dashboard/home"}
            isExpanded={isOpen}
            onClick={() => {
              onMenuClick();
              if (isMobile) handleToggle();
            }}
          >
            Página inicial
          </SidebarLink>
          <SidebarLink
            href="/dashboard/agendamentos"
            icon={<Menu className="w-5 h-5" />}
            isActive={pathname === "/dashboard/agendamentos"}
            isExpanded={isOpen}
            onClick={() => {
              onMenuClick();
              if (isMobile) handleToggle();
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
              onMenuClick();
              if (isMobile) handleToggle();
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
              onMenuClick();
              if (isMobile) handleToggle();
            }}
          >
            Configurações
          </SidebarLink>
        </nav>
        <div className="p-2">
          <SidebarLink
            href="#"
            icon={<LogOut className="w-5 h-5 text-destructive" />}
            isActive={false}
            isExpanded={isOpen}
            onClick={() => {
              handleLogout();
              onMenuClick();
              if (isMobile) handleToggle();
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Logout
          </SidebarLink>
        </div>
      </aside>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={handleToggle}
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
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
        ${
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }
        ${isExpanded ? "justify-start" : "justify-center"}
        ${className}`}
      onClick={onClick}
    >
      {icon}
      {isExpanded && <span>{children}</span>}
    </Link>
  );
}
