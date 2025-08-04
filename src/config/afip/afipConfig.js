// /src/config/afip/afipConfig.js
import Afip from "@afipsdk/afip.js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const certsPath = path.join(__dirname, "certs");

const afipConfig = {
  env: "homologation",
  CUIT: process.env.AFIP_CUIT || 30234567890,
  puntoVenta: process.env.AFIP_PUNTO_VENTA,
  certs: {
    cert: readFileSync(path.join(certsPath, "homologacion.pem"), "utf8"),
    key: readFileSync(path.join(certsPath, "homologacion.key"), "utf8"),
  },
};

export const afip = new Afip({
  CUIT: afipConfig.CUIT,
  cert: afipConfig.certs.cert,
  key: afipConfig.certs.key,
  env: afipConfig.env,
});
