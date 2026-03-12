export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    role: 'MP' | 'PA' | 'OFFICE_STAFF' | 'FIELD_STAFF' | 'CITIZEN'
                    mobile: string | null
                    is_active: boolean
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    role: 'MP' | 'PA' | 'OFFICE_STAFF' | 'FIELD_STAFF' | 'CITIZEN'
                    mobile?: string | null
                    is_active?: boolean
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    role?: 'MP' | 'PA' | 'OFFICE_STAFF' | 'FIELD_STAFF' | 'CITIZEN'
                    mobile?: string | null
                    is_active?: boolean
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            complaints: {
                Row: {
                    id: string
                    citizen_name: string
                    category: string
                    location: string | null
                    description: string
                    status: 'New' | 'In Progress' | 'Resolved' | 'Forwarded' | 'Pending Verification' | 'Verified' | 'Dispatched' | 'Exported' | 'Rejected'
                    priority: 'High' | 'Medium' | 'Low'
                    staff_notes: string | null
                    pa_instructions: string | null
                    assigned_to: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    citizen_name: string
                    category: string
                    location?: string | null
                    description: string
                    status?: 'New' | 'In Progress' | 'Resolved' | 'Forwarded' | 'Pending Verification' | 'Verified' | 'Dispatched' | 'Exported' | 'Rejected'
                    priority?: 'High' | 'Medium' | 'Low'
                    staff_notes?: string | null
                    pa_instructions?: string | null
                    assigned_to?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    citizen_name?: string
                    category?: string
                    location?: string | null
                    description?: string
                    status?: 'New' | 'In Progress' | 'Resolved' | 'Forwarded' | 'Pending Verification' | 'Verified' | 'Dispatched' | 'Exported' | 'Rejected'
                    priority?: 'High' | 'Medium' | 'Low'
                    staff_notes?: string | null
                    pa_instructions?: string | null
                    assigned_to?: string | null
                    created_at?: string
                }
            }
            letters: {
                Row: {
                    id: string
                    type: 'Central' | 'State' | 'Devotional'
                    department: string
                    title: string
                    content: string | null
                    status: 'Pending' | 'In Progress' | 'Completed'
                    version: number
                    tags: string[]
                    attachment_url: string | null
                    created_at: string
                    updated_at: string
                    sender_id: string | null
                }
                Insert: {
                    id?: string
                    type: 'Central' | 'State' | 'Devotional'
                    department: string
                    title: string
                    content?: string | null
                    status?: 'Pending' | 'In Progress' | 'Completed'
                    version?: number
                    tags?: string[]
                    attachment_url?: string | null
                    created_at?: string
                    updated_at?: string
                    sender_id?: string | null
                }
                Update: {
                    id?: string
                    type?: 'Central' | 'State' | 'Devotional'
                    department?: string
                    title?: string
                    content?: string | null
                    status?: 'Pending' | 'In Progress' | 'Completed'
                    version?: number
                    tags?: string[]
                    attachment_url?: string | null
                    created_at?: string
                    updated_at?: string
                    sender_id?: string | null
                }
            }
            plan_today_events: {
                Row: {
                    event_id: string
                    event_title: string
                    event_date: string
                    start_time: string | null
                    end_time: string | null
                    location: string | null
                    description: string | null
                    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'VISITED' | 'IN_PROGRESS'
                    internal_notes: string | null
                    // hook-facing aliases
                    title: string | null
                    type: string | null
                    duration: string | null
                    scheduled_date: string | null
                    scheduled_time: string | null
                    pa_id: string | null
                    is_attended: boolean
                    final_notes: string | null
                    staff_notified_at: string | null
                    voice_note_url: string | null
                    voice_transcript: string | null
                    day_finalized: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    event_id?: string
                    event_title?: string
                    event_date?: string
                    start_time?: string | null
                    end_time?: string | null
                    location?: string | null
                    description?: string | null
                    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'VISITED' | 'IN_PROGRESS'
                    internal_notes?: string | null
                    title?: string | null
                    type?: string | null
                    duration?: string | null
                    scheduled_date?: string | null
                    scheduled_time?: string | null
                    pa_id?: string | null
                    is_attended?: boolean
                    final_notes?: string | null
                    staff_notified_at?: string | null
                    voice_note_url?: string | null
                    voice_transcript?: string | null
                    day_finalized?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    event_id?: string
                    event_title?: string
                    event_date?: string
                    start_time?: string | null
                    end_time?: string | null
                    location?: string | null
                    description?: string | null
                    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'VISITED' | 'IN_PROGRESS'
                    internal_notes?: string | null
                    title?: string | null
                    type?: string | null
                    duration?: string | null
                    scheduled_date?: string | null
                    scheduled_time?: string | null
                    pa_id?: string | null
                    is_attended?: boolean
                    final_notes?: string | null
                    staff_notified_at?: string | null
                    voice_note_url?: string | null
                    voice_transcript?: string | null
                    day_finalized?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            contacts: {
                Row: {
                    contact_id: string
                    full_name: string
                    mobile: string | null
                    email: string | null
                    organization: string | null
                    designation: string | null
                    category: 'VOTER' | 'VILLAGE_HEAD' | 'CONTRACTOR' | 'PARTY_WORKER' | 'OFFICIAL' | 'OTHER' | null
                    location_hamlet: string | null
                    location_village: string | null
                    location_taluk: string | null
                    address: string | null
                    notes: string | null
                    state: string | null
                    zilla: string | null
                    gram_panchayat: string | null
                    is_vip: boolean
                    birthday: string | null
                    anniversary: string | null
                    last_greeted_year: number | null
                    deleted_at: string | null
                    created_at: string
                }
                Insert: {
                    contact_id?: string
                    full_name: string
                    mobile?: string | null
                    email?: string | null
                    organization?: string | null
                    designation?: string | null
                    category?: 'VOTER' | 'VILLAGE_HEAD' | 'CONTRACTOR' | 'PARTY_WORKER' | 'OFFICIAL' | 'OTHER' | null
                    location_hamlet?: string | null
                    location_village?: string | null
                    location_taluk?: string | null
                    address?: string | null
                    notes?: string | null
                    state?: string | null
                    zilla?: string | null
                    gram_panchayat?: string | null
                    is_vip?: boolean
                    birthday?: string | null
                    anniversary?: string | null
                    last_greeted_year?: number | null
                    deleted_at?: string | null
                    created_at?: string
                }
                Update: {
                    contact_id?: string
                    full_name?: string
                    mobile?: string | null
                    email?: string | null
                    organization?: string | null
                    designation?: string | null
                    category?: 'VOTER' | 'VILLAGE_HEAD' | 'CONTRACTOR' | 'PARTY_WORKER' | 'OFFICIAL' | 'OTHER' | null
                    location_hamlet?: string | null
                    location_village?: string | null
                    location_taluk?: string | null
                    address?: string | null
                    notes?: string | null
                    state?: string | null
                    zilla?: string | null
                    gram_panchayat?: string | null
                    is_vip?: boolean
                    birthday?: string | null
                    anniversary?: string | null
                    last_greeted_year?: number | null
                    deleted_at?: string | null
                    created_at?: string
                }
            }
            tour_programs: {
                Row: {
                    id: string
                    title: string
                    type: 'Official Visit' | 'Inspection' | 'Community Engagement' | 'Other'
                    start_date: string
                    start_time: string | null
                    duration: string | null
                    location_name: string | null
                    location_address: string | null
                    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
                    participants: Json
                    instructions: string | null
                    notification_log: Json
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    type?: 'Official Visit' | 'Inspection' | 'Community Engagement' | 'Other'
                    start_date: string
                    start_time?: string | null
                    duration?: string | null
                    location_name?: string | null
                    location_address?: string | null
                    status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
                    participants?: Json
                    instructions?: string | null
                    notification_log?: Json
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    type?: 'Official Visit' | 'Inspection' | 'Community Engagement' | 'Other'
                    start_date?: string
                    start_time?: string | null
                    duration?: string | null
                    location_name?: string | null
                    location_address?: string | null
                    status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
                    participants?: Json
                    instructions?: string | null
                    notification_log?: Json
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            development_works: {
                Row: {
                    work_id: string
                    work_title: string
                    sector: string | null
                    scheme_name: string | null
                    estimated_cost: number | null
                    sanctioned_amount: number | null
                    village: string | null
                    taluk: string | null
                    zilla: string | null
                    gram_panchayat: string | null
                    work_type: string | null
                    is_public: boolean
                    created_by: string | null
                    status: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'
                    progress_pct: number
                    start_date: string | null
                    target_date: string | null
                    contractor_name: string | null
                    deleted_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    work_id?: string
                    work_title: string
                    sector?: string | null
                    scheme_name?: string | null
                    estimated_cost?: number | null
                    sanctioned_amount?: number | null
                    village?: string | null
                    taluk?: string | null
                    zilla?: string | null
                    gram_panchayat?: string | null
                    work_type?: string | null
                    is_public?: boolean
                    created_by?: string | null
                    status?: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'
                    progress_pct?: number
                    start_date?: string | null
                    target_date?: string | null
                    contractor_name?: string | null
                    deleted_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    work_id?: string
                    work_title?: string
                    sector?: string | null
                    scheme_name?: string | null
                    estimated_cost?: number | null
                    sanctioned_amount?: number | null
                    village?: string | null
                    taluk?: string | null
                    zilla?: string | null
                    gram_panchayat?: string | null
                    work_type?: string | null
                    is_public?: boolean
                    created_by?: string | null
                    status?: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'
                    progress_pct?: number
                    start_date?: string | null
                    target_date?: string | null
                    contractor_name?: string | null
                    deleted_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            development_work_media: {
                Row: {
                    media_id: string
                    work_id: string
                    media_type: 'PHOTO' | 'VIDEO'
                    storage_path: string
                    file_name: string | null
                    file_size: number | null
                    display_order: number
                    created_at: string
                }
                Insert: {
                    media_id?: string
                    work_id: string
                    media_type: 'PHOTO' | 'VIDEO'
                    storage_path: string
                    file_name?: string | null
                    file_size?: number | null
                    display_order?: number
                    created_at?: string
                }
                Update: {
                    media_id?: string
                    work_id?: string
                    media_type?: 'PHOTO' | 'VIDEO'
                    storage_path?: string
                    file_name?: string | null
                    file_size?: number | null
                    display_order?: number
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    notif_id: string
                    recipient_id: string
                    type: string
                    title: string
                    body: string | null
                    metadata: Record<string, unknown>
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    notif_id?: string
                    recipient_id: string
                    type: string
                    title: string
                    body?: string | null
                    metadata?: Record<string, unknown>
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    notif_id?: string
                    recipient_id?: string
                    type?: string
                    title?: string
                    body?: string | null
                    metadata?: Record<string, unknown>
                    is_read?: boolean
                    created_at?: string
                }
            }
            train_master: {
                Row: {
                    train_id: string
                    train_number: string
                    train_name: string
                    origin: string | null
                    destination: string | null
                    division: string | null
                    stops: Json
                    created_at: string
                }
                Insert: {
                    train_id?: string
                    train_number: string
                    train_name: string
                    origin?: string | null
                    destination?: string | null
                    division?: string | null
                    stops?: Json
                    created_at?: string
                }
                Update: {
                    train_id?: string
                    train_number?: string
                    train_name?: string
                    origin?: string | null
                    destination?: string | null
                    division?: string | null
                    stops?: Json
                    created_at?: string
                }
            }
            railway_quota_config: {
                Row: {
                    config_id: string
                    division: string
                    drm_office: string | null
                    drm_email: string | null
                    monthly_quota: number
                    used_quota: number
                    quota_reset_day: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    config_id?: string
                    division: string
                    drm_office?: string | null
                    drm_email?: string | null
                    monthly_quota?: number
                    used_quota?: number
                    quota_reset_day?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    config_id?: string
                    division?: string
                    drm_office?: string | null
                    drm_email?: string | null
                    monthly_quota?: number
                    used_quota?: number
                    quota_reset_day?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            railway_eq_requests: {
                Row: {
                    id: string
                    letter_number: string | null
                    applicant_name: string
                    mobile: string | null
                    email: string | null
                    emergency_reason: string
                    train_number: string | null
                    train_name: string | null
                    origin_station: string | null
                    destination_station: string | null
                    from_station: string
                    to_station: string
                    journey_date: string
                    travel_class: string | null
                    division: string | null
                    pnr_number: string | null
                    status: 'PENDING_PA_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED'
                    submitted_by: string | null
                    letter_path: string | null
                    pa_signature_path: string | null
                    signed_at: string | null
                    rejection_reason: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    letter_number?: string | null
                    applicant_name: string
                    mobile?: string | null
                    email?: string | null
                    emergency_reason: string
                    train_number?: string | null
                    train_name?: string | null
                    origin_station?: string | null
                    destination_station?: string | null
                    from_station: string
                    to_station: string
                    journey_date: string
                    travel_class?: string | null
                    division?: string | null
                    pnr_number?: string | null
                    status?: 'PENDING_PA_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED'
                    submitted_by?: string | null
                    letter_path?: string | null
                    pa_signature_path?: string | null
                    signed_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    letter_number?: string | null
                    applicant_name?: string
                    mobile?: string | null
                    email?: string | null
                    emergency_reason?: string
                    train_number?: string | null
                    train_name?: string | null
                    origin_station?: string | null
                    destination_station?: string | null
                    from_station?: string
                    to_station?: string
                    journey_date?: string
                    travel_class?: string | null
                    division?: string | null
                    pnr_number?: string | null
                    status?: 'PENDING_PA_APPROVAL' | 'APPROVED' | 'SENT' | 'REJECTED'
                    submitted_by?: string | null
                    letter_path?: string | null
                    pa_signature_path?: string | null
                    signed_at?: string | null
                    rejection_reason?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            parliament_letters: {
                Row: {
                    letter_id: string
                    ref_number: string | null
                    subject: string
                    ministry: string
                    department: string | null
                    addressed_to: string | null
                    type: 'Request' | 'Recommendation' | 'Query' | 'Complaint' | 'Follow-up' | null
                    priority: 'High' | 'Medium' | 'Low'
                    sent_date: string | null
                    expected_response_date: string | null
                    summary: string | null
                    constituency_issue: string | null
                    document_url: string | null
                    status: 'SENT' | 'ACKNOWLEDGED' | 'REPLIED' | 'CLOSED'
                    follow_up_date: string | null
                    timeline: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    letter_id?: string
                    ref_number?: string | null
                    subject: string
                    ministry: string
                    department?: string | null
                    addressed_to?: string | null
                    type?: 'Request' | 'Recommendation' | 'Query' | 'Complaint' | 'Follow-up' | null
                    priority?: 'High' | 'Medium' | 'Low'
                    sent_date?: string | null
                    expected_response_date?: string | null
                    summary?: string | null
                    constituency_issue?: string | null
                    document_url?: string | null
                    status?: 'SENT' | 'ACKNOWLEDGED' | 'REPLIED' | 'CLOSED'
                    follow_up_date?: string | null
                    timeline?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    letter_id?: string
                    ref_number?: string | null
                    subject?: string
                    ministry?: string
                    department?: string | null
                    addressed_to?: string | null
                    type?: 'Request' | 'Recommendation' | 'Query' | 'Complaint' | 'Follow-up' | null
                    priority?: 'High' | 'Medium' | 'Low'
                    sent_date?: string | null
                    expected_response_date?: string | null
                    summary?: string | null
                    constituency_issue?: string | null
                    document_url?: string | null
                    status?: 'SENT' | 'ACKNOWLEDGED' | 'REPLIED' | 'CLOSED'
                    follow_up_date?: string | null
                    timeline?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            parliament_questions: {
                Row: {
                    id: string
                    question_number: string | null
                    type: 'Starred' | 'Unstarred' | 'Short Notice' | null
                    session_name: string | null
                    session_date: string | null
                    subject: string
                    full_text: string | null
                    ministry: string | null
                    department: string | null
                    constituency_relevance: string | null
                    tags: string[]
                    expected_answer_date: string | null
                    priority: 'High' | 'Medium' | 'Low'
                    status: 'SUBMITTED' | 'ADMITTED' | 'ANSWERED' | 'DEFERRED'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    question_number?: string | null
                    type?: 'Starred' | 'Unstarred' | 'Short Notice' | null
                    session_name?: string | null
                    session_date?: string | null
                    subject: string
                    full_text?: string | null
                    ministry?: string | null
                    department?: string | null
                    constituency_relevance?: string | null
                    tags?: string[]
                    expected_answer_date?: string | null
                    priority?: 'High' | 'Medium' | 'Low'
                    status?: 'SUBMITTED' | 'ADMITTED' | 'ANSWERED' | 'DEFERRED'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    question_number?: string | null
                    type?: 'Starred' | 'Unstarred' | 'Short Notice' | null
                    session_name?: string | null
                    session_date?: string | null
                    subject?: string
                    full_text?: string | null
                    ministry?: string | null
                    department?: string | null
                    constituency_relevance?: string | null
                    tags?: string[]
                    expected_answer_date?: string | null
                    priority?: 'High' | 'Medium' | 'Low'
                    status?: 'SUBMITTED' | 'ADMITTED' | 'ANSWERED' | 'DEFERRED'
                    created_at?: string
                    updated_at?: string
                }
            }
            parliament_answers: {
                Row: {
                    answer_id: string
                    question_id: string
                    answer_date: string | null
                    answered_by: string | null
                    answer_type: 'Oral' | 'Written' | 'Deferred' | null
                    text: string | null
                    document_url: string | null
                    satisfaction: 'Satisfactory' | 'Partial' | 'Unsatisfactory' | null
                    follow_up_required: boolean
                    follow_up_notes: string | null
                    actions_taken: string | null
                    constituency_impact: string | null
                    created_at: string
                }
                Insert: {
                    answer_id?: string
                    question_id: string
                    answer_date?: string | null
                    answered_by?: string | null
                    answer_type?: 'Oral' | 'Written' | 'Deferred' | null
                    text?: string | null
                    document_url?: string | null
                    satisfaction?: 'Satisfactory' | 'Partial' | 'Unsatisfactory' | null
                    follow_up_required?: boolean
                    follow_up_notes?: string | null
                    actions_taken?: string | null
                    constituency_impact?: string | null
                    created_at?: string
                }
                Update: {
                    answer_id?: string
                    question_id?: string
                    answer_date?: string | null
                    answered_by?: string | null
                    answer_type?: 'Oral' | 'Written' | 'Deferred' | null
                    text?: string | null
                    document_url?: string | null
                    satisfaction?: 'Satisfactory' | 'Partial' | 'Unsatisfactory' | null
                    follow_up_required?: boolean
                    follow_up_notes?: string | null
                    actions_taken?: string | null
                    constituency_impact?: string | null
                    created_at?: string
                }
            }
            photo_gallery_albums: {
                Row: {
                    gallery_id: string
                    title: string
                    description: string | null
                    event_date: string | null
                    location: string | null
                    is_public: boolean
                    cover_photo_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    gallery_id?: string
                    title: string
                    description?: string | null
                    event_date?: string | null
                    location?: string | null
                    is_public?: boolean
                    cover_photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    gallery_id?: string
                    title?: string
                    description?: string | null
                    event_date?: string | null
                    location?: string | null
                    is_public?: boolean
                    cover_photo_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            photo_gallery_photos: {
                Row: {
                    photo_id: string
                    gallery_id: string
                    storage_path: string
                    file_name: string | null
                    file_size: number | null
                    caption: string | null
                    display_order: number
                    created_at: string
                }
                Insert: {
                    photo_id?: string
                    gallery_id: string
                    storage_path: string
                    file_name?: string | null
                    file_size?: number | null
                    caption?: string | null
                    display_order?: number
                    created_at?: string
                }
                Update: {
                    photo_id?: string
                    gallery_id?: string
                    storage_path?: string
                    file_name?: string | null
                    file_size?: number | null
                    caption?: string | null
                    display_order?: number
                    created_at?: string
                }
            }
            speech_storage: {
                Row: {
                    speech_id: string
                    title: string
                    type: 'Parliament' | 'Public Address' | 'Press Conference' | 'Internal Meeting' | 'Other' | null
                    event_name: string | null
                    speech_date: string | null
                    location: string | null
                    occasion: string | null
                    language: string
                    description: string | null
                    key_topics: string[]
                    key_points: string[]
                    audio_url: string | null
                    video_url: string | null
                    video_thumbnail: string | null
                    transcript: string | null
                    duration: string | null
                    is_public: boolean
                    is_important: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    speech_id?: string
                    title: string
                    type?: 'Parliament' | 'Public Address' | 'Press Conference' | 'Internal Meeting' | 'Other' | null
                    event_name?: string | null
                    speech_date?: string | null
                    location?: string | null
                    occasion?: string | null
                    language?: string
                    description?: string | null
                    key_topics?: string[]
                    key_points?: string[]
                    audio_url?: string | null
                    video_url?: string | null
                    video_thumbnail?: string | null
                    transcript?: string | null
                    duration?: string | null
                    is_public?: boolean
                    is_important?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    speech_id?: string
                    title?: string
                    type?: 'Parliament' | 'Public Address' | 'Press Conference' | 'Internal Meeting' | 'Other' | null
                    event_name?: string | null
                    speech_date?: string | null
                    location?: string | null
                    occasion?: string | null
                    language?: string
                    description?: string | null
                    key_topics?: string[]
                    key_points?: string[]
                    audio_url?: string | null
                    video_url?: string | null
                    video_thumbnail?: string | null
                    transcript?: string | null
                    duration?: string | null
                    is_public?: boolean
                    is_important?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            audit_logs: {
                Row: {
                    log_id: string
                    user_id: string | null
                    user_role: string | null
                    action: 'INSERT' | 'UPDATE' | 'DELETE'
                    table_name: string
                    record_id: string
                    old_data: Json | null
                    new_data: Json | null
                    ip_address: string | null
                    created_at: string
                }
                Insert: {
                    log_id?: string
                    user_id?: string | null
                    user_role?: string | null
                    action: 'INSERT' | 'UPDATE' | 'DELETE'
                    table_name: string
                    record_id: string
                    old_data?: Json | null
                    new_data?: Json | null
                    ip_address?: string | null
                    created_at?: string
                }
                Update: {
                    log_id?: string
                    user_id?: string | null
                    user_role?: string | null
                    action?: 'INSERT' | 'UPDATE' | 'DELETE'
                    table_name?: string
                    record_id?: string
                    old_data?: Json | null
                    new_data?: Json | null
                    ip_address?: string | null
                    created_at?: string
                }
            }
        }
    }
}
