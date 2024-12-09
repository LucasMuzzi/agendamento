import axios from "axios";

export const apiAgend = axios.create({
   baseURL: "https://agendamentoapi-kdze.onrender.com/",
//  baseURL: "http://localhost:3169/",
});
