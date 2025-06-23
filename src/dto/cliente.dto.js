export function parseClienteDTO(data) {
  return {
    nombre: data.nombre ?? "",
    apellido: data.apellido ?? "",
    razon_social: data.razon_social ?? "",
    tipo_documento: data.tipo_documento ?? "DNI",
    numero_documento: data.numero_documento ?? "",
    email: data.email ?? "",
    telefono: data.telefono ?? "",
    direccion: data.direccion ?? "",
    ciudad_id: data.ciudad_id ? Number(data.ciudad_id) : null,
    provincia_id: data.provincia_id ? Number(data.provincia_id) : null,
    pais: data.pais ?? "Argentina",
    condicion_iva: data.condicion_iva ?? "Consumidor Final",
    cuit: data.cuit ?? "",
  };
}
