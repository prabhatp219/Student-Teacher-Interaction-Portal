const idsInclude = (ids, id) => ids.some((value) => String(value) === String(id));

const getEligibleContacts = async ({ userId, role, Course, User }) => {
  if (role !== 'student' && role !== 'faculty') return [];

  const requesterField = role === 'student' ? 'students' : 'faculty';
  const contactField = role === 'student' ? 'faculty' : 'students';
  const contactRole = role === 'student' ? 'faculty' : 'student';
  const courses = await Course.find({ [requesterField]: userId });
  const contactIds = [...new Set(courses.flatMap((course) => (course[contactField] || []).map(String)))];

  if (!contactIds.length) return [];

  return User.find({ _id: { $in: contactIds }, role: contactRole }).select('name email role');
};

const canStartDirectChat = async ({ requesterId, requesterRole, recipientId, Course, User }) => {
  if (requesterRole !== 'student' && requesterRole !== 'faculty') return false;

  const recipient = await User.findById(recipientId);
  const recipientRole = recipient?.role;
  const isStudentFacultyPair = [requesterRole, recipientRole].sort().join(':') === 'faculty:student';
  if (!isStudentFacultyPair) return false;

  const requesterField = requesterRole === 'student' ? 'students' : 'faculty';
  const recipientField = requesterRole === 'student' ? 'faculty' : 'students';
  const sharedCourses = await Course.find({ [requesterField]: requesterId });

  return sharedCourses.some((course) => idsInclude(course[recipientField] || [], recipientId));
};

module.exports = { getEligibleContacts, canStartDirectChat };
