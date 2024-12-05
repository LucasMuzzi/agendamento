/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3169",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "agendamento-m1z2.onrender.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "agendamentoapi-kdze.onrender.com", // Adicione o domínio da sua API
        pathname: "/uploads/**", // Ajuste o pathname conforme necessário
      },
    ],
  },
};
