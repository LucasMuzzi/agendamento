"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LoginClass } from "@/app/api/services/authServices";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast, useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        duration: 3000,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const loginClass = new LoginClass();
    try {
      const response = await loginClass.newPass({
        email,
        code: otp,
        newpass: newPassword,
      });
      toast({
        title: "Sucesso",
        description: response.message,
        duration: 3000,
        className: "bg-green-500 text-white",
      });

      setTimeout(() => {
        router.push("/login/auth");
      }, 2000);
    } catch (err) {
      console.error("Erro ao redefinir a senha:", err);
      let errorMessage = "Erro de rede. Tente novamente mais tarde.";
      if (err instanceof Error) {
        errorMessage =
          err.message || "Ocorreu um erro inesperado. Tente novamente.";
      }
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Verifique o código digitado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>
            Digite o código de verificação e sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="otp"
                placeholder="Código de verificação (8 dígitos)"
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="newPassword"
                placeholder="Nova senha"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="confirmPassword"
                placeholder="Confirme a nova senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => router.push("/login/auth")}
          >
            Voltar para login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
