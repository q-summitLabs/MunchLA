/* eslint-disable @typescript-eslint/no-unused-vars */

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      createdAt?: string;
      lastLogin?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    googleId?: string;
    createdAt?: Date;
    lastLogin?: Date;
  }
}
