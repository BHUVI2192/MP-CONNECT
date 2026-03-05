
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
  type: 'Central' | 'State' | 'Devotional';
  department: string;
  title: string;
  content: string; // Rich text or summary
  status: 'Pending' | 'In Progress' | 'Completed';
  version: number;
  tags: string[];
  attachmentUrl?: string; // Mock URL for the uploaded file
  createdAt: string;
  updatedAt: string;
  senderId: string; // Staff ID
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
  status: 'New' | 'In Progress' | 'Resolved' | 'Forwarded' | 'Pending Verification' | 'Verified' | 'Dispatched' | 'Exported' | 'Rejected';
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

// Module 2: Plan Today Types

export interface PlanTodayAttendee {
  id: string;
  name: string;
  designation: string;
  contact: string;
}

export interface EventDocumentation {
  actualStartTime?: string;
  actualEndTime?: string;
  actualAttendees?: string[]; // IDs or Names
  summary?: string;
  outcomes?: string;
  actionItems?: string[];
  textNotes?: string; // Optional text notes
  hasVoiceNote?: boolean; // Replaces full attachment for simpler UI mock
  voiceNoteDuration?: string;
  attachments?: {
    id: string;
    type: 'Image' | 'Video' | 'Document';
    url: string; // Mock URL
    name: string;
  }[];
}

export interface PlanTodayEvent {
  id: string;
  title: string;
  type: 'Visit' | 'Meeting' | 'Inspection' | 'Tour' | 'Other';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: string; // e.g., "1h 30m"
  location: {
    name: string;
    address: string;
    coordinates?: { lat: number, lng: number }; // Optional for now
  };
  attendees: PlanTodayAttendee[];
  purpose: string;
  status: 'Scheduled' | 'In_Progress' | 'Visited' | 'Cancelled' | 'Completed';
  documentation?: EventDocumentation;
  createdAt: string;
  createdBy: string; // User ID
}

// Module 5: Tour Program Types

export interface TourParticipant {
  id: string;
  name: string;
  role: string;
  contact: string;
  isNodalOfficer?: boolean;
  notified?: boolean;
  present?: boolean; // For attendance
}

export interface TourProgram {
  id: string;
  title: string;
  type: 'Official Visit' | 'Inspection' | 'Community Engagement' | 'Other';
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: string;
  location: {
    name: string; // Village/Area Name
    address: string;
    coordinates?: { lat: number, lng: number };
  };
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  participants: TourParticipant[];
  instructions: string;

  // Post-Tour Documentation
  actualAttributes?: {
    startTime?: string;
    endTime?: string;
    summary?: string;
    outcomes?: string;
    feedback?: string;
    attachments?: string[]; // Mock URLs
  };

  notificationLog?: {
    recipientName: string;
    channel: 'SMS' | 'WhatsApp';
    status: 'Sent' | 'Failed' | 'Pending';
    timestamp: string;
  }[];

  createdAt: string;
  createdBy: string;
}

// Module 4: Development Works Types
export type WorkStatus = 'Planned' | 'Ongoing' | 'Completed';
export type WorkType = 'New Construction' | 'Renovation' | 'Maintenance' | 'Upgrade';
export type WorkSector = 'Roads' | 'Healthcare' | 'Education' | 'Water' | 'Agriculture' | 'Electricity' | 'Other';

export interface WorkMedia {
  id: string;
  type: 'Photo' | 'Video';
  file: File | null;
  url: string;
  caption?: string;
  date?: string;
  thumbnailUrl?: string; // For videos
  progress?: number;
}

export interface DevelopmentWork {
  id: string;
  title: string;
  sector: WorkSector;
  type: WorkType;
  status: WorkStatus;
  description: {
    project: string;
    history: string;
    workDone: string;
  };
  location: {
    zilla: string;
    taluk: string;
    gp: string;
    village: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  metrics: {
    beneficiaries: number;
    budget: number;
    fundingSource: 'MPLADS' | 'State Government' | 'Central Government' | 'Other';
    otherFundingSource?: string;
    startDate: string;
    completionDate: string;
  };
  media: {
    photos: WorkMedia[];
    videos: WorkMedia[];
  };
  visibility: {
    publicPortal: boolean;
    featureOnHomepage: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Module: Contact Book Types
export interface ContactLocation {
  state: string;
  zilla: string;
  taluk: string;
  gp: string;
  village: string;
}

export type ContactCategory = 'Officer' | 'VIP' | 'Political Leader' | 'Media' | 'Other';

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

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  photographer?: string;
  dateTaken?: string;
  fileSize?: number;
  fileName?: string;
  isCover?: boolean;
  status?: 'Uploading' | 'Processing' | 'Done' | 'Error';
  uploadProgress?: number;
}

export interface Album {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  eventType: string;
  location: string;
  tags: string[];
  isPublic: boolean;
  coverPhotoUrl?: string;
  photoCount: number;
  viewCount?: number;
  downloadCount?: number;
  photos: Photo[];
  createdAt: string;
}

export interface AuditLog {
  log_id: string;
  user_id: string | null;
  user_role: string | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  created_at: string;
}

// Speech Module Types
export type SpeechType = 'Parliament' | 'Public Address' | 'Press Conference' | 'Internal Meeting' | 'Other';

export interface Speech {
  id: string;
  title: string;
  type: SpeechType;
  eventName?: string;
  date: string;
  location?: string;
  occasion?: string;
  language: string;
  description?: string;
  keyTopics: string[];
  keyPoints: string[];
  audioUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  transcript?: string;
  duration?: string;
  relatedProjectIds?: string[];
  isImportant?: boolean;
  isPublic?: boolean;
  createdAt: string;
}

// Parliament Module Types
export type LetterType = 'Request' | 'Recommendation' | 'Query' | 'Complaint' | 'Follow-up';
export type LetterStatus = 'SENT' | 'ACKNOWLEDGED' | 'REPLIED' | 'CLOSED';
export type Priority = 'High' | 'Medium' | 'Low';

export interface ParliamentLetter {
  id: string;
  refNumber: string;
  subject: string;
  ministry: string;
  department?: string;
  addressedTo: string;
  type: LetterType;
  priority: Priority;
  sentDate: string;
  expectedResponseDate: string;
  summary: string;
  constituencyIssue: string;
  relatedProjectId?: string;
  documentUrl?: string;
  status: LetterStatus;
  followUpDate?: string;
  timeline: {
    status: LetterStatus;
    date: string;
    note?: string;
  }[];
}

export type QuestionType = 'Starred' | 'Unstarred' | 'Short Notice';
export type QuestionStatus = 'SUBMITTED' | 'ADMITTED' | 'ANSWERED' | 'DEFERRED';
export type SatisfactionLevel = 'Satisfactory' | 'Partial' | 'Unsatisfactory';

export interface ParliamentQuestion {
  id: string;
  questionNumber: string;
  type: QuestionType;
  sessionName: string;
  sessionDate: string;
  subject: string;
  fullText: string;
  ministry: string;
  department?: string;
  constituencyRelevance: string;
  relatedProjectId?: string;
  tags: string[];
  expectedAnswerDate: string;
  priority: Priority;
  status: QuestionStatus;
  answer?: {
    date: string;
    answeredBy: string;
    type: 'Oral' | 'Written' | 'Deferred';
    text: string;
    documentUrl?: string;
    satisfaction: SatisfactionLevel;
    followUpRequired: boolean;
    followUpNotes?: string;
    actionsTaken?: string;
    constituencyImpact?: string;
  };
}

