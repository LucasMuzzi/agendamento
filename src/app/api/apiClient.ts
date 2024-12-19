import axios from "axios";

export const apiAgend = axios.create({
   baseURL: "https://agendamentoapi.railway.internal/",
  //baseURL: "http://localhost:3169/",
});
