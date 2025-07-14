import { z } from "zod";

export const ventaSchema = z.object({
  cliente_id: z.number().int().positive(),

  tipo_pago: z.enum([
    "efectivo",
    "tarjeta",
    "transferencia",
    "cuenta corriente",
    "otro",
  ]),

  observaciones: z.string().max(1000).optional().nullable(),

  cotizacion_usada_id: z.number().int().positive(),

  items: z
    .array(
      z.object({
        articulo_id: z.number().int().positive(),
        cantidad: z.number().int().positive(),

        precio_base: z.number().positive(),
        tipo_ajuste: z.enum(["ninguno", "descuento", "recargo"]),
        porcentaje_ajuste: z.number().min(0).default(0),

        precio_unitario: z.number().positive(),

        moneda_id: z.number().int().positive(),
      })
    )
    .min(1, { message: "Debe haber al menos un ítem en la venta" }),
});
