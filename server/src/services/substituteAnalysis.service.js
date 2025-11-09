import Employee from "../models/employee.model.js";
import Performance from "../models/performance.model.js";

/**
 * Compute substitute candidates for a target employee or position.
 * payload: { targetEmployeeId?, topK = 5, scope: { department? }, weights: { designation:1, department:0.6, performance:1, experience:0.5 } }
 */
export async function computeSubstituteCandidates(payload = {}) {
  const {
    targetEmployeeId = null,
    topK = 5,
    scope = {},
    weights = {},
  } = payload || {};

  const w = Object.assign(
    {
      designation: 1.0,
      department: 0.6,
      performance: 1.0,
      experience: 0.4,
      skills: 1.2,
    },
    weights || {}
  );

  // Fetch target employee if provided to infer role/designation/department
  let target = null;
  if (targetEmployeeId) {
    try {
      target = await Employee.findById(targetEmployeeId)
        .select("department designation dateOfJoining skills")
        .lean();
    } catch (e) {
      target = null;
    }
  }

  // Build candidate query: active employees, optionally same department or broader scope
  const q = { status: "Active" };
  if (scope.department) q.department = scope.department;
  // Exclude target
  if (target && target._id) q._id = { $ne: target._id };

  const candidates = await Employee.find(q)
    .select(
      "name email department designation dateOfJoining leaveBalance skills"
    )
    .lean();

  // Fetch performance records for candidate set in one go
  const empIds = candidates.map((c) => c._id);
  const perfDocs = await Performance.find({ employee: { $in: empIds } })
    .select("employee rating kpiScore")
    .lean();

  const perfMap = new Map();
  for (const p of perfDocs) perfMap.set(String(p.employee), p);

  // compute metrics and score
  const now = Date.now();
  const scored = candidates.map((c) => {
    const perf = perfMap.get(String(c._id)) || { rating: 0, kpiScore: 0 };
    let score = 0;
    const details = {};

    // designation match
    const designationMatch =
      target &&
      target.designation &&
      String(target.designation) === String(c.designation);
    if (designationMatch) {
      score += w.designation;
      details.designationMatch = true;
    } else {
      details.designationMatch = false;
    }

    // department match
    const departmentMatch =
      target &&
      target.department &&
      String(target.department) === String(c.department);
    if (departmentMatch) {
      score += w.department;
      details.departmentMatch = true;
    } else if (
      scope.department &&
      String(scope.department) === String(c.department)
    ) {
      score += w.department * 0.6; // partial credit when scope explicitly requested
      details.departmentMatch = true;
    } else {
      details.departmentMatch = false;
    }

    // performance
    const perfScore = typeof perf.rating === "number" ? perf.rating / 5.0 : 0; // normalize 0..1 assuming rating out of 5
    score += perfScore * w.performance;
    details.performanceRating = perf.rating || 0;

    // skills matching: prefer explicit requiredSkills in payload, else use target.skills if available
    let skillMatchScore = 0;
    const requiredSkills =
      Array.isArray(payload.requiredSkills) && payload.requiredSkills.length
        ? payload.requiredSkills
        : target && Array.isArray(target.skills)
        ? target.skills
        : [];
    if (requiredSkills && requiredSkills.length > 0) {
      const candSkills = Array.isArray(c.skills) ? c.skills : [];
      const reqSet = new Set(
        requiredSkills.map((s) => String(s).toLowerCase().trim())
      );
      const candSet = new Set(
        candSkills.map((s) => String(s).toLowerCase().trim())
      );
      let matched = 0;
      for (const s of reqSet) if (candSet.has(s)) matched++;
      skillMatchScore = matched / requiredSkills.length; // 0..1
      score += skillMatchScore * w.skills;
    }
    details.skillMatch = Math.round((skillMatchScore || 0) * 100) / 100;

    // experience (years since dateOfJoining)
    let years = 0;
    if (c.dateOfJoining)
      years =
        (now - new Date(c.dateOfJoining).getTime()) /
        (1000 * 60 * 60 * 24 * 365);
    const expScore = Math.min(1, years / 10); // normalize assuming 10+ years caps
    score += expScore * w.experience;
    details.yearsExperience = Math.round(years * 10) / 10;

    return {
      employeeId: c._id,
      name: c.name,
      email: c.email,
      score: Math.round(score * 1000) / 1000,
      // include some useful metadata to the frontend (ids and skills)
      designation: c.designation || null,
      department: c.department || null,
      skills: Array.isArray(c.skills) ? c.skills : [],
      details,
    };
  });

  // sort descending and pick topK
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, Number(topK) || 5);

  return {
    target: target
      ? {
          id: target._id,
          department: target.department,
          designation: target.designation,
        }
      : null,
    candidates: top,
    meta: {
      computedAt: new Date().toISOString(),
      totalCandidates: scored.length,
    },
  };
}

export default { computeSubstituteCandidates };
