export function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol_id)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
}
