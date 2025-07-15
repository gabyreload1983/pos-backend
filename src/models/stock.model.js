import { pool } from "../config/db.js";

export async function obtenerStockPorSucursal() {
  const [rows] = await pool.query(`
    SELECT s.id, a.nombre AS articulo, su.nombre AS sucursal, s.cantidad
    FROM stock s
    JOIN articulos a ON s.articulo_id = a.id
    JOIN sucursales su ON s.sucursal_id = su.id
    ORDER BY su.nombre, a.nombre
  `);
  return rows;
}

export async function ajustarStock({ articulo_id, sucursal_id, cantidad }) {
  const [rows] = await pool.query(
    `
    UPDATE stock SET cantidad = ? 
    WHERE articulo_id = ? AND sucursal_id = ?`,
    [cantidad, articulo_id, sucursal_id]
  );
  return rows.affectedRows;
}

export async function obtenerStockArticuloSucursal(articulo_id, sucursal_id) {
  const [rows] = await pool.query(
    `SELECT * FROM stock WHERE articulo_id = ? AND sucursal_id = ?`,
    [articulo_id, sucursal_id]
  );
  return rows[0] || null;
}

export async function crearRegistroStock({
  articulo_id,
  sucursal_id,
  cantidad,
}) {
  const [result] = await pool.query(
    `INSERT INTO stock (articulo_id, sucursal_id, cantidad) VALUES (?, ?, ?)`,
    [articulo_id, sucursal_id, cantidad]
  );
  return result.insertId;
}

// Actualiza el stock total en la tabla stock
export async function actualizarStock(
  connection,
  articulo_id,
  sucursal_id,
  cantidad
) {
  const [rows] = await connection.query(
    `SELECT * FROM stock WHERE articulo_id = ? AND sucursal_id = ?`,
    [articulo_id, sucursal_id]
  );

  if (rows.length > 0) {
    await connection.query(
      `UPDATE stock SET cantidad = cantidad + ? WHERE articulo_id = ? AND sucursal_id = ?`,
      [cantidad, articulo_id, sucursal_id]
    );
  } else {
    await connection.query(
      `INSERT INTO stock (articulo_id, sucursal_id, cantidad) VALUES (?, ?, ?)`,
      [articulo_id, sucursal_id, cantidad]
    );
  }
}

// Registra el movimiento de entrada de stock
export async function registrarMovimientoStock(connection, data) {
  await connection.query(
    `INSERT INTO movimientos_stock (articulo_id, sucursal_id, cantidad, tipo, origen_id, origen_id_externo, observaciones)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.articulo_id,
      data.sucursal_id,
      data.cantidad,
      data.tipo,
      data.origen_id,
      data.origen_id_externo,
      data.observaciones || null,
    ]
  );
}

export async function obtenerComprasPorProveedor(proveedor_id) {
  const [rows] = await pool.query(
    `SELECT c.id, c.fecha, c.tipo_comprobante, c.nro_comprobante, c.total, c.tipo_pago,
            u.nombre AS usuario
     FROM compras c
     JOIN usuarios u ON c.usuario_id = u.id
     WHERE c.proveedor_id = ?
     ORDER BY c.fecha DESC, c.id DESC`,
    [proveedor_id]
  );
  return rows;
}

export async function descontarStock(articulo_id, sucursal_id, cantidad) {
  await pool.query(
    `UPDATE stock SET cantidad = cantidad - ? WHERE articulo_id = ? AND sucursal_id = ?`,
    [cantidad, articulo_id, sucursal_id]
  );
}
