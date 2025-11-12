import express from "express";
import {
  getLeaves,
  applyLeave,
  respondLeave,
  assignSustitute,
  getEmployeesOnLeave,
  getMyLeaves,
} from "../controllers/leave.controller.js";
import { verifyAdminToken, verifyEmployeeToken } from "../middlewares/index.js";

const router = express.Router();

router.get("/", verifyAdminToken, getLeaves);
router.get("/my-leaves", verifyEmployeeToken, getMyLeaves);
router.post("/", verifyEmployeeToken, applyLeave);
router.patch("/:id", verifyAdminToken, respondLeave);
router.get("/employee", verifyAdminToken, getEmployeesOnLeave);
router.patch("/:id/substitute", verifyAdminToken, assignSustitute);
router.get(
  "/:id/substitute-candidates",
  verifyAdminToken,
  async (req, res, next) => {
    // Controller inline: compute substitute candidates for a leave
    try {
      const { id } = req.params;
      const Leave = (await import("../models/leave.model.js")).default;
      const Employee = (await import("../models/employee.model.js")).default;
      const substituteSvc = await import(
        "../services/substituteAnalysis.service.js"
      );

      const leave = await Leave.findById(id).lean();
      if (!leave)
        return res
          .status(404)
          .json({ success: false, message: "Leave not found" });

      const emp = await Employee.findById(leave.employee)
        .select("department skills")
        .lean();
      const payload = {
        targetEmployeeId: emp?._id || null,
        topK: 5,
        scope: {},
      };
      if (emp && emp.department) payload.scope.department = emp.department;
      if (emp && Array.isArray(emp.skills) && emp.skills.length)
        payload.requiredSkills = emp.skills;

      const result = await substituteSvc.default.computeSubstituteCandidates(
        payload
      );
      return res
        .status(200)
        .json({
          success: true,
          candidates: result.candidates,
          meta: result.meta,
        });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
