import mongoose from 'mongoose';
import Counter from './Counter.js';

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  currentSemester: {
    type: Number,
    default: 1
  },
  enrollmentYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'completed', 'dropped'],
    default: 'active'
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ enrollmentNo: 1 });
enrollmentSchema.index({ courseId: 1 });

// Pre-save hook to generate enrollment number
enrollmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.enrollmentNumber) {
    try {
      // Get current year
      const year = new Date().getFullYear();

      // Find and increment counter
      const counter = await Counter.findOneAndUpdate(
        { name: 'enrollmentNumber' },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      // Generate enrollment number: YEAR + 5-digit sequence
      // Example: 2024-00001, 2024-00002, etc.
      this.enrollmentNo = `${year}-${String(counter.sequence).padStart(5, '0')}`;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Enrollment', enrollmentSchema);