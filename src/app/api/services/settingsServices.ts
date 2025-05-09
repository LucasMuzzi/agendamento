/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiAgend } from "../apiClient";
import Cookies from "js-cookie";

interface CreateServiceTypeRequest {
  nome: string;
}

export interface ServiceType {
  _id: string;
  nome: string;
}

export class SettingsSerivce {
  private codUser: string | null = null;

  constructor() {}

  getCodUserFromCookie(): string | null {
    const cookieData = Cookies.get("info");
    if (cookieData) {
      const parsedData = JSON.parse(cookieData);
      return parsedData.codUser || null;
    }
    return null;
  }

  async createServiceType(body: CreateServiceTypeRequest): Promise<any> {
    if (!this.codUser) {
      this.codUser = this.getCodUserFromCookie();
      if (!this.codUser) {
        throw new Error("CodUser não encontrado no cookie");
      }
    }

    const requestBody = {
      ...body,
      codUser: this.codUser,
    };

    try {
      const response = await apiAgend.post("/api/create-service", requestBody);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar tipo de serviço:", error);
      throw error;
    }
  }

  async fetchServiceTypes(): Promise<ServiceType[]> {
    if (!this.codUser) {
      this.codUser = this.getCodUserFromCookie();
      if (!this.codUser) {
        throw new Error("CodUser não encontrado no cookie");
      }
    }

    try {
      const response = await apiAgend.post("/api/get-service", {
        codUser: this.codUser,
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de serviço:", error);
      throw error;
    }
  }

  async createSchedule(
    horarioInicio: string,
    horarioFim: string,
    intervalo: string
  ): Promise<any> {
    if (!this.codUser) {
      this.codUser = this.getCodUserFromCookie();
      if (!this.codUser) {
        throw new Error("CodUser não encontrado no cookie");
      }
    }

    const requestBody = {
      horarioInicio,
      horarioFim,
      intervalo,
      codUser: this.codUser,
    };

    try {
      const response = await apiAgend.post("/api/create-schedule", requestBody);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar horário:", error);
      throw error;
    }
  }

  async fetchSchedule(): Promise<any> {
    if (!this.codUser) {
      this.codUser = this.getCodUserFromCookie();
      if (!this.codUser) {
        throw new Error("CodUser  não encontrado no cookie");
      }
    }

    try {
      const response = await apiAgend.post("/api/get-schedule", {
        codUser: this.codUser,
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      throw error;
    }
  }

  async removeServiceType(id: string): Promise<any> {
    if (!this.codUser) {
      this.codUser = this.getCodUserFromCookie();
      if (!this.codUser) {
        throw new Error("CodUser  não encontrado no cookie");
      }
    }

    try {
      const response = await apiAgend.delete("/api/remove-service", {
        data: {
          id,
          codUser: this.codUser,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao remover tipo de serviço:", error);
      throw error;
    }
  }
}
