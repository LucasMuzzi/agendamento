/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AgendamentoResponse,
  AgendamentoService,
} from "@/app/api/services/appointmentServices";
import Cookies from "js-cookie";
import { ptBR } from "date-fns/locale";
import { LoadingScreen } from "@/components/loading";

type Agendamento = {
  id: any;
  data: any;
  horarios: string[];
  nome: string;
  contato: string;
  isWhatsapp: boolean;
  tipoServico: string;
};

const tiposServico = ["Cabelo", "Barba", "Cabelo + Barba"];

export default function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(false);
  const [tipoServico, setTipoServico] = useState(tiposServico[0]);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    const fetchAgendamentos = async () => {
      const userCookie = Cookies.get("info");
      if (!userCookie) {
        console.error("User cookie not found");
        return;
      }

      const user = JSON.parse(userCookie);
      try {
        const agendamentosData: AgendamentoResponse[] =
          await agendamentoService.buscarAgendamentos(user.codUser);

        const agendamentosConvertidos: Agendamento[] = agendamentosData
          .filter((agendamento) => agendamento.userId === user.codUser)
          .map((agendamento) => ({
            id: agendamento._id,
            data: new Date(agendamento.data),
            horarios: agendamento.horarios,
            nome: agendamento.nome,
            contato: agendamento.contato,
            isWhatsapp: agendamento.isWhatsapp || false,
            tipoServico: agendamento.tipoServico,
          }));

        setAgendamentos(agendamentosConvertidos);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      }
    };

    fetchAgendamentos();
  }, []);

  const updateBookedTimeSlots = useCallback(() => {
    const booked = agendamentos
      .filter((a) => {
        const agendamentoDate = new Date(a.data);
        return (
          !isNaN(agendamentoDate.getTime()) &&
          agendamentoDate.toDateString() === selectedDate?.toDateString()
        );
      })
      .flatMap((a) => a.horarios);
    setBookedTimeSlots(booked);
  }, [agendamentos, selectedDate]);

  useEffect(() => {
    updateBookedTimeSlots();
  }, [selectedDate, agendamentos, updateBookedTimeSlots]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
  }, []);

  const handleScheduleClick = useCallback(() => {
    setIsTimeModalOpen(true);
  }, []);

  const handleTimeToggle = useCallback((time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time].sort()
    );
  }, []);

  const handleTimesConfirm = useCallback(() => {
    if (selectedTimes.length > 0) {
      setIsTimeModalOpen(false); // Fecha o modal de horários
      setTimeout(() => {
        setIsFormModalOpen(true); // Abre o modal de confirmação após um atraso
      }, 500); // Ajuste o tempo conforme necessário
    }
  }, [selectedTimes]);

  const handleCreateAgendamento = useCallback(async () => {
    if (selectedDate && selectedTimes.length > 0 && nome && contato) {
      const userCookie = Cookies.get("info");
      if (!userCookie) {
        console.error("User  cookie not found");
        return;
      }

      const user = JSON.parse(userCookie);

      const novosAgendamentos = selectedTimes.map((time) => ({
        userId: user.codUser,
        data: selectedDate.toISOString(),
        horarios: [time],
        nome,
        contato,
        isWhatsapp,
        tipoServico,
      }));

      try {
        const agendamentosCriados = await Promise.all(
          novosAgendamentos.map((agendamento: any) =>
            agendamentoService.criarAgendamento(agendamento)
          )
        );

        setAgendamentos((prev: any) => [...prev, ...agendamentosCriados]);

        // Feche ambos os modais
        setIsFormModalOpen(false);
        setIsTimeModalOpen(false);

        // Limpe os campos
        setSelectedTimes([]);
        setNome("");
        setContato("");
        setIsWhatsapp(false);
        setTipoServico(tiposServico[0]);

        // Recarregue a página
        setTimeout(() => {
          window.location.reload();
        }, 500); // Adjust the delay as needed
      } catch (error) {
        console.error("Erro ao gravar agendamento:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  }, [
    selectedDate,
    selectedTimes,
    nome,
    contato,
    isWhatsapp,
    tipoServico,
    agendamentoService,
  ]);

  const handleEditAgendamento = useCallback(async () => {
    if (
      selectedAgendamento &&
      selectedDate &&
      selectedTimes.length > 0 &&
      nome &&
      contato
    ) {
      const userCookie = Cookies.get("info");
      if (!userCookie) {
        console.error("User cookie not found");
        return;
      }

      const user = JSON.parse(userCookie);

      const updatedAgendamentos = selectedTimes.map((time) => ({
        id: selectedAgendamento.id,
        userId: user.codUser,
        data: selectedDate.toISOString(),
        horarios: [time],
        nome,
        contato,
        isWhatsapp,
        tipoServico,
      }));

      try {
        await Promise.all(
          updatedAgendamentos.map((agendamento: any) =>
            agendamentoService.atualizarAgendamento(agendamento)
          )
        );

        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === selectedAgendamento.id
              ? { ...a, horarios: selectedTimes }
              : a
          )
        );

        setIsFormModalOpen(false);
        setSelectedTimes([]);
        setNome("");
        setContato("");
        setIsWhatsapp(false);
        setTipoServico(tiposServico[0]);
      } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
      }
    }
  }, [
    selectedAgendamento,
    selectedDate,
    selectedTimes,
    nome,
    contato,
    isWhatsapp,
    tipoServico,
    agendamentoService,
  ]);

  const handleFormSubmit = useCallback(() => {
    if (selectedAgendamento) {
      handleEditAgendamento();
    } else {
      handleCreateAgendamento();
    }
  }, [selectedAgendamento, handleEditAgendamento, handleCreateAgendamento]);

  const handleDeleteHorario = useCallback(
    async (id: string, horario: string) => {
      try {
        await agendamentoService.deletarHorario(id, horario);

        setAgendamentos((prev) => {
          return prev.map((agendamento) => {
            if (agendamento.id === id) {
              return {
                ...agendamento,
                horarios: agendamento.horarios.filter((h) => h !== horario),
              };
            }
            return agendamento;
          });
        });
      } catch (error) {
        console.error("Erro ao deletar horário:", error);
      }
    },
    [agendamentoService]
  );

  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  useEffect(() => {
    if (selectedAgendamento) {
      setNome(selectedAgendamento.nome);
      setContato(selectedAgendamento.contato);
      setIsWhatsapp(selectedAgendamento.isWhatsapp);
      setTipoServico(selectedAgendamento.tipoServico);
      setSelectedTimes(selectedAgendamento.horarios);
      setSelectedDate(new Date(selectedAgendamento.data));
    }
  }, [selectedAgendamento]);

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "mt-12" : ""}`}>
      {isLoading &&
        !isTimeModalOpen &&
        !isFormModalOpen &&
        !isDetailsModalOpen && <LoadingScreen />}
      <div className="flex flex-col lg:flex-row gap-2 items-start relative z-10">
        {/* Calendário */}
        <Card
          className={`${
            isMobile ? "w-[51vh]" : "w-full max-w-[400px]"
          } flex-shrink-0`}
        >
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Calendar
              locale={ptBR}
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className={` rounded-md border shadow-sm  ${
                isMobile ? "" : "pl-8"
              }`}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              classNames={{
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                nav_button: "hover:bg-accent hover:text-accent-foreground",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: " w-full border-collapse space-y-1",
                head_row: "flex w-full mt-2 pl-8 ",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-md",
                row: "flex w-full mt-2 pl-8",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              }}
            />
            <Button
              onClick={handleScheduleClick}
              className="w-full mt-4 text-sm sm:text-base"
            >
              Agendar
            </Button>
          </CardContent>
        </Card>
        {/* Tabela de Agendamentos */}
        <Card
          className={`flex-grow ${
            isMobile ? "w-[51vh]" : "w-full max-w-[1000px]"
          } overflow-hidden h-[calc(44vh-2rem)] lg:h-[calc(100vh-2rem)]`}
        >
          <CardHeader>
            <CardTitle>Agendamentos do Dia</CardTitle>
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
                {agendamentos
                  .filter((a) => {
                    const agendamentoDate = new Date(a.data);
                    return (
                      agendamentoDate.toDateString() ===
                      (selectedDate?.toDateString() ?? "")
                    );
                  })
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
                      onClick={() => {
                        setSelectedAgendamento(agendamento);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">
                        {agendamento.horario}
                      </TableCell>
                      <TableCell>{agendamento.nome}</TableCell>
                      {!isMobile && (
                        <TableCell>{agendamento.contato}</TableCell>
                      )}
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
                            className={`${isMobile ? "flex pl-7" : ""}`}
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
                                setSelectedAgendamento(agendamento);
                                setIsFormModalOpen(true);
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
                                handleDeleteHorario(
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
      </div>

      <Dialog open={isTimeModalOpen} onOpenChange={setIsTimeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecione os horários</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-2 gap-2 mr-4">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTimes.includes(time) ? "default" : "outline"}
                  onClick={() => handleTimeToggle(time)}
                  disabled={bookedTimeSlots.includes(time)}
                  className={bookedTimeSlots.includes(time) ? "opacity-50" : ""}
                >
                  {time}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={handleTimesConfirm}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>
              Agendar: {selectedDate?.toLocaleDateString()} -{" "}
              {selectedTimes.join(", ")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contato" className="text-right">
                Contato
              </Label>
              <Input
                id="contato"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isWhatsapp" className="text-right">
                WhatsApp?
              </Label>
              <Checkbox
                id="isWhatsapp"
                checked={isWhatsapp}
                onCheckedChange={(checked: any) =>
                  setIsWhatsapp(checked as boolean)
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipoServico" className="text-right">
                Tipo de Serviço
              </Label>
              <Select value={tipoServico} onValueChange={setTipoServico}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {tiposServico.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormModalOpen(false);
                setIsTimeModalOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleFormSubmit}>Gravar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAgendamento && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Data</Label>
                <p>
                  {selectedAgendamento.data instanceof Date
                    ? selectedAgendamento.data.toLocaleDateString()
                    : selectedAgendamento.data}
                </p>
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
                <Label>WhatsApp?</Label>
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
                setIsFormModalOpen(true);
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
                if (selectedAgendamento) {
                  handleDeleteHorario(
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
