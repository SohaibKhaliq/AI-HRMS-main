import express from "express";
import {
  getHolidays,
  createHoliday,
  getHolidayById,
  updateHoliday,
  deleteHolidayById,
} from "../controllers/holiday.controller.js";
import { verifyAdminToken } from "../middlewares/index.js";

const router = express.Router();

router.get("/", getHolidays);
router.get("/:id", getHolidayById);
router.post("/", verifyAdminToken, createHoliday);
router.patch("/:id", verifyAdminToken, updateHoliday);
router.delete("/:id", verifyAdminToken, deleteHolidayById);

export default router;
