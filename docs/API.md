# 📡 API Reference

This document details all serverless functions operating under `/api`.

---

## 1. `GET /api/results`
Fetches the entire student results directory with privacy flags attached.

* **Authentication**: None (Public)
* **Response**: `200 OK`
* **Cache Headers**: `no-store, no-cache, must-revalidate`

```json
[
  {
    "seat_no": "B24110006001",
    "name": "STUDENT NAME",
    "cs351": 85,
    "cs352": 78,
    "is_hidden": false
  },
  {
    "seat_no": "B24110006087",
    "name": "MUHAMMAD ASAD KHAN",
    "cs351": 74,
    "cs352": 75,
    "is_hidden": true
  }
]
```

---

## 2. `POST /api/update-visibility`
Allows an authenticated student to toggle their marks visibility between Public and Private.

* **Authentication**: Required (`Authorization: Bearer <user_jwt>`)
* **Request Body**:
  ```json
  {
    "show_results_publicly": false
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "show_results_publicly": false
  }
  ```
* **Side Effects**:
  1. Updates `profiles.show_results_publicly`.
  2. Updates `student_results.is_hidden = !show_results_publicly`.

---

## 3. `POST /api/update-marks`
Updates subject marks for a student's own verified record or via administrator override.

* **Authentication**: Required (`Authorization: Bearer <user_jwt>`)
* **Request Body (Single Subject)**:
  ```json
  {
    "seat_no": "B24110006087",
    "subject_id": "cs351",
    "marks": 85
  }
  ```
* **Request Body (Batch Mode)**:
  ```json
  {
    "seat_no": "B24110006087",
    "marks_payload": {
      "cs351": 85,
      "cs353": 90,
      "cs451": null
    }
  }
  ```
* **Validation**:
  - `marks` must be between `0` and `100` or `null` (representing unannounced/missing marks).
  - Only authenticated owners matching `seat_no` or administrators (`is_admin = true`) are permitted.

---

## 4. `GET /api/leaderboard` & `POST /api/submit`
Manages the opt-in class leaderboard rankings, anonymous placement, and dynamic percentiles.
