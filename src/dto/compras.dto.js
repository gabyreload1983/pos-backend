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
  punto_venta: z.number().int(),
  numero_comprobante: z.number().int(),
  total: z.number().nonnegative(),
  observaciones: z.string().optional(),
  items: z.array(itemCompraSchema).min(1),
  mueve_stock: z.union([z.literal(1), z.literal(0)]).default(1),
});

export const itemCompraDesdeRemitosSchema = z.object({
  articulo_id: z.number().int().positive(),
  costo_unitario: z.number().nonnegative(),
  cotizacion_dolar: z.number().nonnegative().nullable().optional(),
});

export const createCompraDesdeRemitosSchema = z.object({
  proveedor_id: z.number().int().positive(),
  sucursal_id: z.number().int().positive(),
  tipo_comprobante_id: z.number().int().positive(),
  punto_venta: z.number().int(),
  numero_comprobante: z.number().int(),
  total: z.number().nonnegative(),
  observaciones: z.string().optional(),
  remitos_id: z.array(z.number().int().positive()).min(1),
  items: z.array(itemCompraDesdeRemitosSchema).min(1),
});
