/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhoneIcon as WhatsappIcon, Edit, Trash2 } from "lucide-react";

import { ClienteForm } from "@/components/clientForm";
import { clientService } from "@/app/api/services/clientServices";

type Cliente = {
  id: string;
  nome: string;
  contato: string;
  whatsapp: boolean;
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const ClientService = new clientService();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await ClientService.buscarClientesPorCodUser();

        const fetchedClientes = response.clients.map((cliente) => ({
          id: cliente._id,
          nome: cliente.name,
          contato: cliente.phone,
          whatsapp: cliente.whatsapp,
        }));
        setClientes(fetchedClientes);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  const handleSaveCliente = async (cliente: Omit<Cliente, "id">) => {
    try {
      console.log("Cliente a ser salvo:", cliente); // Log antes da requisição
      const response = await ClientService.registrarCliente({
        name: cliente.nome,
        phone: cliente.contato,
        whatsapp: cliente.whatsapp,
      });
      const newCliente = { ...cliente, id: response.client._id };
      setClientes([...clientes, newCliente]);
      setIsModalOpen(false);
      setCurrentCliente(null);
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  const handleEditCliente = async (cliente: Omit<Cliente, "id">) => {
    if (currentCliente) {
      const updatedCliente = { ...currentCliente, ...cliente };
      setClientes(
        clientes.map((c) => (c.id === updatedCliente.id ? updatedCliente : c))
      );
      setIsModalOpen(false);
      setCurrentCliente(null);
    }
  };

  const handleDeleteCliente = (id: string) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "mt-12" : ""}`}>
      <Card
        className={`${isMobile ? "w-full" : "w-full max-w-[800px]"} mx-auto`}
      >
        <CardHeader>
          <CardTitle>Cadastro de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setCurrentCliente(null);
                    setIsModalOpen(true);
                  }}
                >
                  Cadastrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentCliente
                      ? "Editar Cliente"
                      : "Cadastrar Novo Cliente"}
                  </DialogTitle>
                </DialogHeader>
                <ClienteForm
                  cliente={currentCliente}
                  onSubmit={
                    currentCliente ? handleEditCliente : handleSaveCliente
                  }
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.contato}</TableCell>
                    <TableCell>
                      <a
                        href={`https://wa.me/${
                          cliente.whatsapp ? cliente.contato : ""
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!cliente.whatsapp}
                        >
                          <WhatsappIcon className="h-5 w-5 text-green-500" />
                        </Button>
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentCliente(cliente);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCliente(cliente.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Deletar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
