/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiAgend } from "../apiClient";
import Cookies from "js-cookie";

interface AgendamentoRequest {
  userId: any;
  data: string;
  horarios: string[];
  nome: string;
  contato: string;
  isWhatsapp: boolean;
  tipoServico: string;
}

export interface AgendamentoResponse {
  _id: string;
  userId: string;
  data: string;
  horarios: string[];
  nome: string;
  contato: string;
  isWhatsapp?: boolean;
  tipoServico: string;
}

export class AgendamentoService {
  async criarAgendamento(
    body: AgendamentoRequest
  ): Promise<AgendamentoResponse> {

    try {
      const response = await apiAgend.post<AgendamentoResponse>(
        "/api/create-appointment",
        body
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      throw error;
    }
  }

  async buscarAgendamentos(userId: string): Promise<AgendamentoResponse[]> {
    try {
      const response = await apiAgend.post<AgendamentoResponse[]>(
        "/api/find-appointment",
        { userId }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      throw error;
    }
  }

  async deletarHorario(id: string, horario: string): Promise<void> {
    try {
      const userCookie = Cookies.get("info");
      if (!userCookie) {
        throw new Error("User  cookie not found");
      }

      const user = JSON.parse(userCookie);
      const requestBody = {
        codUser: user.codUser,
        id,
        horario,
      };

      await apiAgend.post("/api/delete-appointment", requestBody);
    } catch (error) {
      console.error("Erro ao deletar horário:", error);
      throw error;
    }
  }

  async atualizarAgendamento(
    body: AgendamentoRequest & { id: string }
  ): Promise<AgendamentoResponse> {
    try {
      const response = await apiAgend.post<AgendamentoResponse>(
        "/api/update-appointment",
        body
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      throw error;
    }
  }
}
