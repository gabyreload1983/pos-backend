import { registrarVenta, listarVentas, obtenerVenta } from '../services/ventas.service.js';

export async function getVentas(req, res) {
  try {
    const ventas = await listarVentas();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar las ventas' });
  }
}

export async function getVenta(req, res) {
  try {
    const venta = await obtenerVenta(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
}

export async function createVenta(req, res) {
  try {
    const venta_id = await registrarVenta(req.body, req.user.id);
    res.status(201).json({ venta_id });
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar la venta' });
  }
}
