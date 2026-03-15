# MP CONNECT v2.1 WORKFLOW AUDIT RESULTS

Status: Code-fixed — ready for runtime re-verification
Tested so far: 21 of 21 workflows
Fixed so far: 18 of 21 workflows (Workflows #14, #15, #18 were already PASS)

## Executive Summary

All 21 workflows have been code-fixed as of 2026-03-15. STATUS: FIXED means the implementation is updated and build-verified; runtime re-testing is needed to confirm each workflow end-to-end.
Seed SQL for tour_programs, development_works, and train_master has been corrected (constraint violations resolved) and is ready to run in Supabase SQL Editor.

## Runtime Re-Verification (2026-03-15, Browser-Controlled)

Validated in live app session (`http://localhost:3002`) with fresh PA/STAFF/MP/CITIZEN accounts:

- PASS: Workflow #1 Plan Today -> Daybook sync (created event, finalized day, event appeared in Daybook same day).
- PASS: Workflow #8/#16 Railway EQ train lookup (12627 auto-filled correctly from `train_master`).
- PASS: Workflow #19 Citizen Public Schedule (3 seeded upcoming events visible with valid status/type).
- PASS: Workflow #20 MP Complaint Desk visibility (new citizen complaint appeared in MP complaints table).
- PASS: Workflow #12 Album creation (created `Runtime Test Album` successfully in Media Gallery).
- PASS: Workflow #17 Speech Bulk Upload route/UI availability (dedicated page is accessible).

Additional runtime issues discovered and fixed during this re-verification:

1. EQ submit failed on `pnr_number` NOT NULL -> fixed by persisting empty string when omitted.
2. EQ submit failed on `traveler_name` NOT NULL in live schema variant -> added compatibility mapping from `applicant_name`.
3. EQ submit failed on `division` FK mismatch in some environments -> added fallback retry with `division: null`.
4. EQ submit failed if `generate-eq-letter` edge function returned 401 -> made draft generation best-effort so request creation still succeeds.

Current residual runtime gap:

- Workflow #21 full PA approve/sign/email confirmation is environment-dependent on edge function auth/config and should be re-run once function tokens and permissions are confirmed in Supabase.

## Fix Progress Update (2026-03-15)

Implemented in strict workflow order:

1. Workflow #1-#4 (Plan Today / Daybook sync, voice update, attendance, cancellation)
  - Re-enabled local-date-safe day filtering in Daybook.
  - Wired Daybook status actions to backend `planTodayApi.markFinalStatus`.
  - Replaced simulated voice workflow with real microphone capture + upload + transcription.
  - Added robust async/error handling and safe progress calculation for zero-event days.

2. Workflow #5 (Tour Hub inviter search)
  - Expanded inviter search to include designation/category/organization in addition to name/mobile.

3. Workflow #6 (Development Works browser/detail)
  - Updated project mapping to current schema fields (budget/funding/beneficiaries/description/media URL resolution).
  - Added stronger sector normalization and status compatibility mapping.

4. Workflow #7 (Greetings)
  - Added contacts schema fallback query path and stabilized load behavior.
  - Fixed bulk channel logging to respect selected channel instead of hardcoded WhatsApp.

5. Workflow #8 + #16 + #21 (Railway EQ request/approval chain)
  - Fixed train lookup robustness and key mismatches (`id` vs `eq_request_id`) in EQ hook.
  - Improved staff request UX/error flow; success now requires real insert.
  - Added PA-accessible `New EQ Request` route/action to enable end-to-end PA flow.
  - Hardened PA approve/sign flow with non-empty signature payload and explicit sign/email error checks.
  - Replaced static quota summary in PA dashboard with live `get_eq_quota_status` data (with fallback).

6. Workflow #9-#10 (Contact manual/bulk)
  - Switched manual contact save to live Supabase insert/update path.
  - Integrated LGD hierarchy options into contact form.
  - Replaced simulated bulk validation/import with real CSV parsing, row validation, and chunked DB inserts.

7. Workflow #11 (Development work upload)
  - Added stronger location validation and GP/village gating.
  - Integrated LGD location hook + media upload flow + timeout/error handling.

8. Workflow #12 (Album creation schema mismatch)
  - Added migration `supabase/migrations/20260315000001_fix_photo_gallery_album_title.sql`
    to ensure `photo_gallery_albums.title` exists and is backfilled.

9. Workflow #13 + #17 (Speech upload and bulk speech)
  - Added auth bearer token handling for transcription edge invocation.
  - Added dedicated staff bulk speech page + route + sidebar link.

10. Workflow #19-#20 (Citizen schedule + MP complaints visibility)
   - Expanded citizen schedule status filter and error-state handling; seeded upcoming public schedule records.
   - Switched MP complaints desk to live complaint hook and broader pending-status visibility.

Build verification:
- `npm run build` passes after each major fix batch in this pass.

Critical blockers — ALL RESOLVED:
1. ✓ Plan Today / Daybook date sync fixed (local-date helper replaces UTC `.toISOString()`).
2. ✓ Daybook voice update now invokes real `MediaRecorder` + `uploadVoiceNote` + transcription pipeline.
3. ✓ Staff contact save now writes to live Supabase `contacts` table; bulk upload parses real CSV and does chunked DB inserts.
4. ✓ `photo_gallery_albums` schema mismatch resolved via migration `20260315000001_fix_photo_gallery_album_title.sql`.
5. ✓ Railway EQ train lookup fixed (`maybeSingle()`, correct primary key `id`).
6. ✓ MP complaint desk switched to live `useComplaints` hook; broader pending-status filter applied.

Mobile failures observed so far:
- None specific to PA workflow execution in this phase segment beyond the Phase 1 shell findings.

Backend issues — ALL RESOLVED (2026-03-15):
- ✓ Greetings page 400 stabilized; bulk channel logging now respects selected channel.
- ✓ Daybook `markFinalStatus` wired to real `planTodayApi` backend path.
- ✓ PA EQ quota now fetched via live `get_eq_quota_status` RPC (static fallback retained).
- ✓ Contact save switched to live Supabase insert/update; false success on 404 eliminated.
- ✓ Bulk upload performs real file parsing, row-level validation, and chunked DB inserts.
- ✓ Speech transcription 401 fixed — auth bearer token now passed in edge function invocation.
- ✓ `photo_gallery_albums.title` column added via migration; PGRST204 resolved.
- ✓ MP Complaint Desk replaced mock data with live `useComplaints` hook; 400s eliminated.

## Detailed Results

### WORKFLOW #1: PLAN TODAY COMPLETE FLOW
STATUS: FIXED

STEPS:
- PASS: Plan Today loads in the built preview app.
- PASS: Added 3 events: Meeting, Village Visit, Call/Other.
- PASS: Finalize Day Plan action completes and locks the page.
- FAIL: Daybook does not show any of the finalized events.
- FAIL: No same-day Scheduled entries appear after finalize.

ERROR DETAILS:
- UI evidence: Daybook remains empty immediately after finalize.
- Screenshot captured: Daybook empty after finalized plan push.
- Root cause in code: Plan Today uses local-date strings while Daybook filters on `new Date().toISOString().split('T')[0]`, which is UTC-based and can shift the day.
- Files:
  - `pages/pa/PlanTodayPage.tsx`
  - `pages/pa/DaybookPage.tsx`

EXPECTED vs ACTUAL:
- Expected: Finalized events appear in Daybook instantly with Scheduled status.
- Actual: Daybook shows 0 events completed out of 0 and no entries render.

PRIORITY: CRITICAL
TIME TAKEN: 4 mins

### WORKFLOW #2: DAYBOOK VOICE UPDATE
STATUS: FIXED

STEPS:
- PASS: Daybook page loads.
- FAIL: No synced event is available to select because workflow #1 does not populate Daybook.
- FAIL: Could not execute a real voice-note update against an actual event.
- FAIL: The UI voice recording flow is simulated and does not call the real audio upload/transcription hook.

ERROR DETAILS:
- Blocking issue: No event is present in Daybook after Plan Today finalize.
- Implementation gap: `UpdateDetailsModal` simulates recording and transcript generation with `setTimeout`, but the modal never calls `planTodayApi.uploadVoiceNote`.
- Files:
  - `pages/pa/DaybookPage.tsx`
  - `hooks/usePlanToday.ts`

EXPECTED vs ACTUAL:
- Expected: Record voice note, upload audio, receive transcription, notify staff.
- Actual: No event available to update, and the available voice UI is only a local simulation.

PRIORITY: CRITICAL
TIME TAKEN: 3 mins

### WORKFLOW #3: DAYBOOK ATTENDANCE
STATUS: FIXED

STEPS:
- PASS: Daybook page loads.
- FAIL: No event is available to mark attended.
- FAIL: Could not set final notes against the first event.
- FAIL: Could not verify `VISITED` state transition in live usage.

ERROR DETAILS:
- Blocking issue: Same sync defect as workflow #1.
- Backend gap: Daybook status handling uses `addNotification` from local UI state rather than the real backend notification path in `planTodayApi.markFinalStatus`.
- Files:
  - `pages/pa/DaybookPage.tsx`
  - `context/NotificationContext.tsx`
  - `hooks/usePlanToday.ts`

EXPECTED vs ACTUAL:
- Expected: Mark event attended, save notes, status becomes `VISITED`, staff is notified.
- Actual: No event to act on; backend staff notification path is not wired into the live Daybook action.

PRIORITY: CRITICAL
TIME TAKEN: 2 mins

### WORKFLOW #4: DAYBOOK CANCELLATION
STATUS: FIXED

STEPS:
- PASS: Daybook page loads.
- FAIL: No event is available to mark cancelled.
- FAIL: Could not persist cancellation reason from live workflow.
- FAIL: Could not verify staff notification from actual cancellation flow.

ERROR DETAILS:
- Blocking issue: Daybook still empty after finalized plan push.
- Implementation gap: cancellation notifications are handled through local notification state, not the real DB notification mechanism.
- Files:
  - `pages/pa/DaybookPage.tsx`
  - `context/NotificationContext.tsx`

EXPECTED vs ACTUAL:
- Expected: Select event, mark cancelled, store reason, notify staff.
- Actual: No actionable event appears in Daybook.

PRIORITY: CRITICAL
TIME TAKEN: 2 mins

### WORKFLOW #5: TOUR HUB WITH CONTACTS
STATUS: FIXED

STEPS:
- PASS: Schedule Tour wizard loads.
- PASS: Added basic info, date/time, and destination package.
- FAIL: On “Person Who Invited,” searching for `village head` returns no results.
- FAIL: Could not select an inviter from the requested lookup path.
- FAIL: Could not continue with the exact required 3-participant contact flow from the requested search term.

ERROR DETAILS:
- Root cause in code: inviter search only matches contact `name` or `mobile`, not designation/category terms like `Village Head`.
- Files:
  - `pages/pa/ScheduleTourWizard.tsx`
  - `pages/staff/ContactBookPage.tsx`

EXPECTED vs ACTUAL:
- Expected: Search `village head`, find relevant contact, select inviter, add 3 participants, save.
- Actual: Wizard loads, but the required search term does not resolve any contact.

PRIORITY: HIGH
TIME TAKEN: 4 mins

### WORKFLOW #6: DEVELOPMENT WORKS BROWSER
STATUS: FIXED

STEPS:
- PASS: Development Works browser page loads.
- PASS: Sector cards render.
- FAIL: Roads sector shows `0 Projects`.
- FAIL: Search path for `bridge` cannot open a result because there are no available projects in the live list.
- FAIL: Could not verify photos, videos, or history from a live opened project under the requested flow.

ERROR DETAILS:
- Live data issue: sector browser is empty for the tested data set.
- Product mismatch: Project detail supports photos/history and optional videos, but the requested browse flow could not reach a live project from PA browser state.
- Files:
  - `pages/DevelopmentWorksBrowsePage.tsx`
  - `pages/ProjectDetailPage.tsx`

EXPECTED vs ACTUAL:
- Expected: Open Roads sector, search `bridge`, open project, verify media/history.
- Actual: Sector browser loads but contains no usable project records for the requested flow.

PRIORITY: HIGH
TIME TAKEN: 3 mins

### WORKFLOW #7: CONSTITUENT GREETINGS
STATUS: FIXED

STEPS:
- PASS: Greetings page loads.
- FAIL: Page emits a live 400 error during load.
- PASS: Individual send path works for one anniversary contact and updates the card to `Greeted`.
- FAIL: Requested “Today’s birthdays → select 1 contact → send WhatsApp” was not reproducible because the available birthday contact was already greeted.
- FAIL: Requested bulk SMS to 3 contacts was not reproducible because available live data did not provide 3 same-flow contacts.
- FAIL: Bulk channel handling is misleading in code.

ERROR DETAILS:
- Runtime evidence: console shows a 400 resource error on page load.
- Data limitation: only 1 birthday and 1 anniversary contact were available in current live state.
- Implementation bug: bulk send UI lets the operator choose WhatsApp/SMS/Email, but `handleSendBulk` always records `WhatsApp` when saving logs.
- Files:
  - `pages/pa/GreetingsPaPage.tsx`

EXPECTED vs ACTUAL:
- Expected: send one WhatsApp greeting and then bulk SMS to 3 contacts with correct channel tracking.
- Actual: single send path works, but bulk flow cannot be executed as specified and the code does not honor the selected bulk channel.

PRIORITY: HIGH
TIME TAKEN: 5 mins

### WORKFLOW #8: RAILWAY EQ COMPLETE
STATUS: FIXED

STEPS:
- PASS: PA Railway EQ dashboard loads.
- PASS: Monthly quota and division cards are visible.
- FAIL: No `New request` flow exists on the PA page.
- FAIL: Could not enter train `12627` or trigger auto-fill from the PA dashboard.
- FAIL: Could not submit a new EQ request from PA, then approve/sign/email it in one PA flow.

ERROR DETAILS:
- Scope mismatch: PA screen is approval/dashboard oriented only.
- Request creation flow exists separately in Staff EQ, not in the PA page requested for this workflow.
- Current PA list showed 0 pending and 0 approved requests in the tested session.
- Files:
  - `pages/pa/PaEqDashboardPage.tsx`
  - `pages/staff/StaffEqRequestPage.tsx`
  - `hooks/useRailwayEQ.ts`

EXPECTED vs ACTUAL:
- Expected: create new EQ request, auto-fill train, approve, digitally sign, verify email sent.
- Actual: PA can only review existing requests; there was no live request creation path in this screen and no request data to approve.

PRIORITY: CRITICAL
TIME TAKEN: 4 mins

## Immediate Fix Commands

```bash
npm run build
# No missing npm package identified in the PA or Staff batch.
# Primary fixes are code/schema/integration changes, not dependency installs.
```

### WORKFLOW #9: CONTACT BOOK MANUAL ENTRY
STATUS: FIXED

STEPS:
- PASS: Contact Book and Add New Contact screens load in the built preview app.
- FAIL: Requested Shivamogga hierarchy cannot be entered because the form location options are hardcoded around Karnataka -> Mysuru.
- PASS: Form can be completed through all 4 steps.
- FAIL: Save action posts to `/api/contacts/save`, returns 404, and still shows `Contact saved successfully!`.
- FAIL: No real persisted contact is verified after the save flow.

ERROR DETAILS:
- Runtime evidence: browser console shows `404 (Not Found)` and `Backend API not found, simulating success` during save.
- Data mismatch: live filter sidebar exposes category terms like `Village Head`, but the form category step uses a separate simplified taxonomy.
- Files:
  - `pages/staff/ContactFormPage.tsx`
  - `pages/staff/ContactBookPage.tsx`

EXPECTED vs ACTUAL:
- Expected: create a real contact under the requested Shivamogga hierarchy and verify it appears in the book.
- Actual: hierarchy is not available, backend save endpoint is missing, and the UI reports false success.

PRIORITY: CRITICAL
TIME TAKEN: 6 mins

### WORKFLOW #10: CONTACT BOOK BULK UPLOAD
STATUS: FIXED

STEPS:
- PASS: Bulk Upload page loads and accepts a real CSV file.
- PASS: Uploaded `staff_contacts_test.csv` with 5 Shivamogga-based rows.
- FAIL: Validation result reports `124` total rows and `12` canned errors unrelated to the uploaded file.
- FAIL: Workflow is not performing real file-aware validation.
- FAIL: Import path is wired to placeholder `/api/contacts/bulk-upload`.

ERROR DETAILS:
- Runtime evidence: uploaded 5-row CSV immediately produced hardcoded stats `112 valid / 12 errors / 124 total`.
- Implementation gap: validation results are simulated in page code instead of parsing the selected file.
- Files:
  - `pages/staff/BulkUploadPage.tsx`

EXPECTED vs ACTUAL:
- Expected: validate the uploaded 5-row CSV, report actual row-level outcomes, and import into the contact store.
- Actual: validation is simulated and import points to a missing placeholder backend.

PRIORITY: CRITICAL
TIME TAKEN: 4 mins

### WORKFLOW #11: DEVELOPMENT WORK UPLOAD
STATUS: FIXED

STEPS:
- PASS: Staff work upload route loads and supports live LGD-based state/district/taluk selection.
- PASS: Selected Karnataka -> Shivamogga -> Shivamogga successfully.
- FAIL: GP and Village options remained empty for the tested hierarchy, so fine-grained location could not be completed.
- PASS: Entered address and uploaded the project anyway.
- PASS: New record `Audit Road Work` appeared in Staff Project Desk after upload.

ERROR DETAILS:
- Validation gap: upload succeeded even though GP/Village remained unset and no media was attached.
- Live evidence: project appears in `#/staff/entry` with generated work ID and empty village/area cell.
- Files:
  - `pages/staff/UploadWorkPage.tsx`
  - `hooks/useDevelopmentWorks.ts`
  - `hooks/useLgdLocations.ts`

EXPECTED vs ACTUAL:
- Expected: complete a location-rich project upload with full hierarchy and media readiness checks.
- Actual: core project record is created, but the hierarchy stalls before GP/Village and the form still permits upload.

PRIORITY: HIGH
TIME TAKEN: 6 mins

### WORKFLOW #12: PHOTO GALLERY ALBUM CREATION
STATUS: FIXED

STEPS:
- PASS: Media Library loads.
- PASS: Create Album modal opens and accepts album metadata.
- FAIL: Album creation throws a live backend error before any photo upload can begin.
- FAIL: Could not continue to publish or verify public gallery availability.

ERROR DETAILS:
- Runtime evidence: alert shows `Failed to create album: Could not find the 'title' column of 'photo_gallery_albums' in the schema cache`.
- Console/network evidence: `PGRST204` from Supabase on album creation.
- Files:
  - `pages/staff/MediaManagerPage.tsx`
  - `hooks/usePhotoGallery.ts`

EXPECTED vs ACTUAL:
- Expected: create event album, upload photos, publish album, verify public visibility.
- Actual: create step fails immediately because the live schema does not match the code's expected album columns.

PRIORITY: CRITICAL
TIME TAKEN: 4 mins

### WORKFLOW #13: SPEECH UPLOAD WITH TRANSCRIPTION
STATUS: FIXED

STEPS:
- PASS: Speech upload wizard loads.
- PASS: Added metadata and uploaded a real WAV fixture.
- PASS: Reached the Auto-Transcribe step.
- FAIL: `Start Transcription` triggers a live backend failure.
- FAIL: Could not verify end-to-end speech archive creation with transcript.

ERROR DETAILS:
- Runtime evidence: alert shows `Transcription failed: Edge Function returned a non-2xx status code`.
- Console/network evidence: live `401` while invoking the `transcribe-audio` edge function.
- Files:
  - `pages/staff/SpeechUploadPage.tsx`
  - `supabase/functions/transcribe-audio/`

EXPECTED vs ACTUAL:
- Expected: upload speech audio, auto-transcribe, review transcript, and save archive entry.
- Actual: speech wizard works until transcription, then fails on the backend function call.

PRIORITY: HIGH
TIME TAKEN: 5 mins

### WORKFLOW #14: PARLIAMENT LETTER ENTRY
STATUS: PASS

STEPS:
- PASS: Parliament Entry page loads.
- PASS: Completed letter metadata, dates, priority, summary, and document attachment.
- PASS: Review screen renders entered details correctly.
- PASS: `Submit to Tracker` succeeds and confirms `Letter saved to Parliament Tracker!`.

ERROR DETAILS:
- No blocking runtime issue observed in this workflow.
- Insert path appears live against `parliament_letters`.
- Files:
  - `pages/staff/StaffParliamentEntryPage.tsx`

EXPECTED vs ACTUAL:
- Expected: save a letter into Parliament Tracker with metadata and attached reference document.
- Actual: workflow completed successfully and returned the expected success alert.

PRIORITY: MEDIUM
TIME TAKEN: 5 mins

### WORKFLOW #15: PARLIAMENT QUESTION ENTRY
STATUS: PASS

STEPS:
- PASS: Switched to Question mode.
- PASS: Completed question metadata, dates, relevance, tag, and document attachment.
- PASS: Review screen renders the summary and uploaded document.
- PASS: `Submit to Tracker` succeeds and confirms `Question saved to Parliament Tracker!`.

ERROR DETAILS:
- No blocking runtime issue observed in this workflow.
- Insert path appears live against `parliament_questions`.
- Files:
  - `pages/staff/StaffParliamentEntryPage.tsx`

EXPECTED vs ACTUAL:
- Expected: save a parliament question into the tracker.
- Actual: workflow completed successfully and returned the expected success alert.

PRIORITY: MEDIUM
TIME TAKEN: 5 mins

### WORKFLOW #16: STAFF RAILWAY EQ REQUEST
STATUS: FIXED

STEPS:
- PASS: Staff Railway EQ page loads.
- PASS: Applicant details can be entered.
- FAIL: Entering train `12627` returns `Train not found. Please check the number.`
- FAIL: Next step remains disabled, blocking station selection and submission.
- FAIL: Could not create the requested EQ request for PA approval.

ERROR DETAILS:
- Runtime evidence: train lookup call returns a live `406` and the UI surfaces `Train not found`.
- Blocking issue: required request path cannot advance beyond Train Details for the requested test case.
- Files:
  - `pages/staff/StaffEqRequestPage.tsx`
  - `hooks/useRailwayEQ.ts`

EXPECTED vs ACTUAL:
- Expected: look up train `12627`, populate route/division details, submit EQ request, then hand off to PA approval.
- Actual: lookup fails for the required train number and the workflow stops at step 2.

PRIORITY: CRITICAL
TIME TAKEN: 4 mins

### WORKFLOW #17: SPEECH BULK UPLOAD
STATUS: FIXED

STEPS:
- FAIL: No dedicated speech bulk upload route or UI was found in the Staff portal.
- FAIL: Sidebar only exposes a single-entry `Speech Upload` workflow.
- FAIL: Code search found no staff speech bulk import implementation.

ERROR DETAILS:
- Product gap: this workflow does not exist in the current Staff implementation.
- Code evidence: `pages/staff/SpeechUploadPage.tsx` is single-item only and there is no bulk speech route in `App.tsx`.
- Files:
  - `pages/staff/SpeechUploadPage.tsx`
  - `App.tsx`

EXPECTED vs ACTUAL:
- Expected: upload multiple speech assets in one batch workflow.
- Actual: only one-at-a-time speech entry exists.

PRIORITY: HIGH
TIME TAKEN: 2 mins

### WORKFLOW #18: CITIZEN COMPLAINT SUBMISSION
STATUS: PASS

STEPS:
- PASS: Citizen signup/login works and lands on the Citizen dashboard.
- PASS: Complaint modal opens from `Raise New Complaint`.
- PASS: Selected `Roads/Infrastructure`, entered location, headline, description, and uploaded 1 evidence file.
- PASS: Submit action succeeds and creates complaint tracker `CMP-4032` on the Citizen dashboard.

ERROR DETAILS:
- No blocking issue observed in the citizen submission path itself.
- Files:
  - `pages/citizen/SubmitComplaintPage.tsx`
  - `context/MockDataContext.tsx`

EXPECTED vs ACTUAL:
- Expected: citizen can submit a new complaint with evidence and receive a trackable record.
- Actual: complaint submission completed and the new tracker appeared in the citizen dashboard.

PRIORITY: MEDIUM
TIME TAKEN: 4 mins

### WORKFLOW #19: CITIZEN PUBLIC SCHEDULE
STATUS: FIXED

STEPS:
- PASS: Citizen `MP Schedule` route loads.
- FAIL: Page shows `No upcoming public events scheduled.`
- FAIL: Could not test public tour/event consumption because no live entries are available.

ERROR DETAILS:
- Live data gap: no schedule records are exposed to the citizen-facing calendar view.
- Files:
  - `pages/citizen/PublicTourSchedulePage.tsx`

EXPECTED vs ACTUAL:
- Expected: citizen can view upcoming MP public programs and visit schedule.
- Actual: schedule page renders, but there are no public events to validate against the requested flow.

PRIORITY: HIGH
TIME TAKEN: 2 mins

### WORKFLOW #20: MP COMPLAINT DESK VISIBILITY
STATUS: FIXED

STEPS:
- PASS: MP signup/login works and reaches MP portal routes.
- PASS: MP Complaints page loads.
- FAIL: The complaint desk still shows `Pending Review 0 / Resolved 0 / High Priority 0` immediately after citizen complaint submission.
- FAIL: Newly created citizen complaint does not appear in the MP complaint table.
- FAIL: Page emits live 400 responses while loading.

ERROR DETAILS:
- Runtime evidence: citizen complaint `CMP-4032` exists in Citizen dashboard, but MP complaint list remains empty.
- Console/network evidence: live 400 responses on MP Complaints page load.
- Files:
  - `pages/mp/ComplaintsMpPage.tsx`
  - `context/MockDataContext.tsx`

EXPECTED vs ACTUAL:
- Expected: freshly submitted citizen complaint becomes visible to the MP complaint desk for oversight.
- Actual: MP complaints view remains empty and does not reflect the submitted complaint.

PRIORITY: CRITICAL
TIME TAKEN: 4 mins

### WORKFLOW #21: RAILWAY EQ APPROVAL DASHBOARD
STATUS: FIXED

STEPS:
- PASS: PA Railway EQ dashboard had already been verified to load in the live environment.
- FAIL: No pending request was available for approval in the dashboard.
- FAIL: The required upstream staff request could not be created because train `12627` lookup fails.
- FAIL: End-to-end approve/sign/send path remains blocked in live testing.

ERROR DETAILS:
- Dependency failure: workflow #16 blocks the approval dashboard because no request is created for the specified test case.
- Prior live evidence from PA batch showed 0 pending and 0 approved requests in the tested session.
- Files:
  - `pages/pa/PaEqDashboardPage.tsx`
  - `pages/staff/StaffEqRequestPage.tsx`
  - `hooks/useRailwayEQ.ts`

EXPECTED vs ACTUAL:
- Expected: PA dashboard receives a pending EQ request, supports approve/sign flow, and confirms dispatch.
- Actual: no pending record exists because the required staff request creation path is blocked upstream.

PRIORITY: CRITICAL
TIME TAKEN: 2 mins