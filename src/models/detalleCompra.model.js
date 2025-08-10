export async function obtenerIdDetalleCompra({
  connection,
  compra_id,
  articulo_id,
}) {
  const [[detalle]] = await connection.query(
    `SELECT id FROM detalle_compra 
       WHERE compra_id = ? AND articulo_id = ? 
       ORDER BY id DESC LIMIT 1`,
    [compra_id, articulo_id]
  );

  return detalle?.id || null;
}
