import { catchErrors, myCache } from "../utils/index.js";
import Promotion from "../models/promotion.model.js";

const createPromotion = catchErrors(async (req, res) => {
  const { employee, previousDesignation, newDesignation, promotionDate, effectiveDate, salaryAdjustment, status, documentUrl, remarks, createdAt } = req.body;

  if (!employee || !previousDesignation || !newDesignation || !promotionDate || !effectiveDate) {
    throw new Error("Missing required fields: employee, previousDesignation, newDesignation, promotionDate, effectiveDate");
  }

  const data = {
    employee,
    previousDesignation,
    newDesignation,
    promotionDate: new Date(promotionDate),
    effectiveDate: new Date(effectiveDate),
    salaryAdjustment: salaryAdjustment || 0,
    status: status || "Pending",
    documentUrl: documentUrl || null,
    remarks: remarks || "",
  };
  if (createdAt) data.createdAt = new Date(createdAt);

  const promotion = await Promotion.create(data);
  const populated = await Promotion.findById(promotion._id)
    .populate("employee", "name employeeId email")
    .populate("previousDesignation", "name")
    .populate("newDesignation", "name");

  myCache.del("promotions");

  return res.status(201).json({ success: true, message: "Promotion created successfully", promotion: populated });
});

const getAllPromotions = catchErrors(async (req, res) => {
  const cacheKey = "promotions";
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({ success: true, message: "Promotions fetched (cache)", promotions: cached });
  }

  const promotions = await Promotion.find()
    .populate("employee", "name employeeId email")
    .populate("previousDesignation", "name")
    .populate("newDesignation", "name")
    .lean();
  myCache.set(cacheKey, promotions);

  return res.status(200).json({ success: true, message: "Promotions fetched successfully", promotions });
});

const getPromotionById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide promotion id");
  const promotion = await Promotion.findById(id)
    .populate("employee", "name employeeId email")
    .populate("previousDesignation", "name")
    .populate("newDesignation", "name");
  return res.status(200).json({ success: true, message: "Promotion fetched", promotion });
});

const updatePromotion = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { employee, previousDesignation, newDesignation, promotionDate, effectiveDate, salaryAdjustment, status, documentUrl, remarks, createdAt } = req.body;
  if (!id) throw new Error("Please provide promotion id");

  const updateData = {};
  if (employee) updateData.employee = employee;
  if (previousDesignation) updateData.previousDesignation = previousDesignation;
  if (newDesignation) updateData.newDesignation = newDesignation;
  if (promotionDate) updateData.promotionDate = new Date(promotionDate);
  if (effectiveDate) updateData.effectiveDate = new Date(effectiveDate);
  if (salaryAdjustment !== undefined) updateData.salaryAdjustment = salaryAdjustment;
  if (status) updateData.status = status;
  if (documentUrl !== undefined) updateData.documentUrl = documentUrl;
  if (remarks !== undefined) updateData.remarks = remarks;
  if (createdAt) updateData.createdAt = new Date(createdAt);

  const promotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true })
    .populate("employee", "name employeeId email")
    .populate("previousDesignation", "name")
    .populate("newDesignation", "name");

  myCache.del("promotions");

  return res.status(200).json({ success: true, message: "Promotion updated", promotion });
});

const deletePromotion = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Please provide promotion id");
  await Promotion.findByIdAndDelete(id);
  myCache.del("promotions");
  return res.status(200).json({ success: true, message: "Promotion deleted" });
});

export { createPromotion, getAllPromotions, getPromotionById, updatePromotion, deletePromotion };
