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
import { useTheme } from "next-themes";
import { Eye, EyeOff } from "lucide-react";

export default function Configuracoes() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [servicoNovo, setServicoNovo] = useState("");
  const [servicoRemover, setServicoRemover] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState("");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings] = useState(new SettingsSerivce());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <div
      className={`container mx-auto p-4 overflow-hidden ${
        isMobile ? "mt-12" : ""
      }`}
    >
      <Card
        className={`${
          isMobile
            ? "w-full h-[calc(90vh-2rem)]"
            : "w-full max-w-[800px] h-[calc(100vh-2rem)]"
        } mx-auto overflow-auto`}
      >
        <CardHeader>
          <CardTitle>Configurações do Site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Button
              type="button"
              onClick={toggleListVisibility}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isListVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span>Ver serviços</span>
            </Button>
            {isListVisible && (
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
            )}
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
