import express from 'express';
import { auth, roleAuth } from '../middleware/auth.js';
import Department from '../models/Department.js';

const router = express.Router();

// Department routes

// Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a department
router.post('/', auth, roleAuth('admin'), async (req, res) => {
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
router.put('/:id', auth, roleAuth('admin'), async (req, res) => {
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
router.delete('/:id', auth, roleAuth('admin'), async (req, res) => {
    try {
        // Soft delete - set isActive to false
        const department = await Department.findByIdAndDelete(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ error: 'Department not found!' });
        }

        res.status(200).json({ message: 'Department deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
