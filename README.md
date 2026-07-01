# Automation of Exam Administration

A robust, university-grade digital examination and virtual classroom platform inspired by Google Classroom. This system automates repetitive academic workflows by allowing instructors to manage subject-specific rooms, broadcast announcements, compile question pools, and deliver time-restricted assessments with auto-grading capabilities.

---

## Core Features and Implementation Details

### Secure Authentication and RBAC
* **OTP-Based Registration:** Eliminates unauthorized registrations using an email-based One-Time Password (OTP) verification service with a built-in 30-second security cooldown loop.
* **Role-Specific Routing:** Seamlessly segments users post-login into distinct dashboard instances optimized for either Teachers or Students.
* **Forgot Password:** Embedded email-link recovery handling system.

### Virtual Classroom Management
* **Class Hub Structure:** Instructors can create isolated online spaces for individual subjects. Every space generates a unique join code (e.g., `J4BIXF`, `309K8T`) for student self-enrollment.
* **Stream and Announcements:** A dedicated micro-feed inside each room allowing teachers to post updates visible directly to the room's student roster.
* **Roster Audit:** A clean "People" view map showing all active teachers and enrolled classmates within that room.

### Comprehensive Assessment Engine
* **Quiz Constructor:** Teachers can assemble tests by defining titles, custom durations, start/end deadlines, point allocations, and question types.
* **Tab-Switching Restriction (Academic Integrity):** To ensure assessment validity, the active test window logs student focus loss. If a student switches browser tabs or desktop applications frequently, they receive a maximum of two warnings before the engine triggers an automatic test submission.
* **Auto-Evaluation UI:** On submission, the application maps choices against pre-stored relational key fields to output instantaneous results, detailing raw scores, percentages, and correct/incorrect answer breakdowns.

---

## Architecture and Tech Stack

The system utilizes a decoupled architecture communicating over structured APIs:
* **Frontend Ecosystem:** React.js, JavaScript (ES6+), HTML5, CSS3
* **State and Utilities:** Modular React context structures, custom hooks, and event handlers
* **Backend Ecosystem:** Python, Django Web Framework & Django REST Framework (DRF)
* **Database Management:** PostgreSQL relational database engine

---

## Relational Database Schema

The backend architecture is mapped over the following primary relational tables implemented in PostgreSQL:

| Table Entity | Key Columns & Types | Purpose / Relations |
| :--- | :--- | :--- |
| **`Users`** | `id` (bigint), `email`, `username`, `password`, `role` (`T` or `S`), `is_active` | System-wide authentication profiles. |
| **`OTP`** | `id` (bigint), `email`, `code` (varchar), `created_at`, `is_used` | Tracks single-use registration verification strings. |
| **`Class Room`** | `id` (bigint), `name`, `code` (unique class invite code), `creator_id` | Subject-specific spaces mapped back to an instructor ID. |
| **`Class room enrollment`** | `id`, `classroom_id`, `student_id`, `date_joined` | Many-to-Many associative mapping of students to rooms. |
| **`Announcement`** | `id`, `title`, `content` (text), `created_at`, `classroom_id` | Notification entries bounded to a specific classroom scope. |
| **`Question Bank`** | `id`, `created_at`, `user_id` | Container organizing global multi-question groups. |
| **`Questions`** | `id`, `title`, `type` (`MCQ` etc), `options` (jsonb), `marks`, `correct_option` | Granular question parameters supporting structured options pools. |
| **`Test`** | `id`, `title`, `start_time`, `end_time`, `duration`, `classroom_id` | Configures active assessment constraints within a room. |
| **`Test Question`** | `id`, `order` (integer), `question_id`, `test_id` | Cross-references specific questions inside structured tests. |
| **`Submissions`** | `id`, `selected_option`, `answer_text`, `marks_obtained`, `student_id` | Final logs recording individual student exam execution parameters. |

---

## Repository Workspaces

```text
.
├── backend/                   # Python Django Monolithic Engine
│   ├── myapp/                 # Core server entry configuration files
│   ├── classrooms/            # Subject rooms, student rosters & access flows
│   ├── questions/             # Data models organizing master question pools
│   ├── tests/                 # Core exam evaluation logic and auto-grading
│   ├── users/                 # Custom User authentication & registration
│   └── manage.py              # CLI administrative utility
└── frontend/                  # React.js SPA Engine
    ├── public/                # Document base assets
    └── src/                   # React root codebase
        ├── assets/            # Static image and media definitions
        ├── components/        # Component groupings divided by functional domains
        │   ├── auth/          # Login, OTP Verification, Register & Guard components
        │   ├── classroom/     # Feed streams, member lists, and class cards
        │   ├── nav/           # Adaptive navigation side drawers and bars
        │   └── quiz/          # Creation forms & dynamic exam runner interfaces
        ├── hooks/             # Stateful custom react interface lifecycle hooks
        └── store/             # Global system-wide state initialization matrices
