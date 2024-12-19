/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiAgend } from "../apiClient";
import Cookies from "js-cookie";

export class newClienteService {
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

  async newClient(body: any) {
    const requestBody = {
      ...body,
    };

    try {
      const response = await apiAgend.post("/api/register", requestBody);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar tipo de serviço:", error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const response = await apiAgend.get("/api/get-users");
      return response.data;
    } catch (error) {
      console.error("Erro ao criar tipo de serviço:", error);
      throw error;
    }
  }
}
