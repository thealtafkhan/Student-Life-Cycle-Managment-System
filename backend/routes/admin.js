import express from "express";
import { auth, roleAuth } from "../middleware/auth.js";

import User from "../models/User.js";
import Application from "../models/Application.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Fee from "../models/Fee.js";
import Hostel from "../models/Hostel.js";
import Faculty from "../models/Faculty.js";

const router = express.Router();

/* =====================================================
   ADMIN DASHBOARD STATS (FIXED & ACCURATE)
   ===================================================== */
router.get("/dashboard-stats", auth, roleAuth("admin"), async (req, res) => {
  try {
    /* ---------------- APPLICATIONS ---------------- */
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({
      status: "pending",
    });
    const selectedApplications = await Application.countDocuments({
      status: "selected",
    });

    /* ---------------- STUDENTS ---------------- */
    const totalStudents = await User.countDocuments({ role: "student" });

    /* ---------------- COURSES & SEATS (FIXED LOGIC) ---------------- */
    const courses = await Course.find({ isActive: true });

    const totalSeats = courses.reduce(
      (sum, course) => sum + (course.totalSeats || 0),
      0,
    );

    // Count ONLY active enrollments as filled seats
    const filledSeats = await Enrollment.countDocuments({
      status: "active", // ⚠️ must match your schema
    });

    const availableSeats = Math.max(totalSeats - filledSeats, 0);

    /* ---------------- FEES ---------------- */
    const feeAgg = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]);

    const totalFees = feeAgg[0]?.totalAmount || 0;
    const paidFees = feeAgg[0]?.totalPaid || 0;
    const pendingFees = totalFees - paidFees;

    /* ---------------- HOSTELS ---------------- */
    // const hostels = await Hostel.find({ isActive: true });

    // const hostelCapacity = hostels.reduce(
    //   (sum, h) => sum + (h.totalRooms || 0),
    //   0
    // );

    // const hostelOccupied = hostels.reduce(
    //   (sum, h) =>
    //     sum + ((h.totalRooms || 0) - (h.availableRooms || 0)),
    //   0
    // );

    // const hostelAvailable = Math.max(hostelCapacity - hostelOccupied, 0);
    /* ---------------- HOSTELS ---------------- */
    const hostels = await Hostel.find({ isActive: true });

    const hostelCapacity = hostels.reduce((sum, h) => {
      const totalRooms = Number(h.totalRooms);
      return sum + (Number.isFinite(totalRooms) ? totalRooms : 0);
    }, 0);

    const hostelAvailable = hostels.reduce((sum, h) => {
      const availableRooms = Number(h.availableRooms);
      return sum + (Number.isFinite(availableRooms) ? availableRooms : 0);
      
    }, 0);

    const hostelOccupied = Math.max(hostelCapacity - hostelAvailable, 0);
    console.log("occ",hostelOccupied)
    /* ---------------- FACULTY ---------------- */
    const totalFaculty = await Faculty.countDocuments({ isActive: true });

    /* ---------------- RESPONSE ---------------- */
    res.json({
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        selected: selectedApplications,
      },
      students: {
        total: totalStudents,
      },
      courses: {
        total: courses.length,
        totalSeats,
        filledSeats,
        availableSeats,
      },
      fees: {
        total: totalFees,
        paid: paidFees,
        pending: pendingFees,
      },
      hostels: {
        total: hostels.length,
        capacity: hostelCapacity,
        occupied: hostelOccupied,
        available: hostelAvailable,
      },
      faculty: {
        total: totalFaculty,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Failed to load dashboard statistics" });
  }
});

/* =====================================================
   COURSE-WISE ENROLLMENT STATS (FIXED)
   ===================================================== */
router.get("/course-stats", auth, roleAuth("admin"), async (req, res) => {
  try {
    const stats = await Enrollment.aggregate([
      {
        $match: { status: "active" }, // only active enrollments
      },
      {
        $group: {
          _id: "$courseId",
          studentCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          courseName: "$course.name",
          courseCode: "$course.code",
          totalSeats: "$course.totalSeats",
          filledSeats: "$studentCount",
          availableSeats: {
            $subtract: ["$course.totalSeats", "$studentCount"],
          },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Course Stats Error:", error);
    res.status(500).json({ error: "Failed to load course statistics" });
  }
});

export default router;
