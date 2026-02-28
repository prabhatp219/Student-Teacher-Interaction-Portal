const Course = require('../models/Course');
const User = require('../models/User');

exports.listCourses = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('faculty', 'name email')
      .populate('students', 'name email');

    const total = await Course.countDocuments(filter);

    res.json({ data: courses, total });
  } catch (err) {
    console.error('course.listCourses', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('faculty','name email').populate('students','name email');
    if (!course) return res.status(404).json({ msg: 'Not found' });
    res.json(course);
  } catch (err) {
    console.error('course.getCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
//get my course controller actual object not the numbers.
exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const courses = await Course.find({
      students: studentId,
      isActive: true,
    })
      .populate("faculty", "name email")
      .select("title description department faculty");

    res.json(courses);
  } catch (err) {
    console.error("student.getMyCourses", err);
    res.status(500).json({ msg: "Server error" });
  }
};


exports.createCourse = async (req, res) => {
  try {
    const payload = req.body;
    const course = await Course.create(payload);
    res.status(201).json(course);
  } catch (err) {
    console.error('course.createCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ msg: 'Not found' });
    res.json(course);
  } catch (err) {
    console.error('course.updateCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error('course.deleteCourse', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.enrollSelf = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    if (course.students.includes(req.user.id)) return res.status(400).json({ msg: 'Already enrolled' });
    course.students.push(req.user.id);
    await course.save();
    res.json({ msg: 'Enrolled' });
  } catch (err) {
    console.error('course.enrollSelf', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.unenrollSelf = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    course.students = course.students.filter(s => s.toString() !== req.user.id);
    await course.save();
    res.json({ msg: 'Unenrolled' });
  } catch (err) {
    console.error('course.unenrollSelf', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    if (!course.students.includes(studentId)) {
      course.students.push(studentId);
      await course.save();
    }
    res.json({ msg: 'Added' });
  } catch (err) {
    console.error('course.addStudent', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    course.students = course.students.filter(s => s.toString() !== studentId);
    await course.save();
    res.json({ msg: 'Removed' });
  } catch (err) {
    console.error('course.removeStudent', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
  exports.addFaculty = async (req, res) => {
    const { facultyId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Course not found" });

    if (!course.faculty.includes(facultyId)) {
      course.faculty.push(facultyId);
      await course.save();
    }

    res.json(course);
  };

  exports.removeFaculty = async (req, res) => {
    const { facultyId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Course not found" });

    course.faculty = course.faculty.filter(
      f => f.toString() !== facultyId
    );
    await course.save();

    res.json(course);
  };


exports.assignUsers = async (req, res) => {
  try {
    const { faculty = [], students = [] } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { faculty, students },
      { new: true }
    )
      .populate('faculty', 'name email')
      .populate('students', 'name email');

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error('course.assignUsers', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET courses taught by logged-in faculty
exports.getMyFacultyCourses = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const courses = await Course.find({
      faculty: facultyId,
      isActive: true,
    })
      .select("code title description department semester")
      .populate("faculty", "name email");

    res.json(courses);
  } catch (err) {
    console.error("faculty.getMyCourses", err);
    res.status(500).json({ msg: "Server error" });
  }
};