/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";

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
  const [isMobile, setIsMobile] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await clientService.getUsers();
        const users = response.users;
        console.log(users);
        setClients(users);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar os clientes.",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
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

    try {
      const response = await clientService.newClient(clientData);

      setClients((prevClients) => [...prevClients, response]);

      setClientData({
        name: "",
        email: "",
        password: "",
        codUser: "",
      });

      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso.",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (client: ClientData) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedClient(null); // Limpa o cliente selecionado ao fechar o diálogo
  };

  const handleEditClick = () => {
    if (selectedClient) {
      setClientData(selectedClient); // Preenche os dados do cliente no formulário de edição
      setIsEditDialogOpen(true); // Abre o diálogo de edição
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setClientData({
      name: "",
      email: "",
      password: "",
      codUser: "",
    });
  };

  // const handleUpdateClient = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (
  //     !clientData.name ||
  //     !clientData.email ||
  //     !clientData.password ||
  //     !clientData.codUser
  //   ) {
  //     toast({
  //       title: "Erro de validação",
  //       description: "Por favor, preencha todos os campos.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(clientData.email)) {
  //     toast({
  //       title: "Erro de validação",
  //       description: "Por favor, insira um email válido.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     const response = await clientService.updateClient(
  //       selectedClient?.id,
  //       clientData
  //     ); // Supondo que você tenha um método para atualizar o cliente
  //     setClients((prevClients) =>
  //       prevClients.map((client) =>
  //         client._id === response.id ? response : client
  //       )
  //     );

  //     toast({
  //       title: "Cliente atualizado",
  //       description: "Os dados do cliente foram atualizados com sucesso.",
  //       duration: 3000,
  //       className: "bg-green-500 text-white",
  //     });

  //     handleEditDialogClose(); // Fecha o diálogo de edição
  //   } catch (error) {
  //     toast({
  //       title: "Erro",
  //       description: "Ocorreu um erro ao atualizar o cliente. Tente novamente.",
  //       variant: "destructive",
  //     });
  //   }
  // };

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
                  name="                  codUser"
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
                    <TableHead>
                      {isMobile ? "Código" : "Código de Usuário"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow
                      key={index}
                      onClick={() => handleRowClick(client)}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <TableCell>
                        {isMobile ? client.name.split(" ")[0] : client.name}
                      </TableCell>
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

      {/* Diálogo para exibir detalhes do cliente */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Nome:</Label>
                <p>{selectedClient.name}</p>
              </div>
              <div>
                <Label>Email:</Label>
                <p>{selectedClient.email}</p>
              </div>
              <div>
                <Label>Código de Usuário:</Label>
                <p>{selectedClient.codUser}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" size="icon" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => {}}>
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Deletar</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={() => {}}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={clientData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={clientData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Senha</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={clientData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-codUser">Código de Usuário</Label>
                <Input
                  id="edit-codUser"
                  name="codUser"
                  value={clientData.codUser}
                  onChange={handleInputChange}
                  placeholder="Informe o código de usuário"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Alterar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
