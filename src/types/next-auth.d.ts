import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      papel: "ADMIN" | "ATENDENTE" | "COZINHA";
    };
  }

  interface User {
    papel: "ADMIN" | "ATENDENTE" | "COZINHA";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    papel: "ADMIN" | "ATENDENTE" | "COZINHA";
  }
}
