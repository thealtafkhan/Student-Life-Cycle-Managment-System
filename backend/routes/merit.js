import express from 'express';
import { auth, roleAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import HostelAllocation from '../models/HostelAllocation.js';
import Hostel from '../models/Hostel.js';
import Notification from '../models/Notification.js';

const router = express.Router();

/** 
// Generate merit list (Admin only)
router.post('/generate', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { courseId, admissionYear } = req.body;

    const year = admissionYear || new Date().getFullYear();

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get all pending applications for this course
    const applications = await Application.find({
      courseId,
      status: 'pending',
      admissionYear: year,
      percentage: { $gte: course.eligibilityPercentage }
    })
      .populate('userId', 'fullName email phone')
      .sort({ percentage: -1, applicationDate: 1 });

    if (applications.length === 0) {
      return res.status(400).json({ error: 'No eligible applications found' });
    }

    // Calculate merit and select candidates
    const totalSeats = course.availableSeats;
    const selectedCount = Math.min(applications.length, totalSeats);
    const meritList = [];
    
    let enrollmentCounter = await Enrollment.countDocuments({ enrollmentYear: year });
    let rollCounter = await Enrollment.countDocuments({ 
      courseId,
      enrollmentYear: year 
    });

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const rank = i + 1;
      const isSelected = i < selectedCount;

      // Update application
      app.meritRank = rank;
      app.status = isSelected ? 'selected' : 'rejected';
      await app.save();

      meritList.push({
        rank,
        applicationId: app._id,
        student: app.userId,
        percentage: app.percentage,
        status: app.status
      });

      if (isSelected) {
        // Update user role to student
        await User.findByIdAndUpdate(app.userId._id, { role: 'student' });

        // Create enrollment
        enrollmentCounter++;
        rollCounter++;
        
        const enrollmentNo = `${year}${String(enrollmentCounter).padStart(5, '0')}`;
        const rollNo = `${year}${course.code}${String(rollCounter).padStart(3, '0')}`;

        const enrollment = new Enrollment({
          studentId: app.userId._id,
          courseId: course._id,
          enrollmentNo,
          rollNo,
          enrollmentYear: year,
          currentSemester: 1
        });
        await enrollment.save();

        // Allocate hostel if required
        if (app.hostelRequired) {
          const hostel = await Hostel.findOne({
            isActive: true,
            availableRooms: { $gt: 0 }
          });

          if (hostel) {
            const roomNumber = `${hostel.code}-${Math.floor(Math.random() * 100) + 1}`;
            
            await HostelAllocation.create({
              studentId: app.userId._id,
              hostelId: hostel._id,
              roomNumber
            });

            hostel.availableRooms -= 1;
            await hostel.save();
          }
        }

        // Create notification
        await Notification.create({
          userId: app.userId._id,
          title: 'Congratulations! You are selected',
          message: `You have been selected for ${course.name}. Your enrollment number is ${enrollmentNo}.`,
          type: 'success'
        });
      } else {
        // Send rejection notification
        await Notification.create({
          userId: app.userId._id,
          title: 'Application Status',
          message: `Unfortunately, you were not selected for ${course.name} this time.`,
          type: 'info'
        });
      }
    }

    // Update course seats
    course.availableSeats -= selectedCount;
    await course.save();

    res.json({
      message: 'Merit list generated successfully',
      course: course.name,
      totalApplications: applications.length,
      selected: selectedCount,
      rejected: applications.length - selectedCount,
      meritList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/


// Generate merit list (Admin only)
router.post('/generate', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { courseId, admissionYear } = req.body;

    const year = admissionYear || new Date().getFullYear();

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get all pending applications for this course
    const applications = await Application.find({
      courseId,
      status: 'pending',
      admissionYear: year,
      percentage: { $gte: course.eligibilityPercentage }
    })
      .populate('userId', 'fullName email phone')
      .sort({ percentage: -1, applicationDate: 1 });

    if (applications.length === 0) {
      return res.status(400).json({ error: 'No eligible applications found' });
    }

    // Calculate merit and select candidates
    const totalSeats = course.availableSeats;
    const selectedCount = Math.min(applications.length, totalSeats);
    const meritList = [];

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const rank = i + 1;
      const isSelected = i < selectedCount;

      // Update application
      app.meritRank = rank;
      app.status = isSelected ? 'selected' : 'rejected';
      await app.save();

      meritList.push({
        rank,
        applicationId: app._id,
        student: app.userId,
        percentage: app.percentage,
        status: app.status
      });

      if (isSelected) {
        // Update user role to student
        await User.findByIdAndUpdate(app.userId._id, { role: 'student' });

        // Create enrollment (enrollmentNo and rollNo auto-generated by pre-save hook)
        const enrollment = new Enrollment({
          studentId: app.userId._id,
          courseId: course._id,
          enrollmentYear: year,
          currentSemester: 1,
          status: 'active'
        });
        await enrollment.save();

        // Allocate hostel if required
        if (app.hostelRequired) {
          const hostel = await Hostel.findOne({
            isActive: true,
            availableRooms: { $gt: 0 }
          });

          if (hostel) {
            const roomNumber = `${hostel.code}-${Math.floor(Math.random() * 100) + 1}`;

            await HostelAllocation.create({
              studentId: app.userId._id,
              hostelId: hostel._id,
              roomNumber
            });

            hostel.availableRooms -= 1;
            await hostel.save();
          }
        }

        // Create notification with enrollment number
        await Notification.create({
          userId: app.userId._id,
          title: 'Congratulations! You are selected',
          message: `You have been selected for ${course.name}. Your enrollment number is ${enrollment.enrollmentNo} and roll number is ${enrollment.rollNo}.`,
          type: 'success'
        });

        // Add enrollment info to merit list
        meritList[i].enrollmentNo = enrollment.enrollmentNo;
        meritList[i].rollNo = enrollment.rollNo;
      } else {
        // Send rejection notification
        await Notification.create({
          userId: app.userId._id,
          title: 'Application Status',
          message: `Unfortunately, you were not selected for ${course.name} this time.`,
          type: 'info'
        });
      }
    }

    // Update course seats
    course.availableSeats -= selectedCount;
    await course.save();

    res.json({
      message: 'Merit list generated successfully',
      course: course.name,
      totalApplications: applications.length,
      selected: selectedCount,
      rejected: applications.length - selectedCount,
      meritList
    });
  } catch (error) {
    console.error('Merit generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merit list
router.get('/', auth, async (req, res) => {
  try {
    const { courseId, admissionYear } = req.query;

    const filter = {
      status: { $in: ['selected', 'rejected'] },
      meritRank: { $exists: true }
    };

    if (courseId) filter.courseId = courseId;
    if (admissionYear) filter.admissionYear = parseInt(admissionYear);

    const meritList = await Application.find(filter)
      .populate('userId', 'fullName email phone')
      .populate('courseId', 'name code programType')
      .sort({ meritRank: 1 });

    res.json(meritList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;