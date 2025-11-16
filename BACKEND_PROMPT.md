# Backend Development Prompt for PostgreSQL + Clerk.js Integration

## Task

Set up a PostgreSQL database with Clerk.js authentication integration for the OriginHub application. Clerk handles authentication, but we need our own database tables to store application data.

## Key Requirements

### 1. Database Schema

Create these PostgreSQL tables:

**users** - Store user profiles linked to Clerk

- id (UUID, primary key)
- clerk_user_id (VARCHAR, unique, indexed) - Links to Clerk user
- email, first_name, last_name, bio, profile_image_url
- created_at, updated_at

**ideas** - Store startup ideas

- id (UUID, primary key)
- user_id (UUID, foreign key to users)
- title, description, problem, solution
- market_size (Small/Medium/Large)
- status (draft/active/validated/launched)
- upvotes, views (integers)
- created_at, updated_at
- Indexes on: user_id, status, created_at, upvotes

**tags** - Store tags

- id (UUID primary key)
- name (unique)

**idea_tags** - Many-to-many relationship

- idea_id, tag_id (composite primary key)

**upvotes** - Track who upvoted what

- idea_id, user_id (composite unique)
- created_at

**chat_messages** - Store chat history

- id (UUID primary key)
- user_id (nullable for anonymous users)
- clerk_user_id (for anonymous tracking)
- message, role (user/assistant)
- chat_session_id
- created_at

**idea_views** - Track idea views

- idea_id, user_id (composite unique)
- viewed_at

### 2. Clerk.js Integration

**Authentication Middleware:**

- Verify Clerk JWT tokens from `Authorization: Bearer <token>` header
- Extract `clerk_user_id` from token
- Auto-create user in database if doesn't exist (using Clerk user data)
- Make user available as `req.user` or `request.state.user`
- Allow anonymous access (no token = anonymous user)

**User Sync:**

- When Clerk user signs up, create corresponding record in `users` table
- Update user data from Clerk on each authenticated request
- Store Clerk's `user_id` as `clerk_user_id` in database

### 3. Required API Endpoints

**User APIs:**

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile (bio, etc.)
- `GET /api/users/:userId` - Get public user profile

**Ideas APIs:**

- `GET /api/ideas` - List ideas with:
  - Query params: `search`, `tags[]`, `sort_by`, `page`, `limit`, `status`
  - Return paginated results with author info
- `GET /api/ideas/:id` - Get single idea (increment view count)
- `POST /api/ideas` - Create idea (requires auth)
- `PUT /api/ideas/:id` - Update idea (owner only)
- `DELETE /api/ideas/:id` - Delete idea (owner only)

**Upvotes API:**

- `POST /api/ideas/:id/upvote` - Toggle upvote
- `GET /api/ideas/:id/upvotes` - Get upvote status

**Tags API:**

- `GET /api/tags` - List all tags with usage count

**Chat API:**

- `POST /api/chat` - Send message (works for anonymous users too)
- `GET /api/chat/history` - Get chat history (authenticated users)

### 4. Data Models

**Idea Response Format:**

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "problem": "string",
  "solution": "string",
  "market_size": "Small|Medium|Large",
  "status": "draft|active|validated|launched",
  "tags": ["tag1", "tag2"],
  "author": {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string"
  },
  "upvotes": 10,
  "views": 50,
  "created_at": "ISO timestamp",
  "user_has_upvoted": false
}
```

### 5. Important Implementation Details

1. **Anonymous Users**: App allows unauthenticated access. Store `clerk_user_id` as NULL for anonymous actions.

2. **View Counting**: Increment view count when idea is fetched. Use `idea_views` table to prevent duplicate counts.

3. **Upvote Logic**: Toggle behavior - if already upvoted, remove upvote; if not, add upvote.

4. **Tag Handling**: Auto-create tags if they don't exist when creating ideas.

5. **Search**: Search across title, description, and problem fields.

6. **Sorting**: Support sorting by newest, upvotes, views.

7. **Pagination**: All list endpoints should support pagination.

### 6. Security

- Always verify Clerk tokens (never trust client-provided user IDs)
- Check ownership before allowing updates/deletes
- Use parameterized queries to prevent SQL injection
- Validate all input data

### 7. Environment Variables Needed

```env
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### 8. Testing Requirements

- Test with authenticated users
- Test with anonymous users
- Test CRUD operations
- Test pagination and filtering
- Test upvote/view counting
- Test user creation on first API call

### 9. Reference

See `BACKEND_SETUP_GUIDE.md` for detailed schema SQL, code examples, and implementation patterns.

Frontend API client expects these endpoints at base URL: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

Frontend sends requests with `Authorization: Bearer <clerk_token>` header when user is authenticated.
