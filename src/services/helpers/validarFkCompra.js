import { ApiError } from "../../utils/ApiError.js";
import { existeEnTabla } from "../../utils/dbHelpers.js";

export async function validarFkCompra({ data }) {
  const errores = [];

  const proveedorOK = await existeEnTabla("proveedores", data.proveedor_id);
  if (!proveedorOK)
    errores.push({ campo: "proveedor_id", mensaje: "Proveedor no válido" });

  const sucursalOK = await existeEnTabla("sucursales", data.sucursal_id);
  if (!sucursalOK)
    errores.push({ campo: "sucursal_id", mensaje: "Sucursal no válida" });

  const tipoComprobanteOK = await existeEnTabla(
    "tipos_comprobante",
    data.tipo_comprobante_id
  );
  if (!tipoComprobanteOK)
    errores.push({
      campo: "tipo_comprobante_id",
      mensaje: "Tipo de comprobante no válido",
    });

  if (errores.length > 0) {
    throw ApiError.validation(errores);
  }
}
