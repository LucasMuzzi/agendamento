"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings } from "@/app/api/services/settingsServices";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState("");
  const [servicoNovo, setServicoNovo] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState("");

  const settings = new Settings();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };

  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServicoNovo(e.target.value);
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

  const handleTimeRangeSubmit = async () => {
    if (startTime && endTime && interval) {
      try {
        const response = await settings.createSchedule(
          startTime,
          endTime,
          interval
        );
        console.log("Horário criado:", response);
      } catch (error) {
        console.error("Erro ao criar horário:", error);
        throw error;
      }
    } else {
      throw new Error("Todos os campos de horário devem ser preenchidos.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleTimeRangeSubmit();
      toast({
        title: "Sucesso",
        description: "Configurações salvas",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:ml-7 py-20">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configurações do Site</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo-url">URL do Logo</Label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  id="logo-url"
                  value={logoUrl}
                  onChange={handleLogoChange}
                  placeholder="https://exemplo.com/seu-logo.png"
                />
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
            <Button type="submit" className="w-full">
              Salvar Configurações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
