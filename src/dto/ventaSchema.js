import { z } from "zod";

import { TIPOS_AJUSTE } from "../constants/index.js";

const valoresPermitidos = Object.values(TIPOS_AJUSTE);

export const ventaSchema = z.object({
  cliente_id: z.number().int().positive(),

  tipo_pago_id: z
    .number()
    .int()
    .positive("Debe seleccionar un tipo de pago válido"),

  observaciones: z.string().max(1000).optional().nullable(),

  cotizacion_usada_id: z.number().int().positive(),

  items: z
    .array(
      z.object({
        articulo_id: z.number().int().positive(),
        cantidad: z.number().int().positive(),

        precio_base: z.number().positive(),

        tipo_ajuste_id: z
          .number()
          .int()
          .refine((val) => valoresPermitidos.includes(val), {
            message: "Tipo de ajuste inválido",
          }),

        porcentaje_ajuste: z
          .number()
          .min(0)
          .nullable()
          .transform((val) => val ?? 0),
      })
    )
    .min(1, { message: "Debe haber al menos un ítem en la venta" }),
});
