"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

export default function Sidebar({
  isOpen,
  onToggle,
  isMobile,
  onMenuClick,
}: SidebarProps) {
  const [logo, setLogo] = useState("/placeholder.svg?height=50&width=50");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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

  const handleLogout = async () => {
    try {
      await loginClass.logout();
      router.push("/login/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      {isMobile && !isOpen && (
        <div
          className="fixed top-0 left-0 w-full bg-background text-foreground shadow-md z-50 h-12 flex items-center px-4"
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

      <aside
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full z-40 bg-background text-foreground border-r border-border shadow-md transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              } pb-16`
            : "relative h-screen bg-background text-foreground border-r border-border shadow-md"
        } flex flex-col ${isOpen ? "w-64" : "w-20"}`}
        style={isMobile ? { zIndex: 99, marginTop: "3rem" } : {}}
      >
        <div className="p-4 flex flex-col items-center justify-center relative">
          <div
            className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
              isOpen ? "w-12 h-12" : "w-14 h-14"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`rounded-full p-2 mt-2 ${
              isOpen ? "absolute right-2 top-2" : ""
            }`}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="space-y-2 p-2">
          <SidebarLink
            href="/"
            icon={<Home className="w-5 h-5" />}
            isActive={pathname === "/"}
            isExpanded={isOpen}
            onClick={() => {
              onMenuClick();
              if (isMobile) onToggle(); // Fecha o menu se estiver em mobile
            }}
          >
            Pagina inicial
          </SidebarLink>
          <SidebarLink
            href="/dashboard/agendamentos"
            icon={<Menu className="w-5 h-5" />}
            isActive={pathname === "/dashboard/agendamentos"}
            isExpanded={isOpen}
            onClick={() => {
              onMenuClick();
              if (isMobile) onToggle(); 
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
              if (isMobile) onToggle();
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
              if (isMobile) onToggle();
            }}
          >
            Configurações
          </SidebarLink>
          <SidebarLink
            href="#"
            icon={<LogOut className="w-5 h-5 text-destructive" />}
            isActive={false}
            isExpanded={isOpen}
            onClick={() => {
              handleLogout();
              onMenuClick();
              if (isMobile) onToggle();
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Logout
          </SidebarLink>
        </nav>
      </aside>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
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
