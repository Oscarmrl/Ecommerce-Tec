import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

type NextAuthOptions = Parameters<typeof NextAuth>[0];

// Schema de validación para credenciales
const credentialsSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña son requeridos");
          }

          const validatedCredentials = credentialsSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!validatedCredentials.success) {
            throw new Error("Credenciales inválidas");
          }

          const { email, password } = validatedCredentials.data;

          // Buscar usuario por email
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Crear nuevo usuario si no existe (registro automático)
            const hashedPassword = await hash(password, 12);
            const newUser = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0], // Nombre por defecto
                password: hashedPassword,
              },
            });
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              image: newUser.image,
            };
          }

          // Verificar si el usuario tiene contraseña (creado con credenciales)
          if (!user.password) {
            // Usuario creado con Google, no puede iniciar con contraseña
            throw new Error("Este email está registrado con Google. Usa Google para iniciar sesión.");
          }

          // Verificar contraseña
          const isValidPassword = await compare(password, user.password);
          
          if (!isValidPassword) {
            throw new Error("Contraseña incorrecta");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error en autorización:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.provider = token.provider as string;
      }

      return session;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account?.provider === "credentials") {
        token.provider = "credentials";
      } else if (account?.provider === "google") {
        token.provider = "google";
      }
      
      return token;
    },
    async redirect({ url, baseUrl }: any) {
      // Redirigir a la página principal después de login
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/`;
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
