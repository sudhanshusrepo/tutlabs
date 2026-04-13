# API Reference — OpenResume

All API routes are under `/api`. Server routes use `@supabase/ssr` with cookie-based Auth. Unauthenticated requests are handled as guest where applicable.

---

## Resumes

### `GET /api/resumes`
List the authenticated user's resumes (paginated).

**Auth**: Required

**Query Params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number (10 results per page) |

**Response `200`**:
```json
{
  "resumes": [
    { "id": "uuid", "title": "Jane Doe's Resume", "updated_at": "2024-01-01T00:00:00Z" }
  ],
  "total": 5
}
```

---

### `POST /api/resumes`
Create or update a resume (upsert).

**Auth**: Required

**Body**:
```json
{
  "id": "uuid (optional — omit to create new)",
  "title": "Jane Doe's Resume",
  "data": { "personalInfo": {}, "experience": [], ... }
}
```

**Response `200`**: Full resume record

---

### `GET /api/resumes/[id]`
Fetch a single resume by ID. Verifies ownership.

**Auth**: Required  
**Response `404`** if not found or ownership mismatch.

---

### `DELETE /api/resumes/[id]`
Delete a resume by ID.

**Auth**: Required  
**Response `200`**: `{ "success": true }`

---

## Downloads

### `POST /api/download/check`
Check if a user (guest or authenticated) may download a PDF.

**Auth**: Optional

**Response `200`**:
```json
{
  "allowed": true,
  "remaining": 2,
  "resetTime": "2024-01-02T00:00:00.000Z"
}
```

**Guest Logic**: Extracts `x-forwarded-for` IP → HMAC SHA-256 hash with `IP_SALT` → queries `download_logs` for today's count.

---

### `POST /api/download/increment`
Log a successful download event. Enforces the 3/day limit server-side.

**Auth**: Optional

**Response `200`**: `{ "success": true }`  
**Response `429`** (rate limited):
```json
{ "error": "Rate limit exceeded" }
```
With header: `Retry-After: 86400`

---

## Error Codes

| Code | Meaning |
|---|---|
| `401` | Unauthorized — valid session required |
| `404` | Resource not found or ownership mismatch |
| `429` | Rate limit exceeded — 3 downloads/day cap reached |
| `500` | Internal server error |
