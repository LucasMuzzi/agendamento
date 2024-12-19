import { apiAgend } from "../apiClient";
import Cookies from "js-cookie";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  codUser: string;
}

interface ForgotPassRequest {
  email: string;
}

interface ForgotPassResponse {
  message: string;
}

interface NewPassRequest {
  email: string;
  code: string;
  newpass: string;
}

interface NewPassResponse {
  message: string;
}

export class LoginClass {
  async authLogin(body: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiAgend.post<LoginResponse>("/api/login", body);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  }

  async forgotPass(body: ForgotPassRequest): Promise<ForgotPassResponse> {
    try {
      const response = await apiAgend.post<ForgotPassResponse>(
        "/api/request-password-reset",
        body
      );
      return response.data;
    } catch (error) {
      console.error("Erro solicitar token:", error);
      throw error;
    }
  }

  async newPass(body: NewPassRequest): Promise<NewPassResponse> {
    try {
      const response = await apiAgend.post<NewPassResponse>(
        "/api/verify-reset-code",
        body
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar senha:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    Cookies.remove("token");

  }
}
