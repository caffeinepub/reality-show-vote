# Reality Show Vote

## Current State
The app has a reality show voting platform with:
- Internet Identity (II) login for viewers to vote
- Admin panel accessible only to users with the `admin` role (assigned via II identity)
- Contestant management (add, remove, upload video)
- Public vote counts

The admin panel is embedded in the main app and gated by II-based role check (`isCallerAdmin`).

## Requested Changes (Diff)

### Add
- Admin credential storage in backend: username + password (plain text, single admin account)
- Backend `initAdminCredentials(username, password)` — one-time setup if not yet configured
- Backend `adminLogin(username, password) -> {#ok: Text; #err: Text}` — verifies credentials, returns a session token (random ID stored server-side with expiry)
- Backend `adminLogout(sessionId)` — invalidates session
- Backend `verifyAdminSession(sessionId) -> Bool` — checks if a session is valid
- Separate `AdminLoginPage` component: standalone form with Login ID and Password fields, only shown for the `/admin` route
- Session token stored in `sessionStorage` on the frontend
- Admin mutations (`addContestant`, `removeContestant`, `setContestantVideo`) accept a `sessionId: Text` parameter and verify it instead of checking II caller role

### Modify
- `App.tsx`: add a separate `/admin` path (hash-based routing) that shows `AdminLoginPage` or `AdminPage` depending on session state
- `addContestant`, `removeContestant`, `setContestantVideo` backend functions: accept `sessionId` and verify it via `verifyAdminSession`
- `useAddContestantMutation`, `useRemoveContestantMutation`, `useSetContestantVideoMutation` hooks: pass session token from sessionStorage
- `AdminPage`: pass session token to all mutations

### Remove
- Dependency on `isCallerAdmin` for admin mutations (replaced by session token verification)
- Admin Panel button in main nav (admin area is now accessed via `/admin` URL directly)

## Implementation Plan
1. Update `main.mo`: add admin credential state, session map, `initAdminCredentials`, `adminLogin`, `adminLogout`, `verifyAdminSession`, update admin mutations to accept `sessionId`
2. Create `AdminLoginPage.tsx`: login form with username/password, calls `adminLogin`, stores token in sessionStorage, redirects to admin panel
3. Update `App.tsx`: hash-based routing for `/admin` path, render `AdminLoginPage` or `AdminPage` based on session
4. Update `useQueries.ts`: pass sessionId to admin mutations
5. Update `AdminPage.tsx`: pass sessionId, add logout button
