
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
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  budget: number;
  village: string;
  sanctionOrderNo: string;
  startDate: string;
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
