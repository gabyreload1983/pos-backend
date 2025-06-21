import express from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/users.routes.js";
import clienteRoutes from "./routes/clientes.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import articulosRoutes from "./routes/articulos.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/articulos", articulosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
