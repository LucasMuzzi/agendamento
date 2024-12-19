"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { newClienteService } from "@/app/api/services/newClientService";

interface ClientData {
  name: string;
  email: string;
  password: string;
  codUser: string;
}

export default function ClientManagement() {
  const clientService = new newClienteService();
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    email: "",
    password: "",
    codUser: "",
  });
  const [clients, setClients] = useState<ClientData[]>([]);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false); // Estado para verificar se está no mobile

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Chama a função uma vez para definir o estado inicial

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !clientData.name ||
      !clientData.email ||
      !clientData.password ||
      !clientData.codUser
    ) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    console.log("Sending data to API:", clientData);

    try {
      // Chama a função newClient do serviço
      const response = await clientService.newClient(clientData);

      // Adiciona o cliente à lista de clientes
      setClients((prevClients) => [...prevClients, response]);

      // Limpa os campos do formulário
      setClientData({
        name: "",
        email: "",
        password: "",
        codUser: "",
      });

      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <Card
          className={cn(
            "w-full lg:w-1/2 mt-10 lg:mt-0 flex flex-col",
            isMobile ? "min-h-[400px]" : "min-h-[600px]"
          )}
        >
          <CardHeader>
            <CardTitle>Cadastro de Cliente</CardTitle>
            <CardDescription>
              Adicione um novo cliente ao sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 flex-grow">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={clientData.name}
                  onChange={handleInputChange}
                  placeholder="Nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={clientData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={clientData.password}
                  onChange={handleInputChange}
                  placeholder="********"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codUser">Código de Usuário</Label>
                <Input
                  id="codUser"
                  name="codUser"
                  value={clientData.codUser}
                  onChange={handleInputChange}
                  placeholder="Informe o código de usuário"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full lg:w-1/2 lg:mt-0 flex flex-col min-h-[350px]">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Clientes cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <ScrollArea className="flex-grow w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Código de Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.codUser}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
