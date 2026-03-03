
export enum UserRole {
  MP = 'MP',
  PA = 'PA',
  STAFF = 'STAFF',
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  constituency?: string;
}

export interface Letter {
  id: string;
  subject: string;
  recipient: string;
  recipientType: 'Ministry' | 'Local Authority' | 'Citizen';
  status: 'Draft' | 'Pending Approval' | 'Signed' | 'Sent' | 'Response Received';
  type: 'Recommendation' | 'Enquiry' | 'Formal';
  createdAt: string;
  updatedAt: string;
}

export interface GreetingContact {
  id: string;
  name: string;
  designation: string;
  event: 'Birthday' | 'Anniversary';
  date: string; // MM-DD
  phone: string;
  email?: string; // New: Added email field for greetings
  lastGreetedYear?: number;
}

export interface Complaint {
  id: string;
  category: string;
  location: string;
  description: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Forwarded' | 'Pending Verification' | 'Verified' | 'Dispatched' | 'Rejected';
  createdAt: string;
  citizenName: string;
  priority?: 'High' | 'Medium' | 'Low';
  assignedTo?: string; // Department Name
  attachments?: string[]; // Evidence URLs or Base64
  staffNotes?: string;
  paInstructions?: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'On Hold';
  progress: number;
  budget: number;
  zilla: string;
  taluk: string;
  gp: string;
  village: string;
  address?: string;
  sanctionOrderNo: string;
  startDate: string;
  completionDate?: string;
  description?: string;
  history?: string;
  workDone?: string;
  beneficiaries?: number;
  fundingSource?: string;
  photos?: { url: string; caption: string; date?: string }[];
  videos?: { url: string; caption: string; thumbnail?: string }[];
  coordinates?: { lat: number; lng: number };
  isPublic?: boolean;
  isFeatured?: boolean;
}

export interface TourPackage {
  id: string;
  name: string;
  description: string;
  standardDuration: string;
  activities: string[];
  resources: string[];
  status: 'Active' | 'Inactive';
  mappedDestinationIds: string[];
  images?: string[]; // Reference photos uploaded by staff
}

export interface Destination {
  id: string;
  name: string;
  district: string;
  block: string;
  village: string;
  contactPerson: string;
  contactPhone: string;
  accessibility: 'Easy' | 'Moderate' | 'Difficult';
}

export interface ScheduledTour {
  id: string;
  date: string;
  startTime: string;
  packageId: string;
  status: 'Confirmed' | 'Pending';
  destinations: {
    destinationId: string;
    sequence: number;
    arrivalTime: string;
    duration: string;
  }[];
  participants: string[];
  specialInstructions: string;
}

export type PlanEventType = 'MEETING' | 'VISIT' | 'INSPECTION' | 'TOUR' | 'OTHER';

export interface PersonInvolved {
  id: string;
  name: string;
  designation: string;
  contact: string;
}

export type PlanEventStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'VISITED' | 'CANCELLED';

export interface PlanEvent {
  id: string;
  title: string;
  type: PlanEventType;
  scheduledTime: string; // HH:mm format (24h for easier sorting)
  displayTime: string; // 12h format for display
  duration: number; // in minutes
  locationName: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  purpose: string;
  people: PersonInvolved[];
  status: PlanEventStatus;
  notes?: string;
  voiceNoteUrl?: string;
  transcript?: string;
  finalNotes?: string;
  cancellationReason?: string;
}

export interface Contact {
  id: string;
  name: string;
  designation: string;
  organization: string;
  category: string;
  state: string;
  zilla: string;
  taluk: string;
  gp: string;
  village: string;
  fullAddress?: string;
  mobile: string;
  altMobile?: string;
  whatsapp?: string;
  email: string;
  isVip: boolean;
  photoUrl?: string;
  birthday?: string; // MM-DD
  dob?: string; // YYYY-MM-DD
  anniversary?: string; // MM-DD
  tags?: string[];
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export type NotificationType = 'UPDATE' | 'VISITED' | 'CANCELLED';

export interface Notification {
  id: string;
  eventId: string;
  eventName: string;
  timestamp: string;
  type: NotificationType;
  notes?: string;
  voiceNoteUrl?: string;
  isRead: boolean;
  internalNotes?: string;
}
