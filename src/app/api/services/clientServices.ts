import { apiAgend } from "../apiClient";
import Cookies from "js-cookie";

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

interface UpdateClientRequest {
  name: string;
  phone: string;
  whatsapp: boolean;
}

interface DeleteClientResponse {
  message: string;
}

export class clientService {
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
        "/api/register-client",
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
      throw new Error("CodUser não encontrado no cookie");
    }

    try {
      const response = await apiAgend.post<GetClientsResponse>(
        "/api/get-clients",
        { codUser }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
  }
  async atualizarCliente(
    id: string,
    body: UpdateClientRequest
  ): Promise<RegisterResponse> {
    const cookieData = Cookies.get("info");

    if (!cookieData) {
      throw new Error("Cookie 'info' não encontrado");
    }

    const parsedData = JSON.parse(cookieData);
    const { codUser } = parsedData;

    if (!codUser) {
      throw new Error("CodUser  não encontrado no cookie");
    }

    const requestBody = {
      ...body,
      codUser,
    };

    try {
      const response = await apiAgend.post<RegisterResponse>(
        `/api/update-client/${id}`,
        requestBody
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  }

  async excluirCliente(id: string): Promise<DeleteClientResponse> {
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
      const response = await apiAgend.post<DeleteClientResponse>(
        `/api/delete-client/${id}`,
        { codUser }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      throw error;
    }
  }
}
