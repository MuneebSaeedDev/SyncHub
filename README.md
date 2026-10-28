# SyncHub — Task & Friend APIs Guide

This guide uses the routes you shared:

```js
app.use('/api/v1/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/friends', friendRequestRoutes);
```

Your current friend router:

```js
router.post("/request", verifyToken, sendFriendRequest);
router.get("/received", verifyToken, getFriendRequest);
router.patch("/:requestId/accept", verifyToken, acceptFriendRequest);
router.patch("/:requestId/reject", verifyToken, rejectFriendRequest);
router.get("/", verifyToken, getFriends);
router.delete("/requests/:requestId", verifyToken, cancelFriendRequest);
router.delete("/:friendId", verifyToken, deleteFriend);
```

Therefore friend URLs start with `/api/friends`, not `/api/v1/friends`.

## Key terms

- **Requester**: the user who sends a friend request.
- **Recipient**: the user who receives it.
- **User ID**: a user's MongoDB `_id`.
- **FriendRequest ID (`requestId`)**: the `_id` of the request document; it is not a User ID.
- **Task ID (`taskId` / `id`)**: the `_id` of a Task document.
- **Bearer token**: use the token of the user who is performing the action. `verifyToken` should set that user as `req.user`.

Example: if User A sends a request to User B, `requester = User A's ID`, `recipient = User B's ID`, and the request document has its own separate `_id`.

## Friend APIs

In Postman, select **Authorization → Bearer Token** and paste the relevant user's token. The token field usually needs only the raw token, not the word `Bearer`.

### 1. Send friend request

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/friends/request`
- **Bearer token:** User A (requester/sender).
- **Body → raw → JSON:**

```json
{ "email": "userb@example.com" }
```

No ID is needed in the URL/body. The backend finds User B by email. It should set `requester` from `req.user._id` and `recipient` from the found user.

### 2. Get received requests

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/friends/received`
- **Bearer token:** User B (recipient).
- **Body:** none.
- **IDs:** none.
- Expected query for pending received requests: `FriendRequest.find({ recipient: req.user._id, status: "pending" })`.

Your current router does not include a sent-requests endpoint.

### 3. Accept friend request

- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/friends/FRIEND_REQUEST_ID/accept`
- **Bearer token:** User B (recipient).
- **Body:** none.
- **ID:** FriendRequest document `_id`.
- The controller should check the request ID, `recipient: req.user._id`, and `status: "pending"`, then set status to `accepted`.

### 4. Reject friend request

- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/friends/FRIEND_REQUEST_ID/reject`
- **Bearer token:** User B (recipient).
- **Body:** none.
- **ID:** FriendRequest document `_id`.
- The controller should check the request ID, recipient, and pending status, then set status to `rejected`.

### 5. Get friends

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/friends`
- **Bearer token:** whichever logged-in user wants to see their own friends.
- **Body / URL ID:** none.
- It should return accepted relationships where the logged-in user is either requester or recipient, and return the *other* user.
- If you get `ReferenceError: FriendRequest is not defined`, import the model at the top of the controller using its actual path, for example: `const FriendRequest = require("../models/friend.Request.model");`.

### 6. Cancel a sent pending request

- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/friends/requests/FRIEND_REQUEST_ID`
- **Bearer token:** User A (requester/sender).
- **Body:** none.
- **ID:** FriendRequest document `_id`.
- The controller should only cancel a pending request whose `requester` matches `req.user._id`.

### 7. Remove a friend

- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/friends/FRIEND_USER_ID`
- **Bearer token:** either user in the accepted friendship who wants to remove the other.
- **Body:** none.
- **ID:** the other person's **User ID**, not the FriendRequest ID.
- The controller should find an accepted relationship in either direction between `req.user._id` and `friendId`.

## Task APIs

Your app mounts the task router at `/api/tasks`. You previously showed this route:

```js
router.post('/create', verifyToken, createTask);
```

Only this task route was explicitly shown; the remaining paths below apply if your `taskRouter` defines them.

### 1. Create task

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/tasks/create`
- **Bearer token:** the user creating/owning the task.
- **Body example:**

```json
{
  "title": "Prepare SyncHub project",
  "priority": "high",
  "dueDate": "2026-11-05"
}
```

Include `description` if your current schema/controller requires it. Do not send `owner_id` from the client; the controller should use `owner_id: req.user._id`.

### 2. Get all your tasks (if router defines `GET /`)

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/tasks`
- **Bearer token:** user viewing their own tasks.
- **Body / ID:** none.
- The query should filter by `owner_id: req.user._id` if users should see only their own tasks.

### 3. Get one task (if router defines `GET /:id`)

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/tasks/TASK_ID`
- **Bearer token:** task owner, unless shared-task permissions are implemented.
- **ID:** Task document `_id`.
- Secure query: `Task.findOne({ _id: id, owner_id: req.user._id })`. Do not pass an object to `Task.findById()`; `findById()` expects just the ID.

### 4. Update task (if router defines `PUT /:id`)

- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/tasks/TASK_ID`
- **Bearer token:** task owner, unless shared-task permissions are implemented.
- **ID:** Task document `_id`.
- Only update a task if both its `_id` and `owner_id: req.user._id` match.

### 5. Delete task (if router defines `DELETE /:id`)

- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/tasks/TASK_ID`
- **Bearer token:** task owner, unless shared-task permissions are implemented.
- **ID:** Task document `_id`.
- Only delete a task if both its `_id` and `owner_id: req.user._id` match.

## Example flow: User A sends a request to User B

1. Sign up User A and User B.
2. Sign in as User A; copy User A's token.
3. Optionally create a task as User A at `POST /api/tasks/create` using User A's token.
4. Send a friend request to User B's email at `POST /api/friends/request`, using User A's token.
5. Sign in as User B; copy User B's token.
6. Call `GET /api/friends/received` with User B's token.
7. Copy the FriendRequest document's `_id` from the response.
8. Accept or reject using User B's token and that FriendRequest ID.
9. After accepting, call `GET /api/friends` using either user's token.

## Quick reference

| API action | ID needed | Whose Bearer token? |
|---|---|---|
| Send request | Recipient email in JSON body | Requester/sender |
| Get received requests | None | Recipient |
| Accept request | FriendRequest `_id` | Recipient |
| Reject request | FriendRequest `_id` | Recipient |
| Get friends | None | User viewing their list |
| Cancel pending request | FriendRequest `_id` | Requester/sender |
| Remove friend | Other user's User `_id` | Either friend |
| Create task | None; owner comes from JWT | Task creator/owner |
| List own tasks | None | User viewing tasks |
| Get/update/delete one task | Task `_id` | Task owner, unless sharing is implemented |

## Important security notes

- Use `verifyToken` on private endpoints.
- For the acting user, use `req.user._id`; do not trust a client-supplied `owner_id`, `requester`, or acting user's ID.
- `requestId`, `friendId`, and `taskId` refer to different documents/IDs.
- Accepting a friend request does not automatically share tasks. Task sharing needs separate permissions and endpoints.
"""
path = Path("/mnt/data/synqhub_task_friend_api_guide.md")
path.write_text(content, encoding="utf-8")
print(f"Created file: {path}")
