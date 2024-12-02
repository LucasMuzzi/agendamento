/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiAgend } from "../apiClient"; // Ajuste o caminho conforme necessário
import Cookies from "js-cookie";

interface CreateServiceTypeRequest {
  nome: string;
}

export interface ServiceType {
  id: string; // ou outro tipo que identifique o serviço
  nome: string;
}

export class Settings {
  private codUser: string;

  constructor() {
    const cookieData = Cookies.get("info");

    if (!cookieData) {
      throw new Error("Cookie 'info' não encontrado");
    }

    const parsedData = JSON.parse(cookieData);
    this.codUser = parsedData.codUser;

    if (!this.codUser) {
      throw new Error("CodUser não encontrado no cookie");
    }
  }

  async createServiceType(body: CreateServiceTypeRequest): Promise<any> {
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
    try {
      const cookieData = Cookies.get("info");

      if (!cookieData) {
        throw new Error("Cookie 'info' não encontrado");
      }

      const parsedData = JSON.parse(cookieData);
      this.codUser = parsedData.codUser;

      console.log(this.codUser);

      const response = await apiAgend.post("/api/get-service", {
        codUser: this.codUser,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de serviço:", error);
      throw error;
    }
  }
}
