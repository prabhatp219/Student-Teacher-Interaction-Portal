# Course Messaging Design

## Purpose

Provide private, course-based conversations between students and faculty. A
student may contact faculty assigned to one of the student's enrolled courses.
A faculty member may contact students enrolled in one of the faculty member's
courses.

## Scope

- Add a Messages link and route for both student and faculty portals.
- Build one shared React messages page with a contact list, chat list,
  conversation history, and text composer.
- Add an API endpoint that returns only the current user's eligible contacts.
- Validate new chats on the server so a direct API request cannot create a
  conversation between unrelated users.
- Reuse the existing Chat and Message models and existing message endpoints.

## User Experience

The messages page has three responsive areas:

1. Eligible contacts, used to start a new conversation.
2. Existing conversations, ordered by their latest message.
3. The active conversation, with chronological messages and a send field.

On smaller screens, the contact/chat list and active conversation switch views
so the content remains usable. Opening or sending a message refreshes the
relevant chat data. This first release is request-based rather than real-time.

## API and Access Rules

`GET /api/v1/chats/contacts` returns people the requester may message:

- Students receive faculty who share at least one course with them.
- Faculty receive students who share at least one course with them.
- Administrators are excluded from this feature.

`POST /api/v1/chats` continues to create or return a one-to-one chat, but it
will require exactly two participants and verify the participants share a
course with the correct student/faculty roles. Existing participant checks
remain in place for reading chats and messages.

## Non-Goals

- File attachments, because the current message route has no upload middleware.
- Socket.IO or live delivery indicators.
- Group chats and administrator messaging.

## Verification

- Backend tests cover eligible-contact results and rejected unrelated chat
  creation.
- Frontend build and lint run successfully.
- Manual verification covers student-to-faculty and faculty-to-student flows,
  including empty, loading, and error states.
