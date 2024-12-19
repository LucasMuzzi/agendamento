import axios from "axios";

export const apiAgend = axios.create({
  baseURL: "https://agendamentoapi-production.up.railway.app",
  //  baseURL: "http://localhost:3169/",
});
