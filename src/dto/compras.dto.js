import { z } from "zod";

export const itemCompraSchema = z.object({
  articulo_id: z.number().int().positive(),
  cantidad: z.number().int().min(1),
  costo_unitario: z.number().nonnegative(),
  moneda_id: z.number().int().positive(),
  cotizacion_dolar: z.number().nonnegative().nullable().optional(),
  series: z.array(z.string().min(1)).optional(),
});

export const createCompraSchema = z.object({
  proveedor_id: z.number().int().positive(),
  sucursal_id: z.number().int().positive(),
  tipo_comprobante_id: z.number().int().positive(),
  punto_venta: z.number().int().nullable().optional(),
  numero_comprobante: z.number().int().nullable().optional(),
  total: z.number().nonnegative(),
  observaciones: z.string().optional(),
  items: z.array(itemCompraSchema).min(1),
});
