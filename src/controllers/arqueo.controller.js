import { realizarArqueo, listarArqueos } from "../services/arqueo.service.js";

export async function postArqueo(req, res, next) {
  try {
    const id = await realizarArqueo(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

export async function getArqueos(req, res, next) {
  try {
    const data = await listarArqueos(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
