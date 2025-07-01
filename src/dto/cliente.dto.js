import { z } from "zod";

// IDs de referencia (ajustar según tu base)
const CONSUMIDOR_FINAL_ID = 1;
const TIPO_DOCUMENTO_CUIT_ID = 2;

// Campos comunes para crear y actualizar cliente
const clienteCamposComunes = {
  nombre: z.string().optional().nullable(),
  apellido: z.string().optional().nullable(),
  razon_social: z.string().optional().nullable(),

  tipo_documento_id: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .positive("Debe ser un número válido")
    .nullable()
    .optional(),

  documento: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),

  condicion_iva_id: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .positive("Debe ser un ID válido")
    .nullable()
    .optional(),

  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),

  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),

  ciudad_id: z.number().int().positive().nullable().optional(),
  provincia_id: z.number().int().positive().nullable().optional(),
  activo: z.union([z.literal(1), z.literal(0)]).optional(),
};

// DTO para crear cliente
export const createClienteSchema = z.object({ ...clienteCamposComunes }).refine(
  (data) => {
    // Caso consumidor final
    if (data.condicion_iva_id === CONSUMIDOR_FINAL_ID) {
      return !!data.nombre?.trim() && !!data.apellido?.trim();
    }

    // Caso empresa (Monotributo, Responsable Inscripto, Exento)
    const razonOk = !!data.razon_social?.trim();
    const tipoDocOk = data.tipo_documento_id === TIPO_DOCUMENTO_CUIT_ID;
    const cuitOk = !!data.documento?.match(/^\d{11}$/);

    return razonOk && tipoDocOk && cuitOk;
  },
  {
    message: "Debe completar los campos requeridos según el tipo de cliente.",
    path: ["condicion_iva_id"],
  }
);

// DTO para actualizar cliente
export const updateClienteSchema = z.object({ ...clienteCamposComunes });
