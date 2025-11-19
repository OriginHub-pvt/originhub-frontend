# Backend Setup Guide: PostgreSQL + Clerk.js Integration

## Overview

This document provides step-by-step instructions for setting up the backend with PostgreSQL database and Clerk.js authentication integration. Clerk handles authentication, but we need our own database tables to store application-specific data.

---

## Architecture Overview

**Clerk.js Role:**

- Handles user authentication (sign-up, sign-in, password management)
- Provides user identity (user_id, email, name)
- Stores authentication tokens

**Our Database Role:**

- Stores application-specific user data (bio, preferences, etc.)
- Stores business data (ideas, chats, upvotes, etc.)
- Links to Clerk users via `clerk_user_id` foreign key

**Key Concept:** When a user signs up in Clerk, we create a corresponding record in our `users` table that references their Clerk `user_id`.

---

## Step 1: Database Schema Design

Create the following PostgreSQL tables:

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk's user ID
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index for fast lookups
    INDEX idx_clerk_user_id (clerk_user_id),
    INDEX idx_email (email)
);
```

### 2. Ideas Table

```sql
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    market_size VARCHAR(50) CHECK (market_size IN ('Small', 'Medium', 'Large')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'validated', 'launched')),
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_upvotes (upvotes DESC)
);
```

### 3. Tags Table (Many-to-Many with Ideas)

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE idea_tags (
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
);

CREATE INDEX idx_idea_tags_idea_id ON idea_tags(idea_id);
CREATE INDEX idx_idea_tags_tag_id ON idea_tags(tag_id);
```

### 4. Upvotes Table (Track who upvoted what)

```sql
CREATE TABLE upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, user_id) -- Prevent duplicate upvotes
);

CREATE INDEX idx_upvotes_idea_id ON upvotes(idea_id);
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);
```

### 5. Chat Messages Table

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous users
    clerk_user_id VARCHAR(255), -- Store Clerk ID even if user record doesn't exist yet
    message TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    chat_session_id UUID, -- Group messages into sessions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_clerk_user_id (clerk_user_id),
    INDEX idx_chat_session_id (chat_session_id),
    INDEX idx_created_at (created_at DESC)
);
```

### 6. User Views Table (Track idea views)

```sql
CREATE TABLE idea_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    clerk_user_id VARCHAR(255), -- For anonymous users
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, user_id) -- One view per user per idea (or use clerk_user_id)
);

CREATE INDEX idx_idea_views_idea_id ON idea_views(idea_id);
```

---

## Step 2: Clerk.js Integration Setup

### 2.1 Install Required Packages

```bash
npm install @clerk/clerk-sdk-node
# or
pip install clerk-sdk-python  # if using Python
```

### 2.2 Environment Variables

Add to your `.env` file:

```env
CLERK_SECRET_KEY=sk_test_xxxxx  # From Clerk Dashboard
DATABASE_URL=postgresql://user:password@localhost:5432/originhub
```

### 2.3 Authentication Middleware

Create middleware to verify Clerk JWT tokens:

**Node.js/Express Example:**

```javascript
const { clerkClient } = require("@clerk/clerk-sdk-node");

async function authenticateUser(req, res, next) {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      // Allow anonymous access (optional)
      req.user = null;
      req.clerkUserId = null;
      return next();
    }

    // Verify token with Clerk
    const session = await clerkClient.verifyToken(token);
    req.clerkUserId = session.sub; // Clerk user ID
    req.user = session;

    // Get or create user in our database
    req.dbUser = await getOrCreateUser(session.sub, session);

    next();
  } catch (error) {
    // Token invalid or expired
    req.user = null;
    req.clerkUserId = null;
    next(); // Still allow request, but mark as anonymous
  }
}

async function getOrCreateUser(clerkUserId, clerkSession) {
  // Check if user exists
  let user = await db.query("SELECT * FROM users WHERE clerk_user_id = $1", [
    clerkUserId,
  ]);

  if (user.rows.length === 0) {
    // Create new user record
    user = await db.query(
      `INSERT INTO users (clerk_user_id, email, first_name, last_name, profile_image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        clerkUserId,
        clerkSession.email || "",
        clerkSession.first_name || null,
        clerkSession.last_name || null,
        clerkSession.image_url || null,
      ]
    );
  } else {
    // Update user info from Clerk
    await db.query(
      `UPDATE users 
       SET email = $1, first_name = $2, last_name = $3, profile_image_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE clerk_user_id = $5`,
      [
        clerkSession.email || user.rows[0].email,
        clerkSession.first_name || user.rows[0].first_name,
        clerkSession.last_name || user.rows[0].last_name,
        clerkSession.image_url || user.rows[0].profile_image_url,
        clerkUserId,
      ]
    );
  }

  return user.rows[0];
}
```

**Python/FastAPI Example:**

```python
from clerk_backend_sdk import Clerk
import jwt
from functools import wraps

clerk = Clerk(secret_key=os.getenv("CLERK_SECRET_KEY"))

async def authenticate_user(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        request.state.user = None
        request.state.clerk_user_id = None
        return

    try:
        # Verify token
        session = clerk.verify_token(token)
        request.state.clerk_user_id = session["sub"]
        request.state.user = session

        # Get or create user in database
        request.state.db_user = await get_or_create_user(session["sub"], session)
    except:
        request.state.user = None
        request.state.clerk_user_id = None

async def get_or_create_user(clerk_user_id: str, clerk_session: dict):
    # Check if user exists
    user = await db.fetchrow(
        "SELECT * FROM users WHERE clerk_user_id = $1",
        clerk_user_id
    )

    if not user:
        # Create new user
        user = await db.fetchrow(
            """INSERT INTO users (clerk_user_id, email, first_name, last_name, profile_image_url)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING *""",
            clerk_user_id,
            clerk_session.get("email", ""),
            clerk_session.get("first_name"),
            clerk_session.get("last_name"),
            clerk_session.get("image_url")
        )
    else:
        # Update user info
        await db.execute(
            """UPDATE users
               SET email = $1, first_name = $2, last_name = $3, profile_image_url = $4, updated_at = CURRENT_TIMESTAMP
               WHERE clerk_user_id = $5""",
            clerk_session.get("email", user["email"]),
            clerk_session.get("first_name", user["first_name"]),
            clerk_session.get("last_name", user["last_name"]),
            clerk_session.get("image_url", user["profile_image_url"]),
            clerk_user_id
        )
        user = await db.fetchrow("SELECT * FROM users WHERE clerk_user_id = $1", clerk_user_id)

    return user
```

---

## Step 3: Required API Endpoints

### 3.1 User APIs

#### GET /api/users/me

Get current user's profile (from our database + Clerk)

```javascript
// Response:
{
  "id": "uuid",
  "clerk_user_id": "user_xxx",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "User bio from metadata",
  "profile_image_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/users/me

Update user profile (bio, etc.)

```javascript
// Request Body:
{
  "bio": "Updated bio text",
  "first_name": "John",
  "last_name": "Doe"
}

// Also update Clerk metadata if needed
```

#### GET /api/users/:userId

Get public user profile (for displaying author info)

---

### 3.2 Ideas APIs

#### GET /api/ideas

Get all ideas with filtering, pagination, and search

```javascript
// Query Parameters:
// - search: string (search in title, description, problem)
// - tags: string[] (filter by tags)
// - sort_by: "newest" | "upvotes" | "views"
// - page: number (default: 1)
// - limit: number (default: 20)
// - status: "draft" | "active" | "validated" | "launched"

// Response:
{
  "ideas": [
    {
      "id": "uuid",
      "title": "Idea Title",
      "description": "Description",
      "problem": "Problem statement",
      "solution": "Solution",
      "market_size": "Medium",
      "status": "active",
      "tags": ["AI", "Healthcare"],
      "author": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "profile_image_url": "https://..."
      },
      "upvotes": 10,
      "views": 50,
      "created_at": "2024-01-01T00:00:00Z",
      "user_has_upvoted": false // if authenticated
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

#### GET /api/ideas/:id

Get single idea by ID

```javascript
// Response: Same as above but single object
// Also increment view count
```

#### POST /api/ideas

Create new idea (requires authentication)

```javascript
// Request Body:
{
  "title": "Idea Title",
  "description": "Description",
  "problem": "Problem statement",
  "solution": "Solution",
  "market_size": "Medium",
  "tags": ["AI", "Healthcare"]
}

// Response: Created idea object
```

#### PUT /api/ideas/:id

Update idea (only by owner)

```javascript
// Request Body: Partial idea data
// Response: Updated idea object
```

#### DELETE /api/ideas/:id

Delete idea (only by owner)

```javascript
// Response: { "success": true }
```

---

### 3.3 Upvotes API

#### POST /api/ideas/:id/upvote

Toggle upvote (add if not exists, remove if exists)

```javascript
// Response:
{
  "upvoted": true,
  "upvote_count": 11
}
```

#### GET /api/ideas/:id/upvotes

Get upvote status for current user

```javascript
// Response:
{
  "has_upvoted": true,
  "upvote_count": 10
}
```

---

### 3.4 Tags API

#### GET /api/tags

Get all tags with usage count

```javascript
// Response:
[
  {
    id: "uuid",
    name: "AI",
    usage_count: 25,
  },
];
```

---

### 3.5 Chat API

#### POST /api/chat

Send chat message (works for both authenticated and anonymous)

```javascript
// Request Body:
{
  "message": "User message",
  "chat_session_id": "uuid" // optional, for grouping messages
}

// Response:
{
  "id": "uuid",
  "role": "assistant",
  "content": "AI response",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /api/chat/history

Get chat history for authenticated user

```javascript
// Query Parameters:
// - limit: number (default: 50)
// - chat_session_id: uuid (optional)

// Response:
{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Message",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Step 4: Implementation Details

### 4.1 Creating Ideas with Tags

```sql
-- Transaction example
BEGIN;

-- 1. Insert idea
INSERT INTO ideas (user_id, title, description, problem, solution, market_size, status)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id;

-- 2. Insert tags if they don't exist
INSERT INTO tags (name)
VALUES ($8), ($9), ($10)
ON CONFLICT (name) DO NOTHING;

-- 3. Link tags to idea
INSERT INTO idea_tags (idea_id, tag_id)
SELECT $idea_id, id FROM tags WHERE name IN ($8, $9, $10);

COMMIT;
```

### 4.2 Incrementing Views

```sql
-- When user views an idea
INSERT INTO idea_views (idea_id, user_id, clerk_user_id)
VALUES ($1, $2, $3)
ON CONFLICT DO NOTHING;

-- Update views count
UPDATE ideas
SET views = (
  SELECT COUNT(*) FROM idea_views WHERE idea_id = $1
)
WHERE id = $1;
```

### 4.3 Upvoting Logic

```sql
-- Check if already upvoted
SELECT EXISTS(
  SELECT 1 FROM upvotes
  WHERE idea_id = $1 AND user_id = $2
) as has_upvoted;

-- If not upvoted, add upvote
INSERT INTO upvotes (idea_id, user_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- If upvoted, remove upvote
DELETE FROM upvotes
WHERE idea_id = $1 AND user_id = $2;

-- Update upvote count
UPDATE ideas
SET upvotes = (
  SELECT COUNT(*) FROM upvotes WHERE idea_id = $1
)
WHERE id = $1;
```

---

## Step 5: Clerk Webhooks (Optional but Recommended)

Set up webhooks to sync user data when Clerk events occur:

### Webhook Endpoint: POST /api/webhooks/clerk

**Events to handle:**

1. `user.created` - Create user in database
2. `user.updated` - Update user in database
3. `user.deleted` - Soft delete or remove user

```javascript
// Example webhook handler
app.post("/api/webhooks/clerk", async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "user.created":
      await createUserInDatabase(event.data);
      break;
    case "user.updated":
      await updateUserInDatabase(event.data);
      break;
    case "user.deleted":
      await deleteUserInDatabase(event.data.id);
      break;
  }

  res.json({ received: true });
});
```

---

## Step 6: Database Migrations

Use a migration tool (like `node-pg-migrate`, `Alembic`, or `Flyway`):

```sql
-- migrations/001_create_tables.sql
-- migrations/002_add_indexes.sql
-- migrations/003_add_constraints.sql
```

---

## Step 7: Testing Checklist

- [ ] User can sign up in Clerk and get created in database
- [ ] Authenticated user can create ideas
- [ ] Anonymous user can view ideas
- [ ] User can upvote/downvote ideas
- [ ] View counts increment correctly
- [ ] Tags are created and linked properly
- [ ] Search and filtering work
- [ ] Pagination works
- [ ] User can update their profile
- [ ] Chat works for both authenticated and anonymous users

---

## Important Notes

1. **Anonymous Users**: Your app allows anonymous access. Store `clerk_user_id` as NULL or empty string for anonymous actions.

2. **Data Sync**: Keep Clerk and your database in sync. Use webhooks or update on each API call.

3. **Security**: Always verify Clerk tokens. Never trust client-provided user IDs.

4. **Performance**: Use database indexes for frequently queried fields (user_id, idea_id, tags, etc.).

5. **Scalability**: Consider caching frequently accessed data (tags, popular ideas).

---

## Example API Request Flow

1. **Frontend sends request** with `Authorization: Bearer <clerk_token>`
2. **Backend middleware** verifies token with Clerk
3. **Backend gets/creates user** in database using `clerk_user_id`
4. **Backend processes request** using `user.id` (your database ID)
5. **Backend returns response** with data

---

## Support

If you need help with implementation, refer to:

- Clerk Documentation: https://clerk.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Your frontend API client: `lib/api-client.ts` and `lib/api.ts`
