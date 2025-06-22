
import { realizarArqueo, listarArqueos } from '../services/arqueo.service.js';

export async function postArqueo(req, res) {
  try {
    const id = await realizarArqueo(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getArqueos(req, res) {
  try {
    const data = await listarArqueos(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
