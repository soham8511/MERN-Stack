// routes/resources.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Resource = require("../models/Resource");
const auth = require("../middleware/auth");
 // OR "../middleware" or "../middleware.js"
 // 👈 adjust path if needed

// Helper: build updates object only with provided fields
const buildUpdates = (body) => {
  const updates = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category !== undefined) updates.category = body.category;
  if (body.status !== undefined) updates.status = body.status;
  if (body.amount !== undefined) updates.amount = body.amount;
  return updates;
};

// =========================
//  Create Resource (POST)
//  POST /api/resources
//  Private
// =========================
router.post(
  "/",
  auth,
  [
    body("title", "Title is required").notEmpty(),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, category, status, amount } = req.body;

      const resource = new Resource({
        title,
        description,
        category,
        status,
        amount,
        createdBy: req.user.id,
      });

      await resource.save();
      return res.status(201).json(resource);
    } catch (err) {
      console.error("Create Resource Error:", err);
      return res.status(500).send("Server Error");
    }
  }
);

// =========================
//  Get All Resources (GET)
//  GET /api/resources
//  Private
// =========================
router.get("/", auth, async (req, res) => {
  try {
    const resources = await Resource.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(resources);
  } catch (err) {
    console.error("Get All Resources Error:", err);
    return res.status(500).send("Server Error");
  }
});

// =========================
//  Get One Resource (GET)
//  GET /api/resources/:id
//  Private
// =========================
router.get("/:id", auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!resource) {
      return res.status(404).json({ msg: "Resource not found" });
    }

    return res.json(resource);
  } catch (err) {
    console.error("Get Resource Error:", err);
    return res.status(500).send("Server Error");
  }
});

// =========================
//  Update Resource (PUT)
//  PUT /api/resources/:id
//  Private
// =========================
router.put("/:id", auth, async (req, res) => {
  try {
    const updates = buildUpdates(req.body);

    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ msg: "Resource not found" });
    }

    return res.json(resource);
  } catch (err) {
    console.error("Update Resource Error:", err);
    return res.status(500).send("Server Error");
  }
});

// =========================
//  Delete Resource (DELETE)
//  DELETE /api/resources/:id
//  Private
// =========================
// DELETE /api/resources/:id  (Delete resource)
// DELETE /api/resources/:id
// Delete a resource that belongs to the logged-in user
router.delete("/:id", auth, async (req, res) => {
  try {
    const resourceId = req.params.id;

    // 1) Find the resource
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ msg: "Resource not found" });
    }

    // 2) Make sure this resource belongs to the logged-in user
    if (resource.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to delete this resource" });
    }

    // 3) Delete it
    await resource.deleteOne();

    return res.json({ msg: "Resource deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
