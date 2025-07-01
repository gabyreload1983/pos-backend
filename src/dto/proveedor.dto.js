import { z } from "zod";

// Constantes de ID
const CONDICION_IVA_IDS = {
  CONSUMIDOR_FINAL: 1,
  RESPONSABLE_INSCRIPTO: 2,
  MONOTRIBUTO: 3,
  EXENTO: 4,
};

// Base sin lógica
const baseProveedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  razon_social: z.string().min(1, "La razón social es obligatoria"),

  cuit: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string()
      .regex(/^\d+$/, "El CUIT debe contener solo números")
      .nullable()
      .optional()
  ),

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
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.null()])
    .optional()
    .transform((val) => (val === "" ? null : val)),

  activo: z.union([z.literal(1), z.literal(0)]).optional(),
});

// Aplico validación condicional con refine
export const createProveedorSchema = baseProveedorSchema.refine(
  (data) => {
    const requiere11 = [2, 3, 4].includes(data.condicion_iva_id);
    const esConsFinal =
      data.condicion_iva_id === 1 || data.condicion_iva_id === null;

    if (requiere11) {
      return data.cuit && data.cuit.length === 11;
    }

    if (esConsFinal) {
      return (
        data.cuit === null ||
        data.cuit === undefined ||
        data.cuit.length === 8 ||
        data.cuit.length === 11
      );
    }

    return true;
  },
  {
    message:
      "El CUIT debe tener 11 dígitos para esta condición IVA, o 8 u 11 si es Consumidor Final",
    path: ["cuit"],
  }
);

// El `.partial()` ahora funciona correctamente
export const updateProveedorSchema = baseProveedorSchema.partial();
