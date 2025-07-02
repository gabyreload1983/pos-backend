import { z } from "zod";

export const createArticuloSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().max(65535).optional().nullable(),
  costo: z.number().min(0).max(99999999.99),
  renta: z.number().min(0).max(999.99),
  precio_venta: z.number().min(0).max(99999999.99),
  iva_aliquota_id: z.number().int(),
  moneda_id: z.number().int(),
  categoria_id: z.number().int().optional().nullable(),
  marca_id: z.number().int().optional().nullable(),
  proveedor_id: z.number().int().optional().nullable(),
  codigo_barra: z.string().max(50).optional().nullable(),
  unidad_medida: z.string().max(20).optional().nullable(),
  controla_stock: z.boolean().optional(),
  tiene_nro_serie: z.boolean().optional(),
  activo: z.boolean().optional(),
});

export const updateArticuloSchema = createArticuloSchema.partial();
