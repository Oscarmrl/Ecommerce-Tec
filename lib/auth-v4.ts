import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const authOptions: AuthOptions = {
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

          const validated = credentialsSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!validated.success) throw new Error("Credenciales inválidas");

          const { email, password } = validated.data;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) throw new Error("Usuario no encontrado");

          if (!user.password) {
            throw new Error(
              "Este email está registrado con Google. Usa Google para iniciar sesión.",
            );
          }

          const ok = await compare(password, user.password);
          if (!ok) throw new Error("Contraseña incorrecta");

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || "USER",
          };
        } catch (err) {
          // Importante: devolver null hace que NextAuth marque credenciales inválidas
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * 1) Cuando el provider es Google, nos aseguramos de crear/actualizar el usuario en Prisma.
     * Esto evita depender del Adapter y hace que tengas siempre un user en tu BD.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Upsert: si existe lo actualiza, si no existe lo crea
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            email,
            name: user.name || email.split("@")[0],
            image: user.image,
            role: "USER",
          },
          select: { id: true, role: true },
        });

        // Muy importante: reemplazar el id de NextAuth por el id real de Prisma
        user.id = dbUser.id as any;
        (user as any).role = dbUser.role;
      }

      return true;
    },

    /**
     * 2) En JWT guardamos el id/role correctos.
     * - Para credentials ya viene bien.
     * - Para google, si por alguna razón no vino el id, lo resolvemos por email.
     */
    async jwt({ token, user, account }) {
      // Caso login (cuando user existe)
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role || "USER";
      }

      // Provider info (opcional)
      if (account?.provider) token.provider = account.provider;

      // Safety net: si google login no seteó id (edge cases), lo buscamos
      if ((!token.id || token.id === "undefined") && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true, name: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role || "USER";
          token.name = token.name ?? dbUser.name ?? undefined;
          token.picture = token.picture ?? dbUser.image ?? undefined;
        }
      }

      return token;
    },

    /**
     * 3) Exponer en session lo que necesitas en el cliente
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).provider = token.provider as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return `${baseUrl}/`;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
