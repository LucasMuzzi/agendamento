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
import { FaRegUser } from "react-icons/fa";
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
import "./agendamentos.css";
import { ClientFilterModal } from "@/components/clientFilterModal";
import {
  ServiceType,
  SettingsSerivce,
} from "@/app/api/services/settingsServices";
import { useToast } from "@/hooks/use-toast";

type Agendamento = {
  id: any;
  data: any;
  horarios: string[];
  nome: string;
  contato: string;
  isWhatsapp: boolean;
  tipoServico: string;
};

export default function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const { toast } = useToast();
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [tipoServico, setTipoServico] = useState(
    serviceTypes.length > 0 ? serviceTypes[0].nome : ""
  );
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClientFilterModalOpen, setIsClientFilterModalOpen] = useState(false);
  const [fetchedSchedule, setFetchedSchedule] = useState<string[]>([]);

  const agendamentoService = new AgendamentoService();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchServiceTypes = useCallback(async () => {
    const settings = new SettingsSerivce();
    try {
      const types = await settings.fetchServiceTypes();
      setServiceTypes(types);
      setTipoServico(types.length > 0 ? types[0].nome : "");
    } catch (error) {
      console.error("Erro ao buscar tipos de serviço:", error);
    }
  }, []);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

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

  const handleScheduleClick = useCallback(async () => {
    setIsTimeModalOpen(true);
    try {
      const settings = new SettingsSerivce();
      const scheduleData = await settings.fetchSchedule();

      console.log("Schedule Data:", scheduleData);

      setFetchedSchedule(scheduleData.horarios || []);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
    }
  }, []);

  const handleTimesConfirm = useCallback(() => {
    if (selectedTimes.length > 0) {
      setIsTimeModalOpen(false);
      setIsFormModalOpen(true);
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
        setIsLoading(true);
        await Promise.all(
          novosAgendamentos.map((agendamento) =>
            agendamentoService.criarAgendamento(agendamento)
          )
        );
  

        setAgendamentos((prev: any) => [...prev, ...novosAgendamentos]);

        setIsFormModalOpen(false);
        setIsTimeModalOpen(false);

        setSelectedTimes([]);
        setNome("");
        setContato("");
        setIsWhatsapp(false);
        setTipoServico(serviceTypes.length > 0 ? serviceTypes[0].nome : "");

        toast({
          title: "Agendamento criado",
          description: "O agendamento foi criado com sucesso.",
          className: "bg-green-500 text-white",
          duration: 3000,
        });

        updateBookedTimeSlots();
      } catch (error) {
        console.error("Erro ao gravar agendamento:", error);
        toast({
          title: "Erro ao criar agendamento",
          description:
            "Ocorreu um erro ao criar o agendamento. Tente novamente.",
          duration: 3000,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
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
    serviceTypes,
    toast,
    updateBookedTimeSlots,
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
        console.error("User  cookie not found");
        return;
      }

      const user = JSON.parse(userCookie);

      const updatedAgendamento = {
        id: selectedAgendamento.id,
        userId: user.codUser,
        data: selectedDate.toISOString(),
        horarios: selectedTimes,
        nome,
        contato,
        isWhatsapp,
        tipoServico,
      };

      try {
        setIsLoading(true);

        await agendamentoService.atualizarAgendamento(updatedAgendamento);

        setAgendamentos((prev: any) =>
          prev.map((agendamento: any) =>
            agendamento.id === selectedAgendamento.id
              ? updatedAgendamento
              : agendamento
          )
        );

        setIsFormModalOpen(false);
        setSelectedTimes([]);
        setNome("");
        setContato("");
        setIsWhatsapp(false);
        setTipoServico(serviceTypes.length > 0 ? serviceTypes[0].nome : "");

        toast({
          title: "Agendamento atualizado",
          description: "O agendamento foi atualizado com sucesso.",
          className: "bg-green-500 text-white",
          duration: 3000,
        });
      } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);

        toast({
          title: "Erro ao atualizar agendamento",
          description:
            "Ocorreu um erro ao atualizar o agendamento. Tente novamente.",
          duration: 3000,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
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
    serviceTypes,
    toast,
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

  const handleClientSelect = useCallback(
    (client: { whatsapp: boolean; name: string; phone: string }) => {
      setNome(client.name || "");
      setContato(client.phone || "");
      setIsWhatsapp(client.whatsapp);

      setIsClientFilterModalOpen(false);
    },
    []
  );

  const handleTimeToggle = useCallback((time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time].sort()
    );
  }, []);

  useEffect(() => {
    console.log("Agendamentos atualizados:", agendamentos);
  }, [agendamentos]);

  return (
    <div
      className={`container mx-auto p-4 ${
        isMobile ? "mt-12" : ""
      } agendamento-layout`}
    >
      {isLoading &&
        !isTimeModalOpen &&
        !isFormModalOpen &&
        !isDetailsModalOpen && <LoadingScreen />}
      <div className="flex flex-col lg:flex-row gap-2 items-start relative z-10">
        <Card className={`calendar-card flex-shrink-0`}>
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="calendar-container">
              <div className="calendar-wrapper">
                <Calendar
                  locale={ptBR}
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className={`rounded-md border shadow-sm w-full ${
                    isMobile ? "" : "pl-11"
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
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full mt-2 justify-center",
                    head_cell:
                      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2 justify-center",
                    cell: "text-center text-sm p-0 relative flex justify-center items-center",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  }}
                />
              </div>
            </div>
            <Button
              onClick={handleScheduleClick}
              className="w-full mt-4 text-sm sm:text-base"
            >
              Agendar
            </Button>
          </CardContent>
        </Card>
        {/* Tabela de Agendamentos */}
        <Card className="schedule-card overflow-hidden h-[calc(44vh-2rem)] lg:h-[calc(100vh-2rem)]">
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
                      key={`${agendamento.id}-${agendamento.horario}-${index}`}
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isTimeModalOpen} onOpenChange={setIsTimeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecione os horários</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-2 gap-2 mr-4">
              {fetchedSchedule.map((time) => (
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
            <div className="flex justify-between gap-2">
              <Button onClick={handleTimesConfirm}>Confirmar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-md z-50">
          {" "}
          {/* Ajuste da largura */}
          <DialogHeader>
            <DialogTitle>
              Agendar: {selectedDate?.toLocaleDateString()} -{" "}
              {selectedTimes.join(", ")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 ">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Clientes
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsClientFilterModalOpen(true)}
                className="w-auto " // Ajuste a largura do botão
              >
                <FaRegUser className="h-4 w-4" />
                <span className="sr-only">Filtrar Clientes</span>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 ">
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
                Serviço
              </Label>
              <div className="col-span-3">
                <Select value={tipoServico} onValueChange={setTipoServico}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((tipo) => (
                      <SelectItem key={tipo._id} value={tipo.nome}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between gap-2">
              {" "}
              {/* Contêiner flexível para os botões */}
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md">
          {" "}
          {/* Ajuste da largura */}
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
            <div className="flex justify-between gap-2">
              {" "}
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ClientFilterModal
        isOpen={isClientFilterModalOpen}
        onClose={() => setIsClientFilterModalOpen(false)}
        onSelectClient={handleClientSelect}
      />
    </div>
  );
}
