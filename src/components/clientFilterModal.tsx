/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { clientService } from "@/app/api/services/clientServices";

export interface Client {
  _id: string;
  name: string;
  phone: string;
  whatsapp: boolean;
}

type ClientFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (client: any) => void; // Mudei para usar a interface Client
};

export function ClientFilterModal({
  isOpen,
  onClose,
  onSelectClient,
}: ClientFilterModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>(""); // Inicializa como string
  const [clients, setClients] = useState<Client[]>([]);

  // Função para buscar clientes
  const fetchClients = async (term: string) => {
    try {
      const response = await new clientService().buscarClientesPorCodUser();
      console.log(response);
      const filteredClients = response.clients.filter(
        (client) =>
          client.name.toLowerCase().includes(term.toLowerCase()) ||
          client.phone.includes(term)
      );
      setClients(filteredClients);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  // Use useEffect para buscar clientes quando o searchTerm mudar
  useEffect(() => {
    if (searchTerm) {
      const debounceFetch = setTimeout(() => {
        fetchClients(searchTerm);
      }, 300); // 300ms de debounce
      return () => clearTimeout(debounceFetch); // Limpa o timeout se o componente for desmontado ou o searchTerm mudar
    } else {
      setClients([]); // Limpa a lista se o campo de busca estiver vazio
    }
  }, [searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtrar Clientes</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Buscar por nome ou contato"
            value={searchTerm ?? ""} // Garante que o valor seja sempre uma string
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => fetchClients(searchTerm)}>Buscar</Button>
        </div>
        <ScrollArea className="h-[300px]">
          {clients.map((client) => (
            <Button
              key={client._id} // Use o _id como chave única
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onSelectClient(client)} // Passa o cliente selecionado
            >
              {client.name} - {client.phone}
            </Button>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
