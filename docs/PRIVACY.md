# 🔒 Student Privacy & Visibility Architecture

Privacy is a core pillar of the **UBIT GPA Calculator & Results Hub**. This specification defines how student academic privacy is maintained across all views.

---

## 1. The Core Privacy Principle
Every student has the sovereign right to keep their academic marks confidential.

1. **Roster Preservation**: Students who elect privacy **remain in the class directory** under their official Seat Number and Name. They are never erased from the class roster.
2. **Strict Score Masking**: All numerical grades, course marks, and semester GPAs are masked with a bold `🔒 Hidden` badge in public views.
3. **Owner Exclusivity**: When the verified student is signed in to their personal account, they can view their own full marks in the **Profile (`#profile`)** view or in their personal result modal.
4. **Public Table Invariance**: In the public Results Table (`#results`), marks are masked for private students regardless of who is browsing (preventing shoulder-surfing or public display exposure).

---

## 2. Privacy Logic Matrix

| Viewer Type | Roster Visibility | Table Subject Marks | Result Card / Modal | PDF Transcript Export |
|---|---|---|---|---|
| **Public Guest** | ✅ Visible (`Name` + `Seat No`) | 🔒 Masked (`Hidden`) | 🔒 Masked (`GPA Hidden`) | 🚫 Disabled |
| **Classmate / Other User** | ✅ Visible (`Name` + `Seat No`) | 🔒 Masked (`Hidden`) | 🔒 Masked (`GPA Hidden`) | 🚫 Disabled |
| **Verified Student Owner** | ✅ Visible (`Name` + `Seat No`) | 🔒 Masked (`Hidden`) | 👁️ Full Marks (Private Confirmation) | ✅ Enabled (Own Record) |
| **Verified Administrator** | ✅ Visible (`Name` + `Seat No`) | 👁️ Inspectable (Toggle Mode) | 👁️ Inspectable | ✅ Enabled |

---

## 3. Account Deduplication & Claim Prevention
- Every student profile requires an exact `seat_no` matching the `student_results` database table.
- A PostgreSQL `UNIQUE` constraint on `profiles.seat_no` ensures that a seat number **can only ever be claimed once**.
- Unauthorized users cannot register or hijack another student's seat number.

---

## 4. How to Toggle Privacy (For Students)
1. Sign in to your verified account via the **Sign In** button.
2. Navigate to **Profile** in the navbar.
3. Locate the **Privacy & Results Visibility** card.
4. Click the toggle button:
   - **`Public (Visible)`**: Scores are visible in the directory.
   - **`Hidden (Private)`**: All scores are masked with `🔒 Hidden` across the portal.
