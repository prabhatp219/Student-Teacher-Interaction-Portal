const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

exports.takeAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, present } = req.body; // present: array of student ids
    if (!date || !present) return res.status(400).json({ msg: 'Missing fields' });

    // Upsert attendance for date+course
    const d = new Date(date);
    const existing = await Attendance.findOne({ course: courseId, date: d });
    if (existing) {
      existing.present = present;
      existing.takenBy = req.user.id;
      existing.note = req.body.note;
      await existing.save();
      return res.json(existing);
    }

    const att = await Attendance.create({ course: courseId, date: d, present, takenBy: req.user.id, note: req.body.note });
    res.status(201).json(att);
  } catch (err) {
    console.error('attendance.takeAttendance', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAttendanceForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { from, to } = req.query;
    const q = { course: courseId };
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
    const data = await Attendance.find(q).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error('attendance.getAttendanceForCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    // find attendance records where student is present
    const records = await Attendance.find({ present: req.user.id }).sort({ date: -1 }).populate('course','title code');
    res.json(records);
  } catch (err) {
    console.error('attendance.getMyAttendance', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
