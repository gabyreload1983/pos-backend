import { z } from "zod";

export const createArticuloSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().max(65535).optional().nullable(),
  costo: z.number().min(0).max(99999999.99),
  renta: z.number().min(0).max(999.99),
  iva_aliquota_id: z.number().int(),
  moneda_id: z.number().int(),
  categoria_id: z.number().int().optional().nullable(),
  marca_id: z.number().int().optional().nullable(),
  proveedor_id: z.number().int().optional().nullable(),
  codigo_barra: z.string().max(50).optional().nullable(),
  unidad_medida: z.string().max(20).optional().nullable(),
  controla_stock: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === "1")
    .optional(),

  controla_stock: z
    .union([z.boolean(), z.string(), z.number()])
    .transform((val) => val === true || val === "1" || val === 1)
    .optional(),

  tiene_nro_serie: z
    .union([z.boolean(), z.string(), z.number()])
    .transform((val) => val === true || val === "1" || val === 1)
    .optional(),

  slug: z.string().max(150).optional().nullable(),
  descripcion_larga: z.string().max(65535).optional().nullable(),
  seo_title: z.string().max(150).optional().nullable(),
  seo_description: z.string().max(65535).optional().nullable(),
  external_id: z.string().max(100).optional().nullable(),
  publicado_web: z.union([z.literal(1), z.literal(0)]).optional(),
});

export const updateArticuloSchema = createArticuloSchema
  .extend({
    activo: z.union([z.literal(1), z.literal(0)]).optional(),
  })
  .partial();
