import express from 'express';
import { auth, roleAuth } from '../middleware/auth.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';

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


/** 

// Department routes

// Get all departments
router.get('/departments/all', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a department
router.post('/departments', auth, roleAuth('admin'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update department by id
router.put('/departments/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found!' });
    }

    res.status(200).json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department by id
router.delete('/departments/:id', auth, roleAuth('admin', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(
      req.params.id,
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found!' });
    }

    res.status(204).json({ message: 'Department deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));
*/

// Subject routes
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

router.get('/:courseId/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ courseId: req.params.courseId })
      .sort({ semester: 1, name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;