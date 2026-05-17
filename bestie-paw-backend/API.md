# Bestie Paw API

Base URL: /api

## Auth
- POST /auth/register — Register a new user.
- POST /auth/login — Login with email and password.
- POST /auth/refresh — Refresh access token.
- POST /auth/logout — Logout and revoke refresh tokens. (Auth)
- POST /auth/verify-email — Verify email with code.
- POST /auth/forgot-password — Send password reset email.
- POST /auth/reset-password — Reset password with token.

## Users (Auth)
- GET /users/me — Get current user profile.
- PATCH /users/me — Update username or phone.
- POST /users/me/avatar — Upload user avatar.
- DELETE /users/me — Soft delete account.

## Pets (Auth)
- GET /pets — List pets for current user.
- POST /pets — Create a pet profile.
- GET /pets/:petId — Get pet detail with recent health/reminders.
- PATCH /pets/:petId — Update pet profile.
- DELETE /pets/:petId — Delete pet profile.
- POST /pets/:petId/avatar — Upload pet avatar.

## Health Records (Auth)
- GET /pets/:petId/health — List health records (type, page, limit).
- POST /pets/:petId/health — Create health record.
- GET /pets/:petId/health/:recordId — Get health record.
- PATCH /pets/:petId/health/:recordId — Update health record.
- DELETE /pets/:petId/health/:recordId — Delete health record.
- POST /pets/:petId/health/:recordId/attachments — Upload attachments.

## Reminders (Auth)
- GET /pets/:petId/reminders — List reminders (upcoming=true).
- POST /pets/:petId/reminders — Create reminder.
- PATCH /pets/:petId/reminders/:reminderId — Update reminder.
- DELETE /pets/:petId/reminders/:reminderId — Delete reminder.

## Community (Auth)
- GET /community/posts — List posts (page, limit).
- POST /community/posts — Create post with images.
- GET /community/posts/:postId — Get post with comments.
- DELETE /community/posts/:postId — Delete post (author only).
- POST /community/posts/:postId/like — Like a post (idempotent).
- POST /community/posts/:postId/comments — Add comment.
- DELETE /community/posts/:postId/comments/:commentId — Delete comment (author only).
