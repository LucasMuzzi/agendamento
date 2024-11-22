/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AgendamentoService,
  AgendamentoResponse,
} from "@/app/api/services/appointmentServices";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhoneIcon as WhatsappIcon, Edit, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Agendamento = {
  id: string;
  data: Date;
  horarios: string[];
  nome: string;
  contato: string;
  isWhatsapp: boolean;
  tipoServico: string;
};

export default function DashboardHome() {
  const [todayAppointments, setTodayAppointments] = useState<Agendamento[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);

  const agendamentoService = new AgendamentoService();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      const userCookie = Cookies.get("info");
      if (!userCookie) {
        console.error("User cookie not found");
        return;
      }

      const user = JSON.parse(userCookie);
      try {
        const agendamentosData: AgendamentoResponse[] =
          await agendamentoService.buscarAgendamentos(user.codUser);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAgendamentos: any[] = agendamentosData
          .filter((agendamento) => {
            const agendamentoDate = new Date(agendamento.data);
            agendamentoDate.setHours(0, 0, 0, 0);
            return agendamentoDate.getTime() === today.getTime();
          })
          .map((agendamento) => ({
            id: agendamento._id,
            data: new Date(agendamento.data),
            horarios: agendamento.horarios,
            nome: agendamento.nome,
            contato: agendamento.contato,
            isWhatsapp: agendamento.isWhatsapp,
            tipoServico: agendamento.tipoServico,
          }));

        setTodayAppointments(todayAgendamentos);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      }
    };

    fetchTodayAppointments();
  }, []);

  const handleEditAgendamento = useCallback((agendamento: Agendamento) => {
    // Implement edit functionality
    console.log("Edit agendamento:", agendamento);
  }, []);

  const handleDeleteAgendamento = useCallback(
    async (id: string, horario: string) => {
      try {
        await agendamentoService.deletarHorario(id, horario);
        setTodayAppointments((prev) =>
          prev.map((agendamento) => {
            if (agendamento.id === id) {
              return {
                ...agendamento,
                horarios: agendamento.horarios.filter((h) => h !== horario),
              };
            }
            return agendamento;
          })
        );
      } catch (error) {
        console.error("Erro ao deletar horário:", error);
      }
    },
    [agendamentoService]
  );

  const handleAgendamentoClick = useCallback((agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsDetailsModalOpen(true);
  }, []);

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "ml-8" : ""}`}>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Card
        className={`flex-grow ${
          isMobile ? "w-[36vh]" : "w-full max-w-[1000px]"
        } overflow-hidden h-[88vh] lg:h-[calc(100vh-2rem)]`}
      >
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Horário</TableHead>
                <TableHead>Nome</TableHead>
                {!isMobile && <TableHead>Contato</TableHead>}
                {!isMobile && <TableHead>Serviço</TableHead>}
                <TableHead>WhatsApp</TableHead>
                {!isMobile && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayAppointments
                .flatMap((agendamento) =>
                  agendamento.horarios.map((horario) => ({
                    ...agendamento,
                    horario,
                  }))
                )
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((agendamento, index) => (
                  <TableRow
                    key={index}
                    className="cursor-pointer"
                    onClick={() => handleAgendamentoClick(agendamento)}
                  >
                    <TableCell className="font-medium">
                      {agendamento.horario}
                    </TableCell>
                    <TableCell>{agendamento.nome}</TableCell>
                    {!isMobile && <TableCell>{agendamento.contato}</TableCell>}
                    {!isMobile && (
                      <TableCell>{agendamento.tipoServico}</TableCell>
                    )}
                    <TableCell>
                      {agendamento.isWhatsapp && (
                        <a
                          href={`https://wa.me/${agendamento.contato.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className={`${isMobile ? "flex justify-center" : ""}`}
                        >
                          <WhatsappIcon className="h-5 w-5 text-green-500" />
                        </a>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAgendamento(agendamento);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAgendamento(
                                agendamento.id,
                                agendamento.horario
                              );
                            }}
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
        </CardContent>
      </Card>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAgendamento && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Data</Label>
                <p>{selectedAgendamento.data.toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <Label>Horários</Label>
                <p>{selectedAgendamento.horarios.join(", ")}</p>
              </div>
              <div>
                <Label>Nome</Label>
                <p>{selectedAgendamento.nome}</p>
              </div>
              <div>
                <Label>Contato</Label>
                <p>{selectedAgendamento.contato}</p>
              </div>
              <div>
                <Label>É WhatsApp?</Label>
                <p>{selectedAgendamento.isWhatsapp ? "Sim" : "Não"}</p>
              </div>
              <div>
                <Label>Tipo de Serviço</Label>
                <p>{selectedAgendamento.tipoServico}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsDetailsModalOpen(false);
                if (selectedAgendamento) {
                  handleEditAgendamento(selectedAgendamento);
                }
              }}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectedAgendamento) {
                  handleDeleteAgendamento(
                    selectedAgendamento.id,
                    selectedAgendamento.horarios[0]
                  );
                }
                setIsDetailsModalOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="sr-only">Deletar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
