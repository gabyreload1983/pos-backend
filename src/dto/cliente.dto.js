import { z } from "zod";

// Schema de validación con Zod
export const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  razon_social: z.string().optional().nullable(),
  tipo_documento: z.enum(["DNI", "CUIT", "CUIL", "Pasaporte"]).optional(),
  numero_documento: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  ciudad_id: z
    .number({
      required_error: "La ciudad es obligatoria",
      invalid_type_error: "Debe ser un número",
    })
    .int()
    .positive(),
  provincia_id: z
    .number({
      required_error: "La provincia es obligatoria",
      invalid_type_error: "Debe ser un número",
    })
    .int()
    .positive(),
  pais: z.string().optional().default("Argentina"),
  condicion_iva: z
    .enum([
      "Responsable Inscripto",
      "Monotributo",
      "Consumidor Final",
      "Exento",
    ])
    .optional(),
  cuit: z.string().optional().nullable(),
  activo: z.number().optional(),
});
