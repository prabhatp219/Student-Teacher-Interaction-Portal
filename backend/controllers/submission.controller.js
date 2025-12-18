const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const fs = require('fs');
const path = require('path');

// NOTE: This implementation stores upload metadata (multer provides files in req.files).
// You should replace file handling with S3 or GridFS in production.

exports.submit = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

    // Build files metadata from multer
    const files = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/${f.filename}`, // static serve or S3 url in real setup
      mimeType: f.mimetype,
      size: f.size
    }));

    // Upsert submission (one per student per assignment)
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user.id });
    if (existing) {
      existing.files = files;
      existing.submittedAt = new Date();
      existing.grade = undefined;
      existing.feedback = undefined;
      await existing.save();
      return res.json(existing);
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user.id,
      files
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error('submission.submit', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const subs = await Submission.find({ assignment: assignmentId }).populate('student','name email').sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    console.error('submission.listForAssignment', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const s = await Submission.findById(req.params.id).populate('student','name email').populate('gradedBy','name email');
    if (!s) return res.status(404).json({ msg: 'Not found' });
    // Allow students to view their own, faculty/admin to view all
    if (req.user.role === 'student' && s.student._id.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });
    res.json(s);
  } catch (err) {
    console.error('submission.getSubmission', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;
    const s = await Submission.findById(id);
    if (!s) return res.status(404).json({ msg: 'Not found' });

    s.grade = grade;
    s.feedback = feedback;
    s.gradedBy = req.user.id;
    await s.save();

    res.json(s);
  } catch (err) {
    console.error('submission.gradeSubmission', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
