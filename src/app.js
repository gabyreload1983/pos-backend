import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/users.routes.js";
import clienteRoutes from "./routes/clientes.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import articulosRoutes from "./routes/articulos.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import cuentas_corrientesRoutes from "./routes/cuentas_corrientes.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import cajasRoutes from "./routes/cajas.routes.js";
import arqueoRoutes from "./routes/arqueo.routes.js";
import resumenRoutes from "./routes/resumen.routes.js";
import estadisticasRoutes from "./routes/estadisticas.routes.js";
import provinciasRoutes from "./routes/provincias.routes.js";
import ciudadesRoutes from "./routes/ciudades.routes.js";
import marcasRoutes from "./routes/marcas.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import monedasRoutes from "./routes/monedas.routes.js";
import ivaAliquotasRoutes from "./routes/ivaAliquotas.routes.js";
import condicionesIvaRoutes from "./routes/condicionesIva.routes.js";
import tiposDocumentoRoutes from "./routes/tiposDocumento.routes.js";
import ecommerceRoutes from "./routes/ecommerce.routes.js";

import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/articulos", articulosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/cuentas-corrientes", cuentas_corrientesRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/cajas", cajasRoutes);
app.use("/api/arqueo", arqueoRoutes);
app.use("/api/resumen", resumenRoutes);
app.use("/api/estadisticas", estadisticasRoutes);

app.use("/api/provincias", provinciasRoutes);
app.use("/api/ciudades", ciudadesRoutes);
app.use("/api/marcas", marcasRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/monedas", monedasRoutes);
app.use("/api/iva-aliquotas", ivaAliquotasRoutes);
app.use("/api/condiciones-iva", condicionesIvaRoutes);
app.use("/api/tipos-documento", tiposDocumentoRoutes);

app.use("/api/ecommerce", ecommerceRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
