import Training from "../models/training.model.js";

export async function createTraining(req, res) {
  try {
    const data = req.body;
    const training = await Training.create(data);
    res.json({ success: true, training });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Failed to create training",
      });
  }
}

export async function getTraining(req, res) {
  try {
    const { id } = req.params;
    const training = await Training.findById(id).populate(
      "participants createdBy"
    );
    if (!training)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, training });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Failed to fetch training",
      });
  }
}
