import express from 'express';
import { auth, roleAuth } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { programType, departmentId } = req.query;

    const filter = { isActive: true };
    if (programType) filter.programType = programType;
    if (departmentId) filter.departmentId = departmentId;

    const courses = await Course.find(filter)
      .populate('departmentId', 'name code')
      .sort({ name: 1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('departmentId');

    console

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get subjects for this course
    const subjects = await Subject.find({ courseId: course._id })
      .sort({ semester: 1, name: 1 });

    res.json({ ...course.toObject(), subjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course (Admin only)
router.post('/', auth, roleAuth('admin'), async (req, res) => {
  try {
    const course = new Course(req.body);
    course.availableSeats = course.totalSeats;
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course (Admin only)
router.put('/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (Admin only)
router.delete('/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subject routes

// Create a subject
router.post('/subjects', auth, roleAuth('admin'), async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all subjects for a particular course
router.get('/:courseId/subjects', async (req, res) => {
  try {
    // Validate the ObjectId format first
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const subjects = await Subject.find({
      courseId: req.params.courseId  // Mongoose converts this automatically
    })
      .sort({ semester: 1, name: 1 });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a subject
router.put('/subjects/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found!' });
    }

    res.status(200).json({
      message: 'Subject added successfully!',
      subject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a subject
router.delete('/subjects/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        error: 'Subject not found'
      });
    }

    res.status(200).json({ message: 'Subject deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: "error.message" });
  }
});

export default router;