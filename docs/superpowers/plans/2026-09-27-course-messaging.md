# Course Messaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build private, course-authorized teacher-student messaging in both portal roles.

**Architecture:** The backend centralizes course-based messaging authorization in a focused service, which powers an eligible-contacts endpoint and protects direct-chat creation. The frontend adds one reusable messages page, mounted below both portal layouts, which consumes the existing chat/message APIs and the new contacts endpoint.

**Tech Stack:** Express 5, Mongoose 9, Node built-in test runner, React 18, React Router, Axios, CSS.

**Spec:** `docs/superpowers/specs/2026-09-27-course-messaging-design.md`

## Global Constraints

- Students may message only faculty who share an enrolled course with them.
- Faculty may message only students enrolled in one of their assigned courses.
- Administrators, group chats, file attachments, and real-time Socket.IO are out of scope.
- Reuse the existing `Chat` and `Message` models and message endpoints.
- Preserve the user's unrelated uncommitted frontend changes.

## Review Focus

- A student must not create a chat with faculty from an unrelated course, even by calling the API directly.
- A faculty member must not create a chat with a student outside all of their courses.
- A same-role user pair or an administrator must be rejected for direct messaging.
- Existing one-to-one chats must be reused, not duplicated.
- Empty contact/chat lists and a failed request must render understandable, recoverable UI states.

---

### Task 1: Course-Based Messaging Access Service

**Files:**
- Create: `backend/services/messagingAccess.service.js`
- Create: `backend/tests/messagingAccess.service.test.js`
- Modify: `backend/package.json`

**Interfaces:**
- Produces: `getEligibleContacts({ userId, role, Course, User }) -> Promise<User[]>`.
- Produces: `canStartDirectChat({ requesterId, requesterRole, recipientId, Course, User }) -> Promise<boolean>`.
- Consumes: Mongoose `Course` documents with `faculty` and `students` user-id arrays; `User` records with `role`.

- [ ] **Step 1: Write failing Node tests for the service**

```js
test('student receives only faculty from enrolled courses', async () => {
  const contacts = await getEligibleContacts({ userId: 'student-1', role: 'student', Course, User });
  assert.deepEqual(contacts.map((user) => user._id), ['faculty-1']);
});

test('rejects an unrelated student/faculty pair', async () => {
  assert.equal(await canStartDirectChat({ requesterId: 'student-1', requesterRole: 'student', recipientId: 'faculty-2', Course, User }), false);
});
```

Use injected model doubles so the policy can be tested without a database server. Include cases for the reverse faculty-to-student direction, same-role pairs, and administrator users.

- [ ] **Step 2: Run the service test to verify it fails**

Run: `npm test -- --test-name-pattern="messaging"`

Expected: FAIL because the access service and test script do not exist.

- [ ] **Step 3: Implement the messaging access service**

Implement the exported functions in `backend/services/messagingAccess.service.js`. Query only courses containing the requester, derive opposite-role members from those courses, deduplicate IDs, and fetch safe contact fields (`name`, `email`, `role`). `canStartDirectChat` must require the student/faculty role pairing and at least one shared course.

- [ ] **Step 4: Add a Node test script and run the tests**

Change `backend/package.json` `test` to `node --test`.

Run: `npm test -- --test-name-pattern="messaging"`

Expected: PASS.

- [ ] **Step 5: Commit the service and tests**

```bash
git add backend/services/messagingAccess.service.js backend/tests/messagingAccess.service.test.js backend/package.json
git commit -m "feat: add course messaging access policy"
```

### Task 2: Secure Chat Endpoints

**Files:**
- Modify: `backend/controllers/chat.controller.js`
- Modify: `backend/routes/chat.routes.js`
- Test: `backend/tests/messagingAccess.service.test.js`

**Interfaces:**
- Consumes: `getEligibleContacts` and `canStartDirectChat` from Task 1.
- Produces: `GET /api/v1/chats/contacts` returning eligible contact objects.
- Produces: `POST /api/v1/chats` that returns `403` for invalid direct-message participants.
- Produces: `GET /api/v1/chats` entries whose `participants` include `name`, `email`, and `role` for the UI.

- [ ] **Step 1: Extend the failing tests for policy outcomes used by the endpoints**

Add assertions that the service allows a shared course pair and returns no contacts for an administrator. These pin the endpoint's authorization contract before wiring controllers.

- [ ] **Step 2: Run the targeted tests to verify the new cases fail**

Run: `npm test -- --test-name-pattern="allows a shared|administrator"`

Expected: FAIL until the policy behavior is implemented.

- [ ] **Step 3: Wire the access service into `chat.controller.js`**

Add `listEligibleContacts(req, res)`. In `createOrGetChat`, accept only two participants for `one-to-one` chats, identify the other participant, and return `403` unless `canStartDirectChat` succeeds. Keep existing-chat reuse. Populate participant display fields in `listUserChats` so the client can label each conversation. Return consistent `400`, `403`, `404`, and `500` JSON responses.

- [ ] **Step 4: Register the contacts route before `/:id`**

Add `router.get('/contacts', auth, chatCtrl.listEligibleContacts)` before the parameterized chat route in `backend/routes/chat.routes.js`.

- [ ] **Step 5: Run backend tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit endpoint work**

```bash
git add backend/controllers/chat.controller.js backend/routes/chat.routes.js backend/tests/messagingAccess.service.test.js
git commit -m "feat: secure course messaging chats"
```

### Task 3: Shared Messages Page

**Files:**
- Create: `frontend/src/pages/MessagesPage.jsx`
- Create: `frontend/src/styles/Messages.css`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/pages/StudentLayout.jsx`
- Modify: `frontend/src/pages/faculty/FacultyLayout.jsx`

**Interfaces:**
- Consumes: `GET /chats`, `GET /chats/contacts`, `POST /chats`, `GET /messages/chat/:chatId`, and `POST /messages/chat/:chatId` through `api`.
- Produces: a role-neutral `MessagesPage` rendered for `/student/messages` and `/faculty/messages`.

- [ ] **Step 1: Add both protected routes and sidebar links**

Mount `MessagesPage` as `messages` under the existing `/student` and `/faculty` protected layout routes. Add a Messages navigation item to `StudentLayout`; preserve the existing faculty link and ensure it resolves to the newly mounted route.

- [ ] **Step 2: Implement `MessagesPage` data flow**

Load chats and contacts concurrently on entry. Selecting a contact creates or reuses its direct chat, then selects it. Selecting a chat loads chronological messages. Submitting a non-empty text message posts it and appends/refetches the result. Use `GET /auth/me` to identify the signed-in user for message alignment.

- [ ] **Step 3: Implement complete interaction states**

Render loading, empty-chat, no-eligible-contact, request-error, selected-chat, and sending states. Disable the composer while sending and show the other participant's name/email in chat rows. Do not expose UI for attachments or group chats.

- [ ] **Step 4: Style the responsive messages experience**

Create `Messages.css` using the portal's existing white surface, border, type, and responsive sidebar conventions. Keep desktop lists and conversation visible together where space permits; on narrow screens, show the selected conversation with a back control. Use semantic buttons and accessible labels.

- [ ] **Step 5: Run frontend checks**

Run: `npm run lint`

Run: `npm run build`

Expected: both commands exit successfully.

- [ ] **Step 6: Commit frontend messaging UI**

```bash
git add frontend/src/pages/MessagesPage.jsx frontend/src/styles/Messages.css frontend/src/App.jsx frontend/src/pages/StudentLayout.jsx frontend/src/pages/faculty/FacultyLayout.jsx
git commit -m "feat: add teacher student messaging UI"
```

### Task 4: End-to-End Manual Verification

**Files:**
- Modify: no product files expected

**Interfaces:**
- Consumes: all endpoints and UI routes from Tasks 1-3.
- Produces: evidence that both roles can communicate only through shared courses.

- [ ] **Step 1: Start the backend and frontend in separate terminals**

Run: `npm run dev` from `backend`.

Run: `npm run dev` from `frontend`.

Expected: API is reachable at port `5000`; Vite reports its local URL.

- [ ] **Step 2: Verify the student flow**

Log in as an enrolled student, open `/student/messages`, select a listed faculty contact, send a message, and confirm it appears in the chat list and message pane.

- [ ] **Step 3: Verify the faculty flow**

Log in as that faculty user, open `/faculty/messages`, open the same chat, and reply. Confirm the student sees the reply after reopening the chat or refreshing.

- [ ] **Step 4: Verify authorization rejection**

Use Postman to attempt `POST /api/v1/chats` with an unrelated student/faculty pair. Expected: `403` and no new `Chat` record.

- [ ] **Step 5: Record verification results**

Report the executed commands, build/lint/test results, and any manual checks that require user credentials or browser interaction.
