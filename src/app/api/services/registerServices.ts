import { apiAgend } from "../apiClient";
import Cookies from "js-cookie"; // Importa a biblioteca para acessar cookies

interface RegisterRequest {
  name: string;
  phone: string;
  codUser: string;
}

interface RegisterResponse {
  message: string;
  client: {
    _id: string;
    name: string;
    phone: string;
    codUser: string;
  };
}

interface Client {
  _id: string;
  name: string;
  phone: string;
  codUser: string;
  whatsapp: boolean;
}

interface GetClientsResponse {
  clients: Client[];
}

export class RegisterService {
  async registrarCliente(body: {
    name: string;
    phone: string;
    whatsapp: boolean;
  }): Promise<RegisterResponse> {
    const cookieData = Cookies.get("info");

    if (!cookieData) {
      throw new Error("Cookie 'info' não encontrado");
    }

    const parsedData = JSON.parse(cookieData);
    const { codUser } = parsedData;

    if (!codUser) {
      throw new Error("CodUser  não encontrado no cookie");
    }

    const requestBody: RegisterRequest = {
      ...body,
      codUser,
    };

    try {
      const response = await apiAgend.post<RegisterResponse>(
        "/api/register-user",
        requestBody
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar cliente:", error);
      throw error;
    }
  }

  async buscarClientesPorCodUser(): Promise<GetClientsResponse> {
    const cookieData = Cookies.get("info");

    if (!cookieData) {
      throw new Error("Cookie 'info' não encontrado");
    }

    const parsedData = JSON.parse(cookieData);
    const { codUser } = parsedData;

    if (!codUser) {
      throw new Error("CodUser  não encontrado no cookie");
    }

    try {
      const response = await apiAgend.post<GetClientsResponse>(
        "/api/get-clients",
        codUser
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
  }
}
