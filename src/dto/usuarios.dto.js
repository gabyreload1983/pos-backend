// src/dtos/usuario.dto.js
import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol_id: z.number().int().positive("Debe seleccionar un rol válido"),
  activo: z.union([z.literal(1), z.literal(0)]).optional(),
});

export const actualizarUsuarioSchema = usuarioSchema.partial();
