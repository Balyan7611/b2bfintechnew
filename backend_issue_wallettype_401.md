## Issue: `/api/WalletType` returns 401 Unauthorized for Member / API-Panel tokens

**Project:** SahayataMoney B2B Fintech Portal
**Endpoint:** `GET /api/WalletType`
**Reported from:** Frontend (React) — API Panel header widget

### What we're trying to do
The API Panel header shows live wallet balance pills (AEPS / Main / Commission). These pills should:
1. Only show wallet types that are marked `IsActive = 1` in the `WalletType` table.
2. Automatically hide a wallet type if it's deactivated (`IsActive = 0`) in the database — no frontend redeploy needed.

To do this, the frontend calls:

```
curl --location '{{baseUrl}}/api/WalletType?PageNumber=1&PageSize=10000&FromDate=2000-01-01T00:00:00.000Z&ToDate=2026-07-31T00:00:00.000Z&Status=&MemberID={memberId}' \
--header 'Authorization: Bearer {{bearerToken}}'
```

using the Bearer token of the currently logged-in **API Panel / Member** user (not an admin token).

### The problem
This request comes back with **HTTP 401 Unauthorized** when called with a Member or API-Panel user's token. It only seems to succeed with an Admin token.

We've already confirmed on the frontend side that:
- The Bearer token is present and correctly attached to the `Authorization` header.
- The token is a valid, non-expired token for the logged-in member/API user (other endpoints like `/api/UserWalletBalance/GetUserWalletBalances` work fine with the exact same token).

So this looks like a **role/permission restriction on the `/api/WalletType` endpoint itself** — it's likely decorated with an `[Authorize(Roles = "Admin")]` (or similar) attribute that excludes Member/API-Panel roles.

### What we need from backend
One of the following, whichever fits your intended design:

1. **Preferred:** Allow the `Member` / `ApiUser` roles (in addition to Admin) to call `GET /api/WalletType` — it's a read-only, non-sensitive lookup (wallet type code/name/active flag), so it should be safe to expose to authenticated non-admin users too.
2. **Alternative:** If `WalletType` must stay Admin-only, please expose a separate lightweight **read-only, member-accessible** endpoint (e.g. `GET /api/WalletType/active-for-member?MemberID={id}`) that returns only the active wallet types visible to a given member, so the header widget can consume that instead.

### Expected response shape (for reference)
Whichever endpoint we end up using, we need at least:
```json
{
  "status": true,
  "data": [
    { "id": 1, "name": "Main", "isActive": true },
    { "id": 2, "name": "AEPS", "isActive": true },
    { "id": 3, "name": "Commission", "isActive": false }
  ]
}
```

### Why this matters
Without a fix, the API Panel header currently has to fall back to showing a static default (all wallet types visible) whenever this call fails, which defeats the purpose of the dynamic "hide inactive wallet type from DB" feature the client asked for.

Please confirm which of the two options above you'll go with, or let us know if there's a different existing endpoint we should be using instead.
