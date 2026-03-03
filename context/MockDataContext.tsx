import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Letter, Complaint, Project, TourProgram, PlanTodayEvent } from '../types';

// Define the shape of our context
interface MockDataContextType {
    complaints: Complaint[];
    letters: Letter[];
    tours: TourProgram[];
    works: Project[];
    events: PlanTodayEvent[];

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
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};

// Initial Data
const initialComplaints: Complaint[] = [
    { id: 'CMP-101', description: 'Large potholes causing traffic.', status: 'New', category: 'Roads', location: 'Sector 4', createdAt: '2024-05-20', citizenName: 'John Doe', priority: 'High' },
    { id: 'CMP-102', description: 'Lights not working in Block C.', status: 'Verified', category: 'Electricity', location: 'Block C', createdAt: '2024-05-19', citizenName: 'Jane Smith', priority: 'Medium' },
];

const initialLetters: Letter[] = [
    { id: 'LTR-2024-001', type: 'Central', department: 'Finance', title: 'Fund Release Request', content: 'Request to release funds...', status: 'Pending', version: 1, tags: ['Funds'], createdAt: '2024-05-20', updatedAt: '2024-05-20', senderId: 'STAFF-001' }
];

const initialTours: TourProgram[] = [
    {
        id: 'TOUR-2024-001',
        title: 'Flood Relief Inspection',
        type: 'Inspection',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        duration: '4h',
        location: { name: 'Rampur Village', address: 'North Block' },
        status: 'Scheduled',
        participants: [
            { id: 'P1', name: 'DM Rajesh', role: 'District Magistrate', contact: '9876543210', notified: true }
        ],
        instructions: 'Check relief kits',
        notificationLog: [],
        createdAt: '2024-05-20',
        createdBy: 'PA-001'
    }
];

const initialWorks: Project[] = [
    { id: 'PRJ-201', name: 'NH-24 Expansion', category: 'Roads', status: 'In Progress', progress: 65, budget: 45000000, village: 'Seelampur', sanctionOrderNo: 'SO-101', startDate: '2024-01-15' }
];

const initialEvents: PlanTodayEvent[] = [
    {
        id: 'e-1',
        title: 'Morning Briefing',
        type: 'Meeting',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        duration: '1h',
        location: { name: 'MP Office', address: 'Civil Lines' },
        attendees: [],
        purpose: 'Daily planning',
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
        createdBy: 'u-pa-1'
    },
    {
        id: 'e-2',
        title: 'Site Inspection',
        type: 'Inspection',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:30',
        duration: '1h',
        location: { name: 'Green Park', address: 'Sector 4' },
        attendees: [],
        purpose: 'Inspect construction',
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
        createdBy: 'u-pa-1'
    }
];

export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
    const [letters, setLetters] = useState<Letter[]>(initialLetters);
    const [tours, setTours] = useState<TourProgram[]>(initialTours);
    const [works, setWorks] = useState<Project[]>(initialWorks);
    const [events, setEvents] = useState<PlanTodayEvent[]>(initialEvents);

    const addComplaint = (complaint: Complaint) => setComplaints(prev => [complaint, ...prev]);
    const updateComplaintStatus = (id: string, status: Complaint['status'], remarks?: string) => {
        setComplaints(prev => prev.map(c =>
            c.id === id ? { ...c, status, staffNotes: remarks ? remarks : c.staffNotes } : c
        ));
    };

    const addLetter = (letter: Letter) => setLetters(prev => [letter, ...prev]);
    const updateLetterStatus = (id: string, status: Letter['status']) => {
        setLetters(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    };

    const addTour = (tour: TourProgram) => setTours(prev => [tour, ...prev]);
    const updateTour = (tour: TourProgram) => {
        setTours(prev => prev.map(t => t.id === tour.id ? tour : t));
    };

    const addEvent = (event: PlanTodayEvent) => setEvents(prev => [event, ...prev]);
    const updateEvent = (event: PlanTodayEvent) => {
        setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    };

    const addWork = (work: Project) => setWorks(prev => [work, ...prev]);
    const updateWork = (work: Project) => {
        setWorks(prev => prev.map(w => w.id === work.id ? work : w));
    };

    return (
        <MockDataContext.Provider value={{
            complaints, letters, tours, works, events,
            addComplaint, updateComplaintStatus,
            addLetter, updateLetterStatus,
            addTour, updateTour,
            addEvent, updateEvent,
            addWork, updateWork
        }}>
            {children}
        </MockDataContext.Provider>
    );
};
