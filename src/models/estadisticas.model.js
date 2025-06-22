import { pool } from "../config/db.js";

export async function obtenerVentasPorDia(desde, hasta) {
  const [rows] = await pool.query(
    `SELECT DATE(fecha) AS fecha, tipo_pago, SUM(total) AS total
     FROM ventas
     WHERE fecha BETWEEN ? AND ?
     GROUP BY DATE(fecha), tipo_pago
     ORDER BY fecha ASC`,
    [desde, hasta]
  );
  return rows;
}

export async function obtenerTopArticulos(desde, hasta, limite = 10) {
  const [rows] = await pool.query(
    `SELECT a.descripcion AS articulo, SUM(dv.cantidad) AS total_vendido, SUM(dv.subtotal) AS total_facturado
     FROM detalle_venta dv
     JOIN ventas v ON dv.venta_id = v.id
     JOIN articulos a ON dv.articulo_id = a.id
     WHERE v.fecha BETWEEN ? AND ?
     GROUP BY a.id
     ORDER BY total_vendido DESC
     LIMIT ?`,
    [desde, hasta, parseInt(limite)]
  );
  return rows;
}

export async function obtenerTopClientes(desde, hasta, limite = 10) {
  const [rows] = await pool.query(
    `SELECT c.nombre, SUM(v.total) AS total_facturado, COUNT(v.id) AS cantidad_ventas
     FROM ventas v
     JOIN clientes c ON v.cliente_id = c.id
     WHERE v.fecha BETWEEN ? AND ?
     GROUP BY c.id
     ORDER BY total_facturado DESC
     LIMIT ?`,
    [desde, hasta, parseInt(limite)]
  );
  return rows;
}
