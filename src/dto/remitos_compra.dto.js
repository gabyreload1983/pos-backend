import { z } from "zod";

export const itemRemitoCompraSchema = z.object({
  detalle_compra_id: z.number().int().positive(),
  cantidad: z.number().int().min(1),
  series: z.array(z.string().min(1)).optional(),
});

export const createRemitoCompraSchema = z.object({
  compra_id: z.number().int().positive(),
  sucursal_id: z.number().int().positive(),
  observaciones: z.string().optional(),
  items: z.array(itemRemitoCompraSchema).min(1),
});
