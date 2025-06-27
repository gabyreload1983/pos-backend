import { z } from "zod";

export const createProveedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  razon_social: z.string().optional().nullable(),
  cuit: z.string().optional().nullable(),
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
  condicion_iva: z
    .enum([
      "Responsable Inscripto",
      "Monotributo",
      "Consumidor Final",
      "Exento",
    ])
    .default("Consumidor Final")
    .nullable()
    .optional(),
  activo: z.union([z.literal(1), z.literal(0)]).optional(),
});

export const updateProveedorSchema = createProveedorSchema.partial();
