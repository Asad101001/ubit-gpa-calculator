# 🗄️ Database Architecture & Security Policies

The backend utilizes **Supabase (PostgreSQL 15)** with Row-Level Security (RLS) and relational constraints to guarantee zero data tampering.

---

## 1. Relational Schema

```mermaid
erDiagram
    auth_users {
        uuid id PK "Supabase Auth UID"
        string email
    }
    
    profiles {
        uuid id PK "References auth.users(id)"
        string email "Unique user email"
        string full_name "Student Name"
        string seat_no UK "FK to student_results(seat_no)"
        boolean is_admin "Administrative privilege flag"
        boolean is_verified "Account verification status"
        boolean show_results_publicly "Default true; false = private"
        timestamp created_at
    }
    
    student_results {
        string seat_no PK "Format: B24110006XXX"
        string name "Student Official Name"
        int cs351 "Programming Fundamentals"
        int cs353 "Intro to ICT"
        int cs355 "Calculus & Analytical Geometry"
        int cs357 "Applied Physics"
        int cs359 "Functional English"
        int cs361 "Ideology & Constitution of Pakistan"
        int cs352 "Object Oriented Programming"
        int cs354 "Digital Logic Design"
        int cs356 "Multivariable Calculus"
        int cs358 "Discrete Mathematics"
        int cs360 "Communication Skills"
        int cs362 "Islamic Studies / Ethics"
        int cs451 "Semester 3 Subject 1"
        int cs453 "Semester 3 Subject 2"
        int cs455 "Semester 3 Subject 3"
        int cs457 "Semester 3 Subject 4"
        int cs459 "Semester 3 Subject 5"
        int cs461 "Semester 3 Subject 6"
        boolean is_hidden "Redaction flag"
        timestamp updated_at
    }

    auth_users ||--o| profiles : "creates"
    student_results ||--o| profiles : "1:1 unique foreign key linkage"
```

---

## 2. Row-Level Security (RLS) Specifications

### `profiles` Table
| Policy Name | Action | Scope | Condition |
|---|---|---|---|
| `Public can view visibility settings` | `SELECT` | Public / Anon | `true` (Allows reading `seat_no` and `show_results_publicly` for directory masking) |
| `Users can read own profile` | `SELECT` | Authenticated | `auth.uid() = id` |
| `Admin can read all profiles` | `SELECT` | Authenticated | `is_admin()` |
| `Users can update own profile` | `UPDATE` | Authenticated | `auth.uid() = id` |
| `Admin can update all profiles` | `UPDATE` | Authenticated | `is_admin()` |

### `student_results` Table
| Policy Name | Action | Scope | Condition |
|---|---|---|---|
| `Allow public read-only access` | `SELECT` | Public / Anon | `true` |
| `Auth can update own results` | `UPDATE` | Authenticated | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.is_admin = true OR (profiles.is_verified = true AND profiles.seat_no = student_results.seat_no)))` |

---

## 3. SQL Migrations Reference

All executable migration scripts reside in [`supabase/`](file:///c:/Users/Asad/Desktop/ubit-gpa-calculator/supabase):

1. **`supabase/schema.sql`**: Full baseline table schema, foreign keys, helper functions (`is_admin()`), and security policies.
2. **`supabase/privacy-migration.sql`**: Ensures `is_hidden` column exists on `student_results`, applies the public visibility select policy on `profiles`, and syncs private accounts.
3. **`supabase/migrate-sem3.sql`**: Adds columns `cs451` through `cs461` for Semester 3 courses.
