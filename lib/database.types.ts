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
            plan_today_events: {
                Row: {
                    event_id: string
                    event_title: string
                    event_date: string
                    start_time: string | null
                    end_time: string | null
                    location: string | null
                    description: string | null
                    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
                    internal_notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    event_id?: string
                    event_title: string
                    event_date: string
                    start_time?: string | null
                    end_time?: string | null
                    location?: string | null
                    description?: string | null
                    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
                    internal_notes?: string | null
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
                    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
                    internal_notes?: string | null
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
                    created_at?: string
                }
            }
            tour_programs: {
                Row: {
                    tour_id: string
                    tour_title: string
                    start_date: string
                    end_date: string | null
                    location_summary: string | null
                    tour_type: 'OFFICIAL' | 'PUBLIC_MEETING' | 'INSPECTION' | 'PERSONAL' | null
                    itinerary: Json | null
                    report_summary: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    tour_id?: string
                    tour_title: string
                    start_date: string
                    end_date?: string | null
                    location_summary?: string | null
                    tour_type?: 'OFFICIAL' | 'PUBLIC_MEETING' | 'INSPECTION' | 'PERSONAL' | null
                    itinerary?: Json | null
                    report_summary?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    tour_id?: string
                    tour_title?: string
                    start_date?: string
                    end_date?: string | null
                    location_summary?: string | null
                    tour_type?: 'OFFICIAL' | 'PUBLIC_MEETING' | 'INSPECTION' | 'PERSONAL' | null
                    itinerary?: Json | null
                    report_summary?: string | null
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
                    status: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'
                    progress_pct: number
                    start_date: string | null
                    target_date: string | null
                    contractor_name: string | null
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
                    status?: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'
                    progress_pct?: number
                    start_date?: string | null
                    target_date?: string | null
                    contractor_name?: string | null
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
                    status?: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'
                    progress_pct?: number
                    start_date?: string | null
                    target_date?: string | null
                    contractor_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
