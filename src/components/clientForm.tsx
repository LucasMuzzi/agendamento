import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneIcon } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  contato: string;
  whatsapp: boolean;
};

export function ClienteForm({
  cliente,
  onSubmit,
}: {
  cliente: Cliente | null;
  onSubmit: (cliente: Omit<Cliente, "id">) => void;
}) {
  const [nome, setNome] = useState(cliente?.nome || "");
  const [contato, setContato] = useState(cliente?.contato || "");
  const [whatsapp, setWhatsapp] = useState(cliente?.whatsapp || false);
  const [isValidWhatsapp, setIsValidWhatsapp] = useState(true);

  useEffect(() => {
    validateWhatsapp(contato);
  }, [contato]);

  const validateWhatsapp = (number: string) => {
    const whatsappRegex = /^\+?[1-9]\d{9,12}$/;
    setIsValidWhatsapp(whatsappRegex.test(number.replace(/\D/g, "")));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp && !isValidWhatsapp) {
      alert("Por favor, insira um número de WhatsApp válido.");
      return;
    }
    onSubmit({
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
        <div className="relative">
          <Input
            id="contato"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            required
            className={whatsapp && !isValidWhatsapp ? "border-red-500" : ""}
          />
          {whatsapp && (
            <PhoneIcon
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isValidWhatsapp ? "text-green-500" : "text-red-500"
              }`}
            />
          )}
        </div>
        {whatsapp && !isValidWhatsapp && (
          <p className="text-red-500 text-sm mt-1">
            Número de WhatsApp inválido
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="whatsapp"
          checked={whatsapp}
          onCheckedChange={(checked) => setWhatsapp(checked as boolean)}
        />
        <Label htmlFor="whatsapp">É WhatsApp?</Label>
      </div>
      <Button type="submit">Salvar</Button>
    </form>
  );
}
