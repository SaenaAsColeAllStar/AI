---
name: teknovo-ui-ux
description: Review, design, and implement user interfaces, layouts, dashboards, and navigations matching Teknovo's Design System, Color Tokens, Icon Libraries, and Page State rules.
---

# Teknovo UI/UX Standard Skill

Use this skill when designing, building, modifying, or reviewing user interfaces (UIs) and user experiences (UX) in the Teknovo ERP Platform to ensure absolute visual consistency and functional completeness.

## 1. Design Tokens & Visual Language
* **Color System**:
  * Primary: `#1D4ED8` (Primary Hover: `#1E40AF`)
  * Accent: `#0EA5E9` (Light blue/cyan focus details)
  * Success: `#16A34A` (Green)
  * Warning: `#D97706` (Amber/Orange)
  * Danger: `#DC2626` (Red)
  * Neutral: `#0F172A` (Slate/Dark grey)
  * Background: `#F8FAFC` (Off-white/light grey)
  * Card: `#FFFFFF`
* **Typography**: Inter primary, Fallback System UI. Title/Heading weights: 600, 700. Body weights: 400, 500.
* **Spacing**: 4, 8, 12, 16, 24, 32, 48, 64px.
* **Visual References**: Stripe Dashboard, Linear, Notion, Carbon Design.

---

## 2. Component Foundations & Libraries
All components must be sourced from or built using the following approved libraries:
* **Base Components**: Radix UI, shadcn/ui.
* **Animations**: Magic UI.
* **Landing/Public Pages**: Aceternity UI.
* **Component References**: 21st.dev.
* **Icon Libraries**:
  * **Primary**: Phosphor Icons.
  * **Secondary**: Tabler Icons.
* **Strictly Forbidden**:
  * **NO** Lucide Icons.
  * **NO** Font Awesome.
  * **NO** Bootstrap / Bootstrap Icons.
  * **NO** Ant Design / Material UI.
  * **NO** AdminLTE.

---

## 3. Structural Page Layout & Navigation
Every page in the ERP system must use standard structural components:
* **PageShell**: Outer wrapper containing the layout structure.
* **PageHeader**:
  * Mandatory: Breadcrumb (`Domain > Module > Page`), Page Title, Page Description.
  * Optional: Primary Action Button (e.g., "Add Student", "Export Report").
* **PageContent**: Primary area for tables, forms, or dashboard grid contents.
* **PageFooter**: Bottom layout bar for secondary actions or page metadata.

### 3.1. Navigation Architecture
* **Domain-Driven Sidebars**: Level 1 (Domain - e.g., Academic, Finance) ➔ Level 2 (Module - e.g., SPP Bills, Cash Books) ➔ Level 3 (Page).
* Depth limit: Max 3 levels of nested navigation.
* **Consistency**: The sidebar structure is globally identical across the ERP. Individual modules must not render ad-hoc custom sidebars.
* **Mobile Viewport**: Transition to Drawer Navigation or Bottom Navigation. Desktop sidebars must be hidden on mobile screens.

---

## 4. Mandatory Page States
Every content page must support and gracefully render five states:
1. **Loading State**: Skeleton screen loader or loading spinner while TanStack Query fetches data.
2. **Empty State**: Friendly illustration/message when there is no data to show, containing a call-to-action (CTA) if the user has permission to create.
3. **Error State**: Non-blocking error card with clear messages and a "Retry" button.
4. **Success State**: Clear toasts or alerts for mutations (creates, updates, deletes).
5. **Permission State**: Restricted access or lock screen if the user lacks the required RBAC role.

---

## 5. UI Control Standards (Tables & Forms)
Follow these specifications exactly when coding core interactive components:

### 5.1. Table Standard (Data Grids)
* **Header Controls**: Combined search bar and filter controls.
* **Column Visibility**: Toggle dropdown to show/hide specific columns.
* **Row Selection**: Multiple row checkboxes for bulk mutations.
* **Bulk Actions**: Contextual action bar appearing when row selection > 0.
* **Pagination**: Prev/Next buttons, page numbers, and records-per-page selector.
* **Data Export**: PDF/CSV export buttons in header.
* **Sticky Headers**: Freeze headers on scroll.

### 5.2. Form Standard (Data Inputs)
* **Validation**: Strict schema validation using Zod. Render inline error text below invalid fields.
* **Autosave Ready**: Support immediate debounced sync for complex/settings fields.
* **Error Summary**: Render an alert summarizing validation failures at the top of the form.
* **Dirty State**: Detect if inputs have been altered and prompt confirmation before navigating away.
* **Step Forms**: Multi-step forms must include a progress indicator and clean state transfer.

---

## 6. UI Implementation Review Checklist
Before marking UI work as complete, verify:
* [ ] Are only approved icons (Phosphor, Tabler) used?
* [ ] Are Lucide, Font Awesome, and Bootstrap icons absent?
* [ ] Does the page implement all five mandatory page states (Loading, Empty, Error, Success, Permission)?
* [ ] Is there a breadcrumb using `Domain > Module > Page` format?
* [ ] Does the page layout follow `PageShell` ➔ `PageHeader` ➔ `PageContent`?
* [ ] Are all forms validated with Zod, and do they handle dirty states?
* [ ] Are all tables equipped with pagination, filtering, column visibility, and export options?
* [ ] Does the mobile viewport hide the desktop sidebar and render drawer/bottom nav?
