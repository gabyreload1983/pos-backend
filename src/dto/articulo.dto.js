import { z } from "zod";

export const createArticuloSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  costo: z.number().positive(),
  iva_id: z.number().int(),
  moneda_id: z.number().int(),
  renta: z.number().min(0),
  precio_venta: z.number().positive(),
  categoria_id: z.number().int().optional().nullable(),
  marca_id: z.number().int().optional().nullable(),
  proveedor_id: z.number().int().optional().nullable(),
  codigo_barra: z.string().optional().nullable(),
  unidad_medida: z.string().optional().nullable(),
  controla_stock: z.boolean().optional(),
  activo: z.boolean().optional(),
});

export const updateArticuloSchema = createArticuloSchema.partial();
