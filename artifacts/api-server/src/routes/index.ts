import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import machinesRouter from "./machines.js";
import trucksRouter from "./trucks.js";
import harvestRouter from "./harvest.js";
import transportRouter from "./transport.js";
import fuelingRouter from "./fueling.js";
import productsRouter from "./products.js";
import stockMovementsRouter from "./stock-movements.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/machines", machinesRouter);
router.use("/trucks", trucksRouter);
router.use("/harvest", harvestRouter);
router.use("/transport", transportRouter);
router.use("/fueling", fuelingRouter);
router.use("/products", productsRouter);
router.use("/stock-movements", stockMovementsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
