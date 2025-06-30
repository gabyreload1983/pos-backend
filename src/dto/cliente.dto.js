import { z } from "zod";

// Campos comunes
const camposComunes = {
  razon_social: z.string().optional().nullable(),
  tipo_documento: z
    .union([
      z.enum(["DNI", "CUIT", "CUIL", "Pasaporte"]),
      z.literal(""),
      z.null(),
    ])
    .transform((v) => (v === "" ? null : v))
    .optional(),
  numero_documento: z.string().optional().nullable(),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  provincia_id: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .positive()
    .nullable()
    .optional(),
  ciudad_id: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .positive()
    .nullable()
    .optional(),
  condicion_iva_id: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .positive()
    .nullable()
    .optional(),
  cuit: z.string().optional().nullable(),
  activo: z.union([z.literal(1), z.literal(0)]).optional(),
};

export const createClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  ...camposComunes,
});

export const updateClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").optional(),
  apellido: z.string().min(1, "El apellido es obligatorio").optional(),
  ...camposComunes,
});
