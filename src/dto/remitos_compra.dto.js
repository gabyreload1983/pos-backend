import { z } from "zod";

export const itemRemitoCompraSchema = z.object({
  articulo_id: z.number().int().positive().optional(),
  detalle_compra_id: z.number().int().positive().optional(),
  cantidad: z.number().int().min(1),
  series: z.array(z.string().min(1)).optional(),
});

export const createRemitoCompraSchema = z.object({
  compra_id: z.number().int().positive().optional(),
  sucursal_id: z.number().int().positive(),
  observaciones: z.string().optional(),
  items: z.array(itemRemitoCompraSchema).min(1),
});
