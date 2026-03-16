import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Esquema de validación para registro
const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar los datos de entrada
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Datos inválidos",
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "El email ya está registrado" 
        },
        { status: 409 } // Conflict
      );
    }

    // Hashear la contraseña
    const hashedPassword = await hash(password, 12);

    // Crear el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Rol por defecto
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Usuario registrado exitosamente",
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error en registro:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

// Opcional: Método GET para verificar disponibilidad del endpoint
export async function GET() {
  return NextResponse.json(
    { 
      success: true, 
      message: "Endpoint de registro funcionando",
      endpoint: "/api/auth/register" 
    },
    { status: 200 }
  );
}