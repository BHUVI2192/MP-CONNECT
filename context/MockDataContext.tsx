import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Letter, Complaint, Project, TourProgram, PlanTodayEvent, Contact } from '../types';
import { supabase } from '../lib/supabase';

// Define the shape of our context
interface MockDataContextType {
    complaints: Complaint[];
    letters: Letter[];
    tours: TourProgram[];
    works: Project[];
    events: PlanTodayEvent[];
    contacts: Contact[];

    // Actions
    addComplaint: (complaint: Complaint) => void;
    updateComplaintStatus: (id: string, status: Complaint['status'], remarks?: string) => void;

    addLetter: (letter: Letter) => void;
    updateLetterStatus: (id: string, status: Letter['status']) => void;

    addTour: (tour: TourProgram) => void;
    updateTour: (tour: TourProgram) => void;

    addEvent: (event: PlanTodayEvent) => void;
    updateEvent: (event: PlanTodayEvent) => void;

    addWork: (work: Project) => void;
    updateWork: (work: Project) => void;

    addContact: (contact: Contact) => void;
    updateContact: (contact: Contact) => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};



export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [tours, setTours] = useState<TourProgram[]>([]);
    const [works, setWorks] = useState<Project[]>([]);
    const [events, setEvents] = useState<PlanTodayEvent[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Fetch complaints from Supabase on mount
    useEffect(() => {
        supabase.from('complaints').select('*').order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setComplaints(data.map((r: any) => ({
                        id: r.id,
                        citizenName: r.citizen_name,
                        category: r.category,
                        location: r.location,
                        description: r.description,
                        status: r.status,
                        priority: r.priority,
                        staffNotes: r.staff_notes ?? undefined,
                        paInstructions: r.pa_instructions ?? undefined,
                        assignedTo: r.assigned_to ?? undefined,
                        createdAt: r.created_at?.split('T')[0] ?? '',
                    })));
                }
            });
    }, []);

    // Fetch tours from Supabase on mount
    useEffect(() => {
        supabase.from('tour_programs').select('*').order('start_date', { ascending: false })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setTours(data.map((r: any) => ({
                        id: r.id,
                        title: r.title,
                        type: r.type,
                        startDate: r.start_date,
                        startTime: r.start_time ?? '',
                        duration: r.duration ?? '',
                        location: { name: r.location_name ?? '', address: r.location_address ?? '' },
                        status: r.status,
                        participants: r.participants ?? [],
                        instructions: r.instructions ?? '',
                        notificationLog: r.notification_log ?? [],
                        createdAt: r.created_at?.split('T')[0] ?? '',
                        createdBy: r.created_by ?? '',
                    })));
                }
            });
    }, []);

    // Fetch letters from Supabase on mount
    useEffect(() => {
        supabase.from('letters').select('*').order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setLetters(data.map((r: any) => ({
                        id: r.id,
                        type: r.type,
                        department: r.department,
                        title: r.title,
                        content: r.content ?? '',
                        status: r.status,
                        version: r.version ?? 1,
                        tags: r.tags ?? [],
                        attachmentUrl: r.attachment_url ?? undefined,
                        createdAt: r.created_at?.split('T')[0] ?? '',
                        updatedAt: r.updated_at?.split('T')[0] ?? '',
                        senderId: r.sender_id ?? '',
                    })));
                }
            });
    }, []);

    // Fetch contacts from Supabase on mount
    useEffect(() => {
        supabase.from('contacts').select('*').is('deleted_at', null).order('full_name', { ascending: true })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    setContacts(data.map((r: any) => ({
                        id: r.contact_id,
                        name: r.full_name,
                        designation: r.designation ?? '',
                        organization: r.organization ?? '',
                        category: r.category ?? 'Other',
                        state: r.state ?? '',
                        zilla: r.zilla ?? '',
                        taluk: r.taluk ?? '',
                        gp: r.gram_panchayat ?? '',
                        village: r.village ?? '',
                        mobile: r.mobile ?? '',
                        email: r.email ?? undefined,
                        isVip: r.is_vip ?? false,
                        createdAt: r.created_at?.split('T')[0] ?? '',
                    })));
                }
            });
    }, []);

    // Fetch plan_today_events from Supabase on mount
    useEffect(() => {
        supabase.from('plan_today_events').select('*').order('scheduled_time', { ascending: true })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    const statusMap: Record<string, PlanTodayEvent['status']> = {
                        SCHEDULED: 'Scheduled', COMPLETED: 'Completed',
                        CANCELLED: 'Cancelled', VISITED: 'Visited', IN_PROGRESS: 'Scheduled',
                    };
                    setEvents(data.map((r: any) => ({
                        id: r.event_id,
                        title: r.title ?? r.event_title ?? 'Untitled',
                        type: (r.type ?? 'Visit') as PlanTodayEvent['type'],
                        date: r.scheduled_date ?? r.event_date ?? '',
                        startTime: r.scheduled_time ?? r.start_time ?? '',
                        duration: r.duration ?? '1h',
                        location: { name: r.location ?? '', address: '' },
                        attendees: [],
                        purpose: r.description ?? '',
                        status: statusMap[r.status ?? 'SCHEDULED'] ?? 'Scheduled',
                        createdAt: r.created_at ?? '',
                        createdBy: r.pa_id ?? '',
                    })));
                }
            });
    }, []);

    // Fetch development_works from Supabase on mount
    useEffect(() => {
        supabase.from('development_works').select('*').is('deleted_at', null).order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    const statusMap: Record<string, Project['status']> = {
                        PROPOSED: 'Planned', SANCTIONED: 'Planned',
                        ONGOING: 'Ongoing', COMPLETED: 'Completed', ON_HOLD: 'On Hold',
                    };
                    setWorks(data.map((r: any) => ({
                        id: r.work_id,
                        name: r.work_title,
                        category: r.sector ?? 'Other',
                        status: statusMap[r.status] ?? 'Planned',
                        progress: r.progress_pct ?? 0,
                        budget: r.estimated_cost ?? 0,
                        zilla: r.zilla ?? '',
                        taluk: r.taluk ?? '',
                        gp: r.gram_panchayat ?? '',
                        village: r.village ?? '',
                        sanctionOrderNo: '',
                        startDate: r.start_date ?? '',
                        completionDate: r.completion_date ?? undefined,
                    })));
                }
            });
    }, []);

    // ── Complaints actions ────────────────────────────────────
    const addComplaint = async (complaint: Complaint) => {
        setComplaints(prev => [complaint, ...prev]); // optimistic
        const { data, error } = await supabase.from('complaints').insert({
            citizen_name: complaint.citizenName,
            category: complaint.category,
            location: complaint.location,
            description: complaint.description,
            status: complaint.status ?? 'New',
            priority: complaint.priority ?? 'Medium',
        }).select().single();
        if (error) { console.error('[DB] addComplaint:', error.message, error); return; }
        if (data?.id) setComplaints(prev => prev.map(c => c.id === complaint.id ? { ...c, id: data.id } : c));
    };

    const updateComplaintStatus = async (id: string, status: Complaint['status'], remarks?: string) => {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, staffNotes: remarks ?? c.staffNotes } : c)); // optimistic
        const { error } = await supabase.from('complaints').update({
            status,
            ...(remarks ? { staff_notes: remarks } : {}),
        }).eq('id', id);
        if (error) console.error('[DB] updateComplaintStatus:', error.message, error);
    };

    // ── Letters actions ───────────────────────────────────────
    const addLetter = async (letter: Letter) => {
        setLetters(prev => [letter, ...prev]); // optimistic
        const { data, error } = await supabase.from('letters').insert({
            type: letter.type,
            department: letter.department,
            title: letter.title,
            content: letter.content,
            status: letter.status ?? 'Pending',
            version: letter.version ?? 1,
            tags: letter.tags ?? [],
        }).select().single();
        if (error) { console.error('[DB] addLetter:', error.message, error); return; }
        if (data?.id) setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, id: data.id } : l));
    };

    const updateLetterStatus = async (id: string, status: Letter['status']) => {
        setLetters(prev => prev.map(l => l.id === id ? { ...l, status } : l)); // optimistic
        const { error } = await supabase.from('letters').update({ status }).eq('id', id);
        if (error) console.error('[DB] updateLetterStatus:', error.message, error);
    };

    // ── Tours actions ─────────────────────────────────────────
    const addTour = async (tour: TourProgram) => {
        setTours(prev => [tour, ...prev]); // optimistic
        const { data, error } = await supabase.from('tour_programs').insert({
            title: tour.title,
            type: tour.type,
            start_date: tour.startDate,
            start_time: tour.startTime,
            duration: tour.duration,
            location_name: tour.location.name,
            location_address: tour.location.address,
            status: tour.status ?? 'Scheduled',
            participants: tour.participants ?? [],
            instructions: tour.instructions ?? '',
            notification_log: tour.notificationLog ?? [],
        }).select().single();
        if (error) { console.error('[DB] addTour:', error.message, error); return; }
        if (data?.id) setTours(prev => prev.map(t => t.id === tour.id ? { ...t, id: data.id } : t));
    };

    const updateTour = async (tour: TourProgram) => {
        setTours(prev => prev.map(t => t.id === tour.id ? tour : t)); // optimistic
        const { error } = await supabase.from('tour_programs').update({
            title: tour.title,
            type: tour.type,
            start_date: tour.startDate,
            start_time: tour.startTime,
            duration: tour.duration,
            location_name: tour.location.name,
            location_address: tour.location.address,
            status: tour.status,
            participants: tour.participants,
            instructions: tour.instructions,
        }).eq('id', tour.id);
        if (error) console.error('[DB] updateTour:', error.message, error);
    };

    // ── Events actions ────────────────────────────────────────
    const addEvent = async (event: PlanTodayEvent) => {
        setEvents(prev => [event, ...prev]); // optimistic
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('plan_today_events').insert({
            event_title: event.title,   // original NOT NULL column
            title: event.title,
            type: event.type,
            scheduled_date: event.date,
            scheduled_time: event.startTime,
            duration: event.duration,
            location: event.location.name,
            description: event.purpose,
            status: 'SCHEDULED',
            pa_id: user?.id ?? null,
        }).select().single();
        if (error) { console.error('[DB] addEvent:', error.message, error); return; }
        // Swap temp ID for real server UUID
        if (data?.event_id) setEvents(prev => prev.map(e => e.id === event.id ? { ...e, id: data.event_id } : e));
    };

    const updateEvent = async (event: PlanTodayEvent) => {
        setEvents(prev => prev.map(e => e.id === event.id ? event : e)); // optimistic
        const statusMap: Record<string, string> = {
            Scheduled: 'SCHEDULED', Completed: 'COMPLETED',
            Cancelled: 'CANCELLED', Visited: 'VISITED',
        };
        // Skip DB update if the ID is a temp ID (not a real UUID) — table not ready yet
        if (/^e-\d+$/.test(event.id)) return;
        const { error } = await supabase.from('plan_today_events').update({
            title: event.title,
            scheduled_date: event.date,
            scheduled_time: event.startTime,
            status: statusMap[event.status] ?? 'SCHEDULED',
        }).eq('event_id', event.id);
        if (error) console.error('[DB] updateEvent:', error.message, error);
    };

    // ── Works actions ─────────────────────────────────────────
    const addWork = async (work: Project) => {
        setWorks(prev => [work, ...prev]); // optimistic
        const statusMap: Record<string, string> = {
            Planned: 'PROPOSED', Ongoing: 'ONGOING', Completed: 'COMPLETED', 'On Hold': 'ON_HOLD',
        };
        const { data, error } = await supabase.from('development_works').insert({
            work_title: work.name,
            sector: work.category,
            status: statusMap[work.status] ?? 'PLANNED',
            budget: work.budget ?? 0,
            zilla: work.zilla ?? '',
            taluk: work.taluk ?? '',
            gram_panchayat: work.gp ?? '',
            village: work.village ?? '',
            start_date: work.startDate ?? null,
            completion_date: work.completionDate ?? null,
        }).select().single();
        if (error) { console.error('[DB] addWork:', error.message, error); return; }
        if (data?.work_id) setWorks(prev => prev.map(w => w.id === work.id ? { ...w, id: data.work_id } : w));
    };

    const updateWork = async (work: Project) => {
        setWorks(prev => prev.map(w => w.id === work.id ? work : w)); // optimistic
        const statusMap: Record<string, string> = {
            Planned: 'PROPOSED', Ongoing: 'ONGOING', Completed: 'COMPLETED', 'On Hold': 'ON_HOLD',
        };
        const { error } = await supabase.from('development_works').update({
            work_title: work.name,
            sector: work.category,
            status: statusMap[work.status] ?? 'PLANNED',
            budget: work.budget ?? 0,
        }).eq('work_id', work.id);
        if (error) console.error('[DB] updateWork:', error.message, error);
    };

    // ── Contacts actions ──────────────────────────────────────
    const addContact = async (contact: Contact) => {
        setContacts(prev => [contact, ...prev]); // optimistic
        const { data, error } = await supabase.from('contacts').insert({
            full_name: contact.name,
            designation: contact.designation,
            organization: contact.organization,
            mobile: contact.mobile,
            email: contact.email ?? null,
            state: contact.state,
            zilla: contact.zilla,
            taluk: contact.taluk,
            gram_panchayat: contact.gp,
            village: contact.village,
            is_vip: contact.isVip ?? false,
        }).select().single();
        if (error) { console.error('[DB] addContact:', error.message, error); return; }
        if (data?.contact_id) setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, id: data.contact_id } : c));
    };

    const updateContact = async (contact: Contact) => {
        setContacts(prev => prev.map(c => c.id === contact.id ? contact : c)); // optimistic
        const { error } = await supabase.from('contacts').update({
            full_name: contact.name,
            designation: contact.designation,
            organization: contact.organization,
            mobile: contact.mobile,
            email: contact.email ?? null,
            is_vip: contact.isVip ?? false,
        }).eq('contact_id', contact.id);
        if (error) console.error('[DB] updateContact:', error.message, error);
    };

    return (
        <MockDataContext.Provider value={{
            complaints, letters, tours, works, events, contacts,
            addComplaint, updateComplaintStatus,
            addLetter, updateLetterStatus,
            addTour, updateTour,
            addEvent, updateEvent,
            addWork, updateWork,
            addContact, updateContact
        }}>
            {children}
        </MockDataContext.Provider>
    );
};

