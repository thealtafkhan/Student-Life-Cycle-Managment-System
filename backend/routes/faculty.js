import express from "express";
import { auth, roleAuth } from "../middleware/auth.js";
import Faculty from "../models/Faculty.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";

const router = express.Router();

// Create faculty (Admin)
router.post("/", auth, roleAuth("admin"), async (req, res) => {
  try {
    const { email, password, fullName, phone, ...facultyData } = req.body;

    // Create user account
    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: "faculty",
    });

    await user.save();

    // Create faculty profile
    const faculty = new Faculty({
      userId: user._id,
      ...facultyData,
    });

    await faculty.save();

    res.status(201).json({
      message: "Faculty created successfully",
      faculty,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update faculty (Admin only)
router.put("/:id", auth, roleAuth("admin"), async (req, res) => {
  try {
    const { email, fullName, phone, ...facultyData } = req.body;

    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Update user details if provided
    if (email || fullName || phone) {
      const userUpdate = {};
      if (email) userUpdate.email = email;
      if (fullName) userUpdate.fullName = fullName;
      if (phone) userUpdate.phone = phone;

      await User.findByIdAndUpdate(faculty.userId, userUpdate);
    }

    // Update faculty profile
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      facultyData,
      { new: true, runValidators: true },
    )
      .populate("userId", "fullName email phone")
      .populate("departmentId", "name code")
      .populate("assignedSubjects", "name code");

    res.json({
      message: "Faculty updated successfully",
      faculty: updatedFaculty,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete faculty (Admin only) - Soft delete
// router.delete('/:id', auth, roleAuth('admin'), async (req, res) => {
//   try {
//     const faculty = await Faculty.findById(req.params.id);

//     if (!faculty) {
//       return res.status(404).json({ error: 'Faculty not found' });
//     }

//     // Soft delete faculty profile
//     await Faculty.findByIdAndUpdate(
//       req.params.id,
//       { isActive: false },
//       { new: true }
//     );

//     // Deactivate user account
//     await User.findByIdAndUpdate(
//       faculty.userId,
//       { isActive: false }
//     );

//     res.json({ message: 'Faculty deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.delete("/:id", auth, roleAuth("admin"), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const timestamp = Date.now();

    /* ---------------- SOFT DELETE FACULTY ---------------- */
    await Faculty.findByIdAndUpdate(req.params.id, {
      isActive: false,
      employeeId: `${faculty.employeeId}_deleted_${timestamp}`,
    });

    /* ---------------- SOFT DELETE USER ---------------- */
    await User.findByIdAndUpdate(faculty.userId, {
      isActive: false,
      email: `deleted_${timestamp}_${faculty.userId}`,
    });

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all faculty (Admin)
router.get("/", auth, roleAuth("admin"), async (req, res) => {
  try {
    const faculties = await Faculty.find({ isActive: true })
      .populate("userId", "fullName email phone")
      .populate("departmentId", "name code")
      .populate("assignedSubjects", "name code");

    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my profile (Faculty)
router.get("/my-profile", auth, roleAuth("faculty"), async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.userId })
      .populate("userId", "fullName email phone")
      .populate("departmentId", "name code")
      .populate("assignedSubjects", "name code semester credits");

    if (!faculty) {
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign subjects to faculty (Admin)
router.post(
  "/:id/assign-subjects",
  auth,
  roleAuth("admin"),
  async (req, res) => {
    try {
      const { subjectIds } = req.body;

      const faculty = await Faculty.findByIdAndUpdate(
        req.params.id,
        { assignedSubjects: subjectIds },
        { new: true },
      ).populate("assignedSubjects");

      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      res.json({
        message: "Subjects assigned successfully",
        faculty,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get students for my subjects (Faculty)
router.get("/my-students", auth, roleAuth("faculty"), async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userId: req.userId });
    if (!faculty) {
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    // Get subjects
    const subjects = await Subject.find({
      _id: { $in: faculty.assignedSubjects },
    });
    const courseIds = [...new Set(subjects.map((s) => s.courseId))];

    // Get enrollments
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      status: "active",
    })
      .populate("studentId", "fullName email phone")
      .populate("courseId", "name code");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
