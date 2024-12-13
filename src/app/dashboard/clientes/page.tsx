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
import { PhoneIcon as WhatsappIcon, Edit, Trash2, X } from 'lucide-react';
import { ClienteForm } from "@/components/clientForm";
import { ClienteDetalhesModal } from "@/components/ClienteDetalhesModal";
import { clientService } from "@/app/api/services/clientServices";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { toast } = useToast();
  const ClientService = new clientService();

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(filterText.toLowerCase())
  );

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
  }, [ClientService]);

  const handleSaveCliente = async (cliente: Omit<Cliente, "id">) => {
    try {
      const response = await ClientService.registrarCliente({
        name: cliente.nome,
        phone: cliente.contato,
        whatsapp: cliente.whatsapp,
      });

      const newCliente = { ...cliente, id: response.client._id };
      setClientes([...clientes, newCliente]);
      setIsModalOpen(false);
      setCurrentCliente(null);
      toast({
        title: "Sucesso",
        description: "Novo cliente cadastrado",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar cliente",
        duration: 3000,
        variant: "destructive",
      });
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  const handleEditCliente = async (cliente: Omit<Cliente, "id">) => {
    if (currentCliente) {
      try {
        const updatedCliente = { ...currentCliente, ...cliente };
        await ClientService.atualizarCliente(currentCliente.id, {
          name: updatedCliente.nome,
          phone: updatedCliente.contato,
          whatsapp: updatedCliente.whatsapp,
        });

        setClientes((prevClientes) =>
          prevClientes.map((c) =>
            c.id === currentCliente.id ? { ...c, ...updatedCliente } : c
          )
        );
        setIsModalOpen(false);
        setCurrentCliente(null);
        toast({
          title: "Sucesso",
          description: "Edição concluída",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao editar cliente",
          duration: 3000,
          variant: "destructive",
        });
        console.error("Erro ao atualizar cliente:", error);
      }
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await ClientService.excluirCliente(id);
      setClientes(clientes.filter((c) => c.id !== id));
      toast({
        title: "Sucesso",
        description: "Cliente deletado",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao deletar cliente",
        duration: 3000,
        variant: "destructive",
      });
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const handleRowClick = (cliente: Cliente) => {
    if (isMobile) {
      setCurrentCliente(cliente);
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "mt-12" : ""}`}>
      <Card
        className={`${
          isMobile
            ? "w-full h-[calc(100vh-4rem)]"
            : "w-full max-w-[800px] h-[calc(100vh-2rem)]"
        } mx-auto flex flex-col`}
      >
        <CardHeader>
          <CardTitle>Cadastro de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
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
          <div className="mb-4 relative">
            <Input
              type="text"
              placeholder="Filtrar clientes..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pr-8"
            />
            {filterText && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setFilterText('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  {!isMobile && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    onClick={() => handleRowClick(cliente)}
                    className={isMobile ? "cursor-pointer" : ""}
                  >
                    <TableCell>
                      {isMobile ? cliente.nome.split(" ")[0] : cliente.nome}
                    </TableCell>
                    <TableCell>{cliente.contato}</TableCell>
                    <TableCell>
                      {cliente.whatsapp ? (
                        <a
                          href={`https://wa.me/${cliente.contato}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (isMobile) e.stopPropagation();
                          }}
                        >
                          <Button variant="ghost" size="icon" className="ml-5">
                            <WhatsappIcon className="h-5 w-5 text-green-500" />
                          </Button>
                        </a>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-5"
                          disabled
                        >
                          <X className="h-5 w-5 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                    {!isMobile && (
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
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ClienteDetalhesModal
        cliente={currentCliente}
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        onEdit={() => {
          setIsModalOpen(true);
          setIsDetailsModalOpen(false);
        }}
        onDelete={() => {
          if (currentCliente) {
            handleDeleteCliente(currentCliente.id);
            setIsDetailsModalOpen(false);
          }
        }}
      />
    </div>
  );
}

