// backend/seeds/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const db = require('../models'); // uses models/index.js
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) return console.error('MONGO_URI not set in .env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding');

  try {
    // Clear minimal things (be careful in production)
    // await db.User.deleteMany({});
    // await db.Course.deleteMany({});
    // await db.Assignment.deleteMany({});

    // Create admin
    const adminEmail = 'admin@test.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hash = await bcrypt.hash('adminpass', 10);
      admin = await User.create({
        name: 'Site Admin',
        email: adminEmail,
        passwordHash: hash,
        role: 'admin'
      });
      console.log('Created admin:', adminEmail);
    } else {
      console.log('Admin already exists:', adminEmail);
    }

    // Create sample student
    const studentEmail = 'student@test.com';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      const hash = await bcrypt.hash('secret123', 10);
      student = await User.create({
        name: 'Test Student',
        email: studentEmail,
        passwordHash: hash,
        role: 'student'
      });
      console.log('Created student:', studentEmail);
    } else {
      console.log('Student already exists:', studentEmail);
    }

    // Create a sample course
    const courseCode = 'CS101';
    let course = await Course.findOne({ code: courseCode });
    if (!course) {
      course = await Course.create({
        code: courseCode,
        title: 'Intro to Computer Science',
        description: 'Sample course created by seed script',
        semester: 1,
        faculty: [admin._id],
        students: [student._id]
      });
      console.log('Created course:', courseCode);
    } else {
      console.log('Course already exists:', courseCode);
      // ensure student & admin present
      if (!course.faculty.map(String).includes(String(admin._id))) course.faculty.push(admin._id);
      if (!course.students.map(String).includes(String(student._id))) course.students.push(student._id);
      await course.save();
    }

    // Create a sample assignment
    let assignment = await Assignment.findOne({ title: 'Assignment 1', course: course._id });
    if (!assignment) {
      assignment = await Assignment.create({
        course: course._id,
        title: 'Assignment 1',
        description: 'Seeded assignment. Submit a text file.',
        createdBy: admin._id,
        dueAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // one week from now
        totalMarks: 100
      });
      console.log('Created assignment: Assignment 1');
    } else {
      console.log('Assignment already exists for course');
    }

    console.log('\nSEED SUMMARY');
    console.log('Admin:', admin.email);
    console.log('Student:', student.email);
    console.log('Course:', course.code, course._id.toString());
    console.log('Assignment ID:', assignment._id.toString());

    console.log('\nYou can now login with the seeded accounts:');
    console.log(' Admin -> email: admin@test.com  password: adminpass');
    console.log(' Student -> email: student@test.com  password: secret123');

  } catch (err) {
    console.error('Seeding error', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected. Seed script finished.');
    process.exit(0);
  }
}

main();
