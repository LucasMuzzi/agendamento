"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings } from "@/app/api/services/settingsServices";

export default function Configuracoes() {
  const [logoUrl, setLogoUrl] = useState("");
  const [servicoNovo, setServicoNovo] = useState("");
  const [servicos, setServicos] = useState<string[]>([]); // Estado para armazenar os serviços

  const settings = new Settings();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value);
  };

  const handleAddUrl = () => {
    console.log("Logo URL saved:", logoUrl);
  };

  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServicoNovo(e.target.value);
  };

  const handleAddServico = async () => {
    if (servicoNovo.trim() !== "") {
      try {
        // Chama a função para criar o tipo de serviço na API
        const response = await settings.createServiceType({
          nome: servicoNovo.trim(),
        });

        // Adiciona o serviço retornado à lista local
        setServicos((prev) => [...prev, response.nome]); // Adiciona o novo serviço ao array de serviços

        // Limpa o campo de entrada
        setServicoNovo("");
      } catch (error) {
        console.error("Erro ao adicionar serviço:", error);
        // Aqui você pode exibir uma mensagem de erro para o usuário
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:ml-7 py-20">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Configurações do Site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Button onClick={handleAddUrl}>Adicionar</Button>
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
              <Button onClick={handleAddServico}>Adicionar</Button>
            </div>
          </div>
          {servicos.length > 0 && (
            <div className="space-y-2">
              <Label>Tipos de Serviço Cadastrados</Label>
              <ul className="list-disc pl-5">
                {servicos.map((servico, index) => (
                  <li key={index}>{servico}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
