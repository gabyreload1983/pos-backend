import { ApiError } from "../../utils/ApiError.js";
import {
  existeComprobanteProveedor,
  existeEnTabla,
} from "../../utils/dbHelpers.js";

export async function validarDataCompra({ data }) {
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

  if (
    await existeComprobanteProveedor(
      data.proveedor_id,
      data.punto_venta,
      data.numero_comprobante
    )
  ) {
    throw ApiError.conflict(
      `Ya existe una compra con ese punto de venta y número de comprobante para este proveedor`
    );
  }
}
