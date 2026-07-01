# Automation of Exam Administration

A robust, university-grade digital examination and virtual classroom platform inspired by Google Classroom[cite: 1]. This system automates repetitive academic workflows by allowing instructors to manage subject-specific rooms, broadcast announcements, compile question pools, and deliver time-restricted assessments with auto-grading capabilities[cite: 1].

---

## Core Features and Implementation Details

### Secure Authentication and RBAC
* **OTP-Based Registration:** Eliminates unauthorized registrations using an email-based One-Time Password (OTP) verification service with a built-in 30-second security cooldown loop[cite: 1].
* **Role-Specific Routing:** Seamlessly segments users post-login into distinct dashboard instances optimized for either Teachers or Students[cite: 1].
* **Forgot Password:** Embedded email-link recovery handling system[cite: 1].

### Virtual Classroom Management
* **Class Hub Structure:** Instructors can create isolated online spaces for individual subjects[cite: 1]. Every space generates a unique join code (e.g., `J4BIXF`, `309K8T`) for student self-enrollment[cite: 1].
* **Stream and Announcements:** A dedicated micro-feed inside each room allowing teachers to post updates visible directly to the room's student roster[cite: 1].
* **Roster Audit:** A clean "People" view map showing all active teachers and enrolled classmates within that room[cite: 1].

### Comprehensive Assessment Engine
* **Quiz Constructor:** Teachers can assemble tests by defining titles, custom durations, start/end deadlines, point allocations, and question types[cite: 1].
* **Tab-Switching Restriction (Academic Integrity):** To ensure assessment validity, the active test window logs student focus loss[cite: 1]. If a student switches browser tabs or desktop applications frequently, they receive a maximum of two warnings before the engine triggers an automatic test submission[cite: 1].
* **Auto-Evaluation UI:** On submission, the application maps choices against pre-stored relational key fields to output instantaneous results, detailing raw scores, percentages, and correct/incorrect answer breakdowns[cite: 1].

---

## Architecture and Tech Stack

The system utilizes a decoupled architecture communicating over structured APIs[cite: 1]:
* **Frontend Ecosystem:** React.js, JavaScript (ES6+), HTML5, CSS3[cite: 1]
* **State and Utilities:** Modular React context structures, custom hooks, and event handlers[cite: 1]
* **Backend Ecosystem:** Python, Django Web Framework & Django REST Framework (DRF)[cite: 1]
* **Database Management:** PostgreSQL relational database engine[cite: 1]

---

## Relational Database Schema

The backend architecture is mapped over the following primary relational tables implemented in PostgreSQL[cite: 1]:

| Table Entity | Key Columns & Types | Purpose / Relations |
| :--- | :--- | :--- |
| **`Users`** | `id` (bigint), `email`, `username`, `password`, `role` (`T` or `S`), `is_active` | System-wide authentication profiles[cite: 1]. |
| **`OTP`** | `id` (bigint), `email`, `code` (varchar), `created_at`, `is_used` | Tracks single-use registration verification strings[cite: 1]. |
| **`Class Room`** | `id` (bigint), `name`, `code` (unique class invite code), `creator_id` | Subject-specific spaces mapped back to an instructor ID[cite: 1]. |
| **`Class room enrollment`** | `id`, `classroom_id`, `student_id`, `date_joined` | Many-to-Many associative mapping of students to rooms[cite: 1]. |
| **`Announcement`** | `id`, `title`, `content` (text), `created_at`, `classroom_id` | Notification entries bounded to a specific classroom scope[cite: 1]. |
| **`Question Bank`** | `id`, `created_at`, `user_id` | Container organizing global multi-question groups[cite: 1]. |
| **`Questions`** | `id`, `title`, `type` (`MCQ` etc), `options` (jsonb), `marks`, `correct_option` | Granular question parameters supporting structured options pools[cite: 1]. |
| **`Test`** | `id`, `title`, `start_time`, `end_time`, `duration`, `classroom_id` | Configures active assessment constraints within a room[cite: 1]. |
| **`Test Question`** | `id`, `order` (integer), `question_id`, `test_id` | Cross-references specific questions inside structured tests[cite: 1]. |
| **`Submissions`** | `id`, `selected_option`, `answer_text`, `marks_obtained`, `student_id` | Final logs recording individual student exam execution parameters[cite: 1]. |

---

## Repository Workspaces

```text
.
├── backend/                   # Python Django Monolithic Engine
│   ├── myapp/                 # Core server entry configuration files[cite: 1]
│   ├── classrooms/            # Subject rooms, student rosters & access flows[cite: 1]
│   ├── questions/             # Data models organizing master question pools[cite: 1]
│   ├── tests/                 # Core exam evaluation logic and auto-grading[cite: 1]
│   ├── users/                 # Custom User authentication & registration[cite: 1]
│   └── manage.py              # CLI administrative utility[cite: 1]
└── frontend/                  # React.js SPA Engine
    ├── public/                # Document base assets[cite: 1]
    └── src/                   # React root codebase[cite: 1]
        ├── assets/            # Static image and media definitions[cite: 1]
        ├── components/        # Component groupings divided by functional domains[cite: 1]
        │   ├── auth/          # Login, OTP Verification, Register & Guard components[cite: 1]
        │   ├── classroom/     # Feed streams, member lists, and class cards[cite: 1]
        │   ├── nav/           # Adaptive navigation side drawers and bars[cite: 1]
        │   └── quiz/          # Creation forms & dynamic exam runner interfaces[cite: 1]
        ├── hooks/             # Stateful custom react interface lifecycle hooks[cite: 1]
        └── store/             # Global system-wide state initialization matrices[cite: 1]
