const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

exports.listByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment
      .find({ course: courseId })
      .populate('course', 'title code')
      .sort({ dueAt: 1 });

    res.json(assignments);
  } catch (err) {
    console.error('assignment.listByCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // 1️⃣ create assignment
    const assignment = await Assignment.create({
      ...req.body,
      course: courseId,
      courseName: course.title,
      createdBy: req.user.id
    });

    // 2️⃣ fetch again with populate
    const populatedAssignment = await Assignment
      .findById(assignment._id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email');

    // 3️⃣ return populated data
    res.status(201).json(populatedAssignment);

  } catch (err) {
    console.error('assignment.createForCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment
      .findById(req.params.id)
      .populate('course', 'title code')
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json(assignment);
  } catch (err) {
    console.error('assignment.getAssignment', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const a = await Assignment
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'title code')
      .populate('createdBy', 'name email');

    if (!a) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json(a);
  } catch (err) {
    console.error('assignment.updateAssignment', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error('assignment.deleteAssignment', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
