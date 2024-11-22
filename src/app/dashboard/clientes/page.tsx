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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhoneIcon as WhatsappIcon, Edit, Trash2 } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  contato: string;
  whatsapp: string;
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: "1",
      nome: "João Silva",
      contato: "11999999999",
      whatsapp: "11999999999",
    },
    {
      id: "2",
      nome: "Maria Santos",
      contato: "11988888888",
      whatsapp: "11988888888",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddCliente = (cliente: Omit<Cliente, "id">) => {
    const newCliente = { ...cliente, id: Date.now().toString() };
    setClientes([...clientes, newCliente]);
    setIsModalOpen(false);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClientes(clientes.map((c) => (c.id === cliente.id ? cliente : c)));
    setIsModalOpen(false);
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
                <Button onClick={() => setCurrentCliente(null)}>
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
                    currentCliente ? handleEditCliente : handleAddCliente
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
                        href={`https://wa.me/${cliente.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <WhatsappIcon className="h-5 w-5 text-green-500" />
                        </Button>
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentCliente(cliente);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCliente(cliente.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
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

function ClienteForm({
  cliente,
  onSubmit,
}: {
  cliente: Cliente | null;
  onSubmit: (cliente: Cliente) => void;
}) {
  const [nome, setNome] = useState(cliente?.nome || "");
  const [contato, setContato] = useState(cliente?.contato || "");
  const [whatsapp, setWhatsapp] = useState(cliente?.whatsapp || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: cliente?.id || "",
      nome,
      contato,
      whatsapp,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contato">Contato</Label>
        <Input
          id="contato"
          value={contato}
          onChange={(e) => setContato(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Salvar</Button>
    </form>
  );
}
