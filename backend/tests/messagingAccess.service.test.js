const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getEligibleContacts,
  canStartDirectChat,
} = require('../services/messagingAccess.service');

const users = [
  { _id: 'student-1', name: 'Student One', email: 'student@example.com', role: 'student' },
  { _id: 'student-2', name: 'Student Two', email: 'other@example.com', role: 'student' },
  { _id: 'faculty-1', name: 'Faculty One', email: 'faculty@example.com', role: 'faculty' },
  { _id: 'faculty-2', name: 'Faculty Two', email: 'outside@example.com', role: 'faculty' },
  { _id: 'admin-1', name: 'Admin One', email: 'admin@example.com', role: 'admin' },
];

const courses = [
  { faculty: ['faculty-1'], students: ['student-1'] },
  { faculty: ['faculty-2'], students: ['student-2'] },
];

const createModels = () => ({
  Course: {
    find: async (query) => courses.filter((course) => {
      const ids = query.students || query.faculty;
      return ids && (course.students.includes(ids) || course.faculty.includes(ids));
    }),
  },
  User: {
    find: (query) => ({
      select: async () => users.filter((user) => query._id.$in.includes(user._id) && user.role === query.role),
    }),
    findById: async (id) => users.find((user) => user._id === id),
  },
});

test('student receives only faculty from enrolled courses', async () => {
  const contacts = await getEligibleContacts({
    userId: 'student-1',
    role: 'student',
    ...createModels(),
  });

  assert.deepEqual(contacts.map((user) => user._id), ['faculty-1']);
});

test('faculty receives only students from assigned courses', async () => {
  const contacts = await getEligibleContacts({
    userId: 'faculty-1',
    role: 'faculty',
    ...createModels(),
  });

  assert.deepEqual(contacts.map((user) => user._id), ['student-1']);
});

test('rejects an unrelated student and faculty pair', async () => {
  assert.equal(await canStartDirectChat({
    requesterId: 'student-1',
    requesterRole: 'student',
    recipientId: 'faculty-2',
    ...createModels(),
  }), false);
});

test('rejects same-role pairs and administrators', async () => {
  const models = createModels();
  assert.equal(await canStartDirectChat({ requesterId: 'student-1', requesterRole: 'student', recipientId: 'student-2', ...models }), false);
  assert.equal(await canStartDirectChat({ requesterId: 'admin-1', requesterRole: 'admin', recipientId: 'faculty-1', ...models }), false);
});
