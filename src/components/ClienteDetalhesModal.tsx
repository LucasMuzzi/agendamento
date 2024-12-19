import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Edit } from "lucide-react";
import { PhoneIcon as WhatsappIcon } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  contato: string;
  whatsapp: boolean;
};

interface ClienteDetalhesModalProps {
  cliente: Cliente | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClienteDetalhesModal({
  cliente,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: ClienteDetalhesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        {cliente && (
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome:</Label>
              <p>{cliente.nome}</p>
            </div>
            <div>
              <Label>Contato:</Label>
              <p>{cliente.contato}</p>
            </div>
            <div>
              <Label>WhatsApp:</Label>
              <a
                href={`https://wa.me/${cliente.contato.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <WhatsappIcon className="h-5 w-5 text-green-500 ml-2 mt-1" />
              </a>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="sr-only">Deletar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
