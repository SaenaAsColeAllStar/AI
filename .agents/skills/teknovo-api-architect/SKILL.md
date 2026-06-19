---
name: teknovo-api-architect
description: Design, document, and enforce REST API contracts, standard JSON envelopes, and OpenAPI specs.
---

# Teknovo API Architect Skill

Use this skill when designing endpoints, writing controllers, or documenting API interfaces.

**Reference**: `docs/standards/api/api-contract.md`, `docs/standards/api/openapi-standard.md`

---

## Route Standards

- All routes prefixed: `/api/v1/`
- RESTful resource naming: `/api/v1/academic/classes`
- kebab-case for multi-word resources: `/api/v1/student-guardians`
- Nested resources: `/api/v1/academic/classes/:classId/members`
- Action endpoints (when REST insufficient): `/api/v1/cbt/exams/:id/publish`

---

## Response Envelope

### Success (200/201)

```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "id": "01932a7b-...",
    "name": "XII IPA 1"
  }
}
```

### Error (400/401/403/404/409/422/429/500)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

### Paginated List (200)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 400 | Malformed request |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found (or soft-deleted) |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Validation error (Zod schema failure) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Request Validation

Every endpoint validates input with Zod at the controller layer:

```typescript
const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  academicYearId: z.string().uuid(),
  gradeLevel: z.number().int().min(1).max(12),
});

@Post()
async create(@Body() body: unknown) {
  const parsed = createClassSchema.parse(body);
  // ...
}
```

- Shared Zod schemas between frontend and backend where possible
- Validation errors return 422 with field-level error details

---

## OpenAPI / Swagger

Document all endpoints with decorators:

```typescript
@ApiTags('Academic - Classes')
@ApiOperation({ summary: 'Create a new class' })
@ApiResponse({ status: 201, description: 'Class created' })
@ApiResponse({ status: 422, description: 'Validation error' })
@ApiBearerAuth()
```

OpenAPI 3.1 spec shapes:
- Success: `{ success: boolean, data: {}, meta: {}, error: null }`
- Error: `{ success: false, error: { code: string, message: string } }`

Regenerate spec after endpoint changes.

---

## Endpoint Design Checklist

For each new endpoint:

- [ ] Route under `/api/v1/`
- [ ] Zod validation schema defined
- [ ] RBAC permission guard applied
- [ ] Standard response envelope used
- [ ] Correct HTTP status code returned
- [ ] OpenAPI decorators added
- [ ] Pagination on list endpoints (page, limit, total)
- [ ] Soft-deleted records excluded from lists
- [ ] Error responses include field-level details

---

## API Versioning

- Current version: `v1`
- Breaking changes require new version (`v2`)
- Deprecation: mark old endpoints, maintain for 2 release cycles
- Never break existing `/api/v1/` contracts without version bump

---

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Login | 5 attempts/minute per IP |
| Public endpoints | 60 requests/minute |
| Mutation endpoints | 30 requests/minute |
| File upload | 10 requests/minute |

Reference: `docs/standards/api/api-contract.md`

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Return raw DB entity | Map to DTO via mapper |
| Different response shape per endpoint | Standard envelope always |
| Skip validation "for internal endpoints" | Zod on all endpoints |
| 200 for errors | Use correct error status codes |
| Expose internal IDs in errors | Generic error messages to client |
