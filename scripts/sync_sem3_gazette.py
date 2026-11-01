# scripts/sync_sem3_gazette.py
import json
import urllib.request
import os
from datetime import datetime, timezone
from build_verified_sem3_data import GAZETTE_CS457, GAZETTE_CS461

# ── 1. Read .env ─────────────────────────────────────────────────────────────
env = {}
with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line: continue
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('\'"')

supabase_url = env.get('VITE_SUPABASE_URL', '')
supabase_key = env.get('VITE_SUPABASE_ANON_KEY', '')
service_key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') or supabase_key

# ── 2. Identify Claimed Seats from Supabase Profiles ─────────────────────────
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/profiles?select=seat_no",
    headers={
        'apikey': service_key,
        'Authorization': f"Bearer {service_key}"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        profiles = json.load(resp)
        claimed_seats = set(p['seat_no'].upper().strip() for p in profiles if p.get('seat_no'))
except Exception as e:
    print(f"Warning: could not fetch profiles: {e}")
    claimed_seats = set()

print(f"Identified {len(claimed_seats)} claimed profile seats.")

# ── 3. Update public/fallback-results.json ────────────────────────────────────
with open('public/fallback-results.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

now_iso = datetime.now(timezone.utc).isoformat()
updated_count = 0

for student in records:
    seat = student.get('seat_no', '').upper().strip()
    if not seat: continue
    
    is_claimed = seat in claimed_seats
    changed = False

    # Sync CS-457
    if seat in GAZETTE_CS457:
        gazette_val = str(GAZETTE_CS457[seat])
        curr_val = student.get('cs457')
        has_existing_num = curr_val is not None and curr_val != '' and str(curr_val).isdigit()
        
        # If claimed and has a custom numeric mark, keep override; otherwise update with gazette
        if is_claimed and has_existing_num and curr_val != 'Results Unannounced':
            pass # keep override
        else:
            if curr_val != gazette_val:
                student['cs457'] = gazette_val
                changed = True

    # Sync CS-461
    if seat in GAZETTE_CS461:
        gazette_val = str(GAZETTE_CS461[seat])
        curr_val = student.get('cs461')
        has_existing_num = curr_val is not None and curr_val != '' and str(curr_val).isdigit()
        
        if is_claimed and has_existing_num and curr_val != 'Results Unannounced':
            pass # keep override
        else:
            if curr_val != gazette_val:
                student['cs461'] = gazette_val
                changed = True

    if changed:
        student['updated_at'] = now_iso
        updated_count += 1

records.sort(key=lambda s: s.get('seat_no', ''))
with open('public/fallback-results.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2)

print(f"Updated {updated_count} Section A student records in public/fallback-results.json.")

# ── 4. Push updates to Supabase student_results table ────────────────────────
print("\nSyncing updates to Supabase student_results table...")
success_db = 0
failed_db = 0

for student in records:
    seat = student.get('seat_no')
    cs457_val = student.get('cs457')
    cs461_val = student.get('cs461')
    
    patch_body = {
        'updated_at': now_iso
    }
    if cs457_val is not None:
        patch_body['cs457'] = int(cs457_val) if str(cs457_val).isdigit() else cs457_val
    if cs461_val is not None:
        patch_body['cs461'] = int(cs461_val) if str(cs461_val).isdigit() else cs461_val

    url = f"{supabase_url}/rest/v1/student_results?seat_no=eq.{seat}"
    req_data = json.dumps(patch_body).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=req_data,
        method='PATCH',
        headers={
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status in (200, 204):
                success_db += 1
            else:
                print(f"Warning: {seat} got status {resp.status}")
                failed_db += 1
    except Exception as e:
        print(f"Error updating {seat}: {e}")
        failed_db += 1

print(f"Supabase student_results sync complete: {success_db} updated, {failed_db} failed.")
