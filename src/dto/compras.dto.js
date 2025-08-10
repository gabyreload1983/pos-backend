import { z } from "zod";

export const itemCompraSchema = z.object({
  articulo_id: z.number().int().positive(),
  cantidad: z.number().int().min(1),
  costo_unitario: z.number().nonnegative(),
  series: z.array(z.string().min(1)).optional(),
});

export const createCompraSchema = z.object({
  proveedor_id: z.number().int().positive(),
  sucursal_id: z.number().int().positive(),
  tipo_comprobante_id: z.number().int().positive(),
  punto_venta: z.number().int(),
  numero_comprobante: z.number().int(),
  total: z.number().positive(), //TODO calcular en el backend, que no venga del frontend
  observaciones: z.string().optional(),
  mueve_stock: z.union([z.literal(1), z.literal(0)]).default(1),
  actualizar_costo: z.union([z.literal(1), z.literal(0)]).default(1),
  tasa_cambio: z.number().positive(),
  items: z.array(itemCompraSchema).min(1),
});

export const itemCompraDesdeRemitosSchema = z.object({
  articulo_id: z.number().int().positive(),
  costo_unitario: z.number().positive(),
});

export const createCompraDesdeRemitosSchema = z.object({
  proveedor_id: z.number().int().positive(),
  sucursal_id: z.number().int().positive(),
  tipo_comprobante_id: z.number().int().positive(),
  punto_venta: z.number().int(),
  numero_comprobante: z.number().int(),
  total: z.number().positive(), //TODO calcular en el backend, que no venga del frontend
  observaciones: z.string().optional(),
  remitos_id: z.array(z.number().int().positive()).min(1),
  actualizar_costo: z.union([z.literal(1), z.literal(0)]).default(1),
  tasa_cambio: z.number().positive(),
  items: z.array(itemCompraDesdeRemitosSchema).min(1),
});
