import { z } from "zod";
import { TIPOS_AJUSTE } from "../constants/index.js";

const valoresPermitidos = Object.values(TIPOS_AJUSTE);

const itemSchema = z
  .object({
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
    series: z.array(z.string()).optional(),
  })
  .superRefine((item, ctx) => {
    if (item.series) {
      if (item.series.length !== item.cantidad) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["series"],
          message:
            "La cantidad de series debe coincidir con la cantidad de artículos",
        });
      }
      const duplicados = item.series.filter(
        (s, i, arr) => arr.indexOf(s) !== i
      );
      if (duplicados.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["series"],
          message: `Se encontraron series duplicadas: ${[
            ...new Set(duplicados),
          ].join(", ")}`,
        });
      }
    }
  });

export const ventaSchema = z
  .object({
    cliente_id: z.number().int().positive(),

    tipo_pago_id: z
      .number()
      .int()
      .positive("Debe seleccionar un tipo de pago válido"),

    tipo_comprobante_id: z
      .number()
      .int()
      .positive("Debe seleccionar un tipo de comprobante válido")
      .optional()
      .nullable(),

    punto_venta: z
      .number()
      .int()
      .positive("Debe seleccionar un punto de venta válido")
      .optional()
      .nullable(),

    observaciones: z.string().max(1000).optional().nullable(),

    cotizacion_usada_id: z.number().int().positive(),

    items: z
      .array(itemSchema)
      .min(1, { message: "Debe haber al menos un ítem en la venta" }),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_comprobante_id != null && data.punto_venta == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["punto_venta"],
        message: "Punto de venta es obligatorio cuando hay tipo_comprobante_id",
      });
    }
  });
