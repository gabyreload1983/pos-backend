import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/users.routes.js";
import clienteRoutes from "./routes/clientes.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import articulosRoutes from "./routes/articulos.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import cuentas_corrientesRoutes from "./routes/cuentas_corrientes.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/articulos", articulosRoutes);
app.use("/api/ventasRoutes", ventasRoutes);
app.use("/api/cuentas-corrientesRoutes", cuentas_corrientesRoutes);
app.use("/api/pagos", pagosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
