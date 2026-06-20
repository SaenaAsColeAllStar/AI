---
name: teknovo-backend-development
description: Design, implement, and review backend modules, services, repositories, database schemas, queues, and events in Teknovo V2 using NestJS/Fastify/Express/Hono, Drizzle ORM, and PostgreSQL.
---

# Teknovo Backend Development Skill

Use this skill when developing, testing, or reviewing backend layers (controllers, services, repositories, schemas, queues, and events) for any of Teknovo's domain applications.

## 1. Directory & Code Structure
All backend modules must reside in their respective domain folders following the kebab-case naming standard:
`apps/<app_name>/src/modules/<domain_name>/`

### 1.1. Standard Module Files
* `<domain>.module.ts`: NestJS module declaration.
* `<domain>.controller.ts`: REST API route controllers.
* `<domain>.service.ts`: Core business logic, validation, transactional boundaries, and event publishing.
* `<domain>.repository.ts`: Direct database CRUD queries, filtering, pagination, and projection (Entity returns only).
* `<domain>.events.ts`: Event publishers and subscribers.
* `<domain>.dto.ts`: Data Transfer Objects for API inputs/outputs.
* `<domain>.mapper.ts`: Utility for mapping between database Entities, domain Aggregates, and external DTOs.
* `<domain>.policy.ts`: Authorization and RBAC policy validations.

### 1.2. Forbidden Files & Dumps
* **NO** global catch-all files: `utils.ts`, `helpers.ts`, `misc.ts`, `common.ts`, or `temp.ts`. All utilities must be named contextually or placed in a shared package (e.g. `packages/shared-utils`).

---

## 2. API Contract & Response Formats
We use two distinct response standards depending on the context:

### 2.1. Application Endpoint Contract (Default)
Standard client responses must follow the `api-contract.md` schema:
* **Success Responses (HTTP 200/201)**:
  ```json
  {
    "success": true,
    "message": "Success message details",
    "data": {} 
  }
  ```
* **Error Responses (HTTP 400/401/403/404/409/422/429/500)**:
  ```json
  {
    "success": false,
    "message": "Error classification description",
    "errors": [] 
  }
  ```
* **Pagination (List endpoints)**:
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

### 2.2. OpenAPI Spec & External Documentation Schema
When compile-exposing Swagger documentation (matching OpenAPI 3.1), document payload shapes as:
* **Success**: `{ success: boolean, data: {}, meta: {}, error: null }`
* **Error**: `{ success: false, error: { code: string, message: string } }`

---

## 3. Database & Drizzle Schema Rules
* **Database Engine**: PostgreSQL 17+ (Private access only via `127.0.0.1`, no public port exposure).
* **Identifier Standard**: `UUID v7` primary keys for all tables. Auto-increment integer primary keys are strictly forbidden.
* **Audit Columns**: Every table must contain the following columns:
  * `id` (UUID v7, Primary Key)
  * `created_at` (Timestamp, defaults to now)
  * `updated_at` (Timestamp, defaults to now)
  * `created_by` (UUID v7, referencing user ID)
  * `updated_by` (UUID v7, referencing user ID)
  * `deleted_at` (Timestamp, nullable, for soft deletes)
* **Soft Deletes**: Mandatory for all business tables using the `deleted_at` column. Do not use hard `DELETE` commands.
* **Foreign Keys**: Must use `RESTRICT` by default. Do not use `CASCADE` without explicit architect approval.
* **Database Migrations**: All schema changes must go through SQL migrations. Manual database updates on staging or production are forbidden.

---

## 4. Domain Events & Queue Processing (BullMQ)
* **Queue Engine**: BullMQ + Redis (Private access only, no public port).
* **Event Naming**: `domain.entity.action` (e.g. `student.created`, `payment.paid`).
* **Job Naming**: `domain.action` (e.g. `wa.send`, `report.generate`).
* **Idempotency**: All jobs must be designed to run idempotently (safe to retry without double execution).
* **Retry Policy**: 3 attempts with exponential backoff.
* **DLQ (Dead Letter Queue)**: Mandatory for all asynchronous queues.
* **Payload Tracing**: Every event and job payload must include:
  * `eventId` / `jobId`
  * `correlationId`
  * `traceId`
  * `actorId`
  * `timestamp`

---

## 5. Review & Testing Protocol
* **Unit Testing**: Mandatory for the Service Layer.
* **Integration Testing**: Mandatory for the Repository Layer.
* **E2E Testing**: Mandatory for critical flows (Login, PPDB Registration, Payment, Exam Submission, Report Card Generation).
* **Code Coverage Budgets**:
  * Global Baseline: **80%**
  * Critical Auth & Finance Modules: **90%**
  * Core Payment Modules: **95%**
