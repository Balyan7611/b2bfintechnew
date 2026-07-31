## Backend Spec: Member Service Assignment + Request/Approval Workflow

**Project:** SahayataMoney B2B Fintech Portal
**Purpose:** Frontend (Admin / Member / API-panel) is already built and calling these endpoints. This document lists exactly what needs to exist in the database and backend for it to work end-to-end.

---

### 1. Database table: `MemberService`

If this table doesn't already exist, please create it. If it exists, please confirm the columns below match (names can be adjusted, just confirm the mapping with us).

| Column | Type | Notes |
|---|---|---|
| Id | int, PK, identity | |
| MemberId | int, FK -> Member.Id | who the service is for |
| ServiceId | int, FK -> Service.Id | which service |
| IsActive | bit | true = live/usable by the member |
| AssignTypeId | int | see status meanings below |
| PurchaseId | nvarchar, nullable | optional |
| SourceReferenceId | nvarchar, nullable | optional |
| StartDate | datetime | when created/requested |
| ExpiryDate | datetime, nullable | optional |
| Remark | nvarchar, nullable | e.g. "Requested by Member", or the admin's rejection reason |
| CreatedBy | int, nullable | |
| ModifiedBy | int, nullable | |
| CreatedDate | datetime | |
| ModifiedDate | datetime, nullable | |

**AssignTypeId meanings (please confirm these numbers or tell us the real ones):**
- `1` = Directly assigned by Admin (already active)
- `2` = Pending — Member/API user requested it, awaiting admin decision
- `3` = Approved — Admin approved a pending request (service becomes active)
- `4` = Rejected — Admin rejected a pending request (stays inactive, Remark holds the reason)

---

### 2. Endpoints the frontend is already calling

All require `Authorization: Bearer {token}`.

**2.1 List a member's assigned services**
```
GET /api/MemberService/GetMemberService?PageNumber=1&PageSize=1000&MemberID={id}
```
Response shape expected:
```json
{ "status": true, "data": { "items": [ { "id": 1, "memberId": 3, "serviceId": 12, "isActive": true, "assignTypeId": 1, ... } ], "totalItems": 1 } }
```
(We defensively also handle `data` being a bare array instead of `data.items`, but the paginated wrapper above is preferred.)

**2.2 Get one record**
```
GET /api/MemberService/GetByID/{id}
```

**2.3 Admin directly assigns a service to a member**
```
POST /api/MemberService/Create
Content-Type: application/json

{
  "memberId": 3,
  "serviceId": 12,
  "isActive": true,
  "assignTypeId": 1,
  "purchaseId": "",
  "sourceReferenceId": "",
  "startDate": "2026-07-31T00:00:00.000Z",
  "expiryDate": null,
  "remark": "Requested by Member"
}
```

**2.4 Update an assignment**
```
PUT /api/MemberService/Update
Content-Type: application/json
(same body shape as Create, plus "id")
```

**2.5 Remove an assignment**
```
DELETE /api/MemberService/Delete/{id}
```

**2.6 Member/API user requests activation of a locked service** *(new — this is the request/approval feature)*
```
POST /api/MemberService/Request/{serviceId}
```
- Uses the logged-in user's own identity from the JWT (no memberId in the body — server should read it from the token).
- Should create/upsert a `MemberService` row: `IsActive = false`, `AssignTypeId = 2` (Pending).
- If a record for this member+service already exists (regardless of status), please decide: reject the duplicate request with a clear error message, or update the existing row back to Pending — whichever is simpler on your side, just let us know which so we can handle the response correctly.

**2.7 Admin: list all pending requests**
```
GET /api/MemberService/PendingRequests?PageNumber=1&PageSize=50
```
Should return only rows where `AssignTypeId = 2`. Response shape: same paginated wrapper as 2.1. Ideally each row also includes the member's display name/login ID and the service name already joined in (so we don't have to do extra lookups on our side) — e.g. `memberName`, `serviceName` fields alongside `memberId`/`serviceId`. If that's not feasible right now, plain `memberId`/`serviceId` is fine and we'll resolve the names client-side from data we already have.

**2.8 Admin: approve a pending request**
```
POST /api/MemberService/Approve/{memberServiceId}
```
Should set `IsActive = true`, `AssignTypeId = 3`.

**2.9 Admin: reject a pending request**
```
POST /api/MemberService/Reject/{memberServiceId}?reason=Not_applicable_for_this_slab
```
Should keep `IsActive = false`, set `AssignTypeId = 4`, and save `reason` into `Remark`.

---

### 3. What we need confirmed from you

1. Does `MemberService` table already exist? If yes, please share the actual column names/types so we can double check our field mapping (`memberId`/`MemberId` casing etc. — our frontend already tries both).
2. Do endpoints 2.6–2.9 (Request / PendingRequests / Approve / Reject) exist yet, or do they need to be built? (As of today we could not find them live — got empty/unauthorized responses testing without a valid token, so we can't tell from our side whether they exist.)
3. Confirm the `AssignTypeId` number meanings above are correct, or send us the real ones.
4. For 2.7 (PendingRequests), can you include the member's name/login ID and service name directly in the response, or should we resolve those ourselves from the Member and Service tables?

Once these are confirmed/built, the frontend (Member panel → "My Services" request button, Admin panel → Settings → "Service Requests" page) is already fully wired and ready to go live.
