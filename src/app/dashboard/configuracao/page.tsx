/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ServiceType,
  SettingsSerivce,
} from "@/app/api/services/settingsServices";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Configuracoes() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [servicoNovo, setServicoNovo] = useState("");
  const [servicoRemover, setServicoRemover] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLogoSaved, setIsLogoSaved] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings] = useState(new SettingsSerivce());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setIsLogoSaved(false);
    }
  };

  const handleAddServico = async () => {
    if (servicoNovo.trim() !== "") {
      try {
        await settings.createServiceType({
          nome: servicoNovo.trim(),
        });
        setServicoNovo("");
        toast({
          title: "Sucesso",
          description: "Novo serviço adicionado",
          duration: 3000,
          className: "bg-green-500 text-white",
        });

        window.location.reload();
      } catch (error) {
        console.error("Erro ao adicionar serviço:", error);
        toast({
          title: "Erro",
          description: "Falha ao adicionar novo serviço",
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveServico = async () => {
    if (servicoRemover.trim() !== "") {
      const serviceToRemove = serviceTypes.find(
        (service) => service.nome === servicoRemover.trim()
      );

      if (serviceToRemove) {
        try {
          await settings.removeServiceType(serviceToRemove._id);
          setServicoRemover("");
          setFilteredServices([]);
          setServiceTypes((prev) =>
            prev.filter((type) => type._id !== serviceToRemove._id)
          );
          toast({
            title: "Sucesso",
            description: "Serviço removido com sucesso",
            duration: 3000,
            className: "bg-green-500 text-white",
          });

          window.location.reload();
        } catch (error) {
          console.error("Erro ao remover serviço:", error);
          toast({
            title: "Erro",
            description: "Falha ao remover serviço",
            duration: 3000,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Serviço não encontrado",
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadLogo = async () => {
    if (logoFile) {
      try {
        const response = await settings.uploadFile(logoFile);
        console.log("Logo enviado com sucesso:", response);
        setIsLogoSaved(true);
        toast({
          title: "Sucesso",
          description: "Logo enviado com sucesso",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        console.error(
          "Erro ao enviar logo:",
          (error as AxiosError)?.response?.data || error
        );
        toast({
          title: "Erro",
          description: "Falha ao enviar logo",
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  };

  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServicoNovo(e.target.value);
  };

  const handleServicoRemoverChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setServicoRemover(value);

    const filtered: any = serviceTypes.filter((service) =>
      service.nome.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleSelectService = (serviceName: string) => {
    setServicoRemover(serviceName);
  };

  const handleSaveLogo = async () => {
    if (logoFile) {
      try {
        await handleUploadLogo();
        setIsLogoSaved(true);
        toast({
          title: "Sucesso",
          description: "Logo salvo com sucesso",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        console.error("Erro ao salvar logo:", error);
        toast({
          title: "Erro",
          description: "Falha ao salvar logo",
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveOperatingHours = async () => {
    try {
      await settings.createSchedule(startTime, endTime, interval);
      toast({
        title: "Sucesso",
        description: "Horários de funcionamento salvos com sucesso",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Erro ao salvar horários de funcionamento:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar horários de funcionamento",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast({
      title: "Tema alterado",
      description: `O tema foi alterado para ${value}`,
      duration: 3000,
      className: "bg-green-500 text-white",
    });
  };

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const types: any = await settings.fetchServiceTypes();
        setServiceTypes(types);
        setFilteredServices(types);
      } catch (error) {
        console.error("Erro ao buscar tipos de serviço:", error);
      }
    };

    fetchServiceTypes();
  }, [settings]);

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "mt-12" : ""}`}>
      <Card
        className={`${isMobile ? "w-full" : "w-full max-w-[800px]"} mx-auto`}
      >
        <CardHeader>
          <CardTitle>Configurações do Site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Logo do Site</Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar Logo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              {logoPreview && !isLogoSaved && (
                <div className="relative w-16 h-16 border border-gray-300 rounded">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              )}
              <Button
                onClick={handleSaveLogo}
                disabled={!logoFile || isLogoSaved}
              >
                Salvar Logo
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="novo-servico">Adicionar Tipo de Serviço</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                id="novo-servico"
                value={servicoNovo}
                onChange={handleServicoChange}
                placeholder="Novo tipo de serviço"
              />
              <Button type="button" onClick={handleAddServico}>
                Adicionar
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remover-servico">Remover Tipo de Serviço</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                id="remover-servico"
                value={servicoRemover}
                onChange={handleServicoRemoverChange}
                placeholder="Nome do serviço a remover"
              />
              <Button type="button" onClick={handleRemoveServico}>
                Remover
              </Button>
            </div>
            <div className="mt-2 max-h-[150px] overflow-y-auto border rounded-md p-2">
              <ul>
                {filteredServices.map((service: any) => (
                  <li
                    key={service._id}
                    onClick={() => handleSelectService(service.nome)}
                    className="py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded px-2 transition-colors"
                  >
                    {service.nome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Horário de Início</Label>
                <Input
                  type="time"
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Ex: 08:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Horário de Fim</Label>
                <Input
                  type="time"
                  id="end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Ex: 18:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo (minutos)</Label>
                <Input
                  type="number"
                  id="interval"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  min="1"
                  step="1"
                  placeholder="Ex: 30"
                />
              </div>
            </div>
            <Button onClick={handleSaveOperatingHours}>
              Salvar Horários de Funcionamento
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-select">Tema do Site</Label>
            <Select onValueChange={handleThemeChange} defaultValue={theme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
