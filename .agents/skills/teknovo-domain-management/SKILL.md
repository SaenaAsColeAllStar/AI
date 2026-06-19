---
name: teknovo-domain-management
description: Design, implement, and review modules according to Teknovo's Domain-Driven Design (DDD) principles, domain boundaries, ownership rules, and published/subscribed domain events.
---

# Teknovo Domain Management Skill

Use this skill when designing, building, modifying, or reviewing modules in the Teknovo ERP Platform to ensure compliance with domain boundaries, database ownership, and business rules.

## 1. Domain Ownership & Boundaries
Every table and entity must belong to a single owning domain. Direct cross-domain database writes are forbidden. Domains can only consume external data as **Read-Only** models or react via **Domain Events**.

### 1.1. Auth Domain (Core Platform Domain)
* **Purpose**: Identity, Authentication, Session, and Permission Management.
* **Owned Tables**: `users`, `roles`, `permissions`, `sessions`, `refresh_tokens`, `login_history`.
* **Rules**: 
  * Single Identity: One physical person = one account.
  * Decoupled Authorization: User ➔ Role ➔ Permission. No direct permissions on users.
  * Passwords must use Argon2id, minimum 8 characters.
  * SESSIONS must be Redis-backed.
  * Login endpoints rate-limited to 5 attempts/minute per IP.

### 1.2. Student Domain (Core Business Domain)
* **Purpose**: Single Source of Truth (SSOT) for all student lifecycle data.
* **Owned Tables**: `students`, `student_guardians`, `student_addresses`, `student_documents`, `student_statuses`, `student_mutations`, `student_achievements`, `student_violations`, `student_extracurriculars`.
* **Rules**:
  * NISN and NIS must be globally unique.
  * Student lifecycle status: `Applicant` ➔ `Active` ➔ (`Graduated` | `Transferred` | `Dropped Out`). Only one active status allowed.
  * Historical preservation: Mutations, violations, achievements, and alumni records must never be deleted.
  * Documents: Keep metadata in the database; files belong in Cloudflare R2.

### 1.3. Academic Domain (Core Business Domain)
* **Purpose**: Centralized learning, scheduling, and grading operations.
* **Owned Tables**: `teachers`, `subjects`, `academic_years`, `semesters`, `classes`, `class_membership`, `teaching_assignments`, `schedules`, `attendances`, `assessments`, `grades`, `report_cards`.
* **Rules**:
  * Academic Year Driven: All academic records must reference an academic year. Only one year can be active at a time.
  * No Schedule Conflicts: A teacher or class cannot be in two places at once.
  * No Grade Deletions: Grade updates require an audit log trail.
  * Immutable Report Cards: Report cards cannot be modified once finalized.

### 1.4. CBT Domain (Core Business Domain)
* **Purpose**: Computer-Based Testing execution and monitoring.
* **Owned Tables**: `question_banks`, `questions`, `exam_sessions`, `exam_participants`, `exam_attempts`, `exam_answers`, `exam_results`, `exam_monitoring`, `exam_logs`.
* **Rules**:
  * Academic Linked: Every exam and question bank must link to a Subject.
  * Attempt Preservation: Answers and attempts must never be deleted.
  * Immutable Results: Published results cannot be modified.
  * All active exam sessions must log real-time monitoring events (e.g., suspicious activity, disconnects).

### 1.5. Finance Domain (Core Business Domain)
* **Purpose**: School fee management and transaction ledger.
* **Owned Tables**: `fee_types`, `billing_rules`, `student_bills`, `student_payments`, `payment_receipts`, `cash_books`, `finance_transactions`, `finance_reports`.
* **Rules**:
  * Immutability: Bills, payments, receipts, and ledger transactions cannot be deleted.
  * Payment Cap: Payments cannot exceed the billing amount.
  * Auto-calculated Arrears: Arrears must not be stored statically; they are derived from Bills and Payments.

### 1.6. PPDB Domain (Business Domain)
* **Purpose**: Student admissions wave, screening, and registration.
* **Owned Tables**: `admission_waves`, `applicants`, `registrations`, `application_documents`, `verifications`, `selection_results`, `registration_payments`.
* **Rules**:
  * Applicant ➔ Student: Applicants are separate entities. Student entity creation is triggered only after acceptance, completed registration, and conversion.
  * Single Conversion: An accepted applicant can only be converted to a student once.
  * Document verification must be completed before selection results are compiled.

### 1.7. WA Domain (Supporting Domain)
* **Purpose**: Notification and messaging gateway.
* **Owned Tables**: `wa_devices`, `wa_contacts`, `wa_contact_groups`, `wa_templates`, `wa_campaigns`, `wa_messages`, `wa_delivery_logs`, `wa_notification_queue`.
* **Rules**:
  * Event-Driven: Responds strictly to published events (e.g., `bill.created`, `student.created`). No database polling.
  * Template First: All outgoing messages must match a predefined template code.
  * Message logs and delivery records are immutable.

### 1.8. Audit Domain (Supporting Domain)
* **Purpose**: Immutable activity logging and change tracking.
* **Owned Tables**: `audit_logs`, `activity_logs`, `security_logs`, `event_store`.
* **Rules**:
  * Append-only: No updates or deletes allowed on audit logs or event store.
  * Retention: 5-year retention for Audit Logs, permanent retention for the Event Store.

### 1.9. Reporting Domain
* **Purpose**: Read Models, dashboards, and analytical exports.
* **Owned Tables**: Materialized views and read-only reporting tables.
* **Rules**:
  * Read-only: Absolute prohibition on write-backs to operational databases.

---

## 2. Integration & Event-Driven Context Map
Communication between domains must rely on domain events. Below is a checklist of standard events to publish/subscribe:

| Origin Domain | Event Name | Typical Consumer(s) |
| :--- | :--- | :--- |
| **Auth** | `auth.user.created`, `auth.user.suspended`, `auth.login.success` | `Audit`, `WA` |
| **Student** | `student.created`, `student.transferred`, `student.graduated` | `Academic`, `Finance`, `WA` |
| **Academic** | `teacher.created`, `grade.created`, `report_card.finalized` | `Audit`, `WA`, `CBT` |
| **CBT** | `exam.started`, `attempt.submitted`, `result.published` | `Academic`, `WA` |
| **Finance** | `bill.created`, `payment.completed`, `bill.overdue` | `WA`, `Audit` |
| **PPDB** | `applicant.accepted`, `registration.completed`, `applicant.converted` | `Student`, `Finance`, `WA` |

---

## 3. Implementation Review Protocol
Before making any changes to the codebase, verify against this protocol:
1. **Identify Domain Owner**: Which domain owns the tables/logic being modified?
2. **Review DB Schema**: Does this introduce duplicate ownership? (e.g., storing student attributes directly in `exam_participants` or `student_payments` instead of referencing the student ID).
3. **Verify API Contract**: Does the response follow the `{ success, message, data }` format?
4. **Audit Mutations**: Ensure any `INSERT`, `UPDATE`, or `DELETE` has an associated audit log entry.
5. **Check UX States**: Verify that loading, error, success, empty, and permission states are implemented on the frontend page.
