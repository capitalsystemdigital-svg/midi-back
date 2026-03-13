import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import apiRoutes from "./routes/apiRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware de Seguridad y Logging
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/v1", apiRoutes);

// Endpoint de prueba (Healthcheck)
app.get("/api/health", (req, res) => {
  res.json({ status: "MediSystem Backend ejecutándose 🚀" });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
