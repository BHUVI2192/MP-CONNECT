import { Train, EqRequest } from './types';

export const mockTrains: Train[] = [
  {
    number: '12626',
    name: 'Kerala Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Trivandrum (TVC)',
    division: 'Delhi Division',
    stops: [
      { name: 'New Delhi', code: 'NDLS' },
      { name: 'Mathura Jn', code: 'MTJ' },
      { name: 'Agra Cantt', code: 'AGC' },
      { name: 'Gwalior Jn', code: 'GWL' },
      { name: 'Jhansi Jn', code: 'JHS' },
      { name: 'Bhopal Jn', code: 'BPL' },
      { name: 'Nagpur Jn', code: 'NGP' },
      { name: 'Vijayawada Jn', code: 'BZA' },
      { name: 'Chennai Central', code: 'MAS' },
      { name: 'Trivandrum Central', code: 'TVC' }
    ]
  },
  {
    number: '12002',
    name: 'New Delhi - Bhopal Shatabdi',
    origin: 'New Delhi (NDLS)',
    destination: 'Bhopal (BPL)',
    division: 'Delhi Division',
    stops: [
      { name: 'New Delhi', code: 'NDLS' },
      { name: 'Mathura Jn', code: 'MTJ' },
      { name: 'Agra Cantt', code: 'AGC' },
      { name: 'Gwalior Jn', code: 'GWL' },
      { name: 'Jhansi Jn', code: 'JHS' },
      { name: 'Bhopal Jn', code: 'BPL' }
    ]
  },
  {
    number: '12424',
    name: 'Dibrugarh Rajdhani',
    origin: 'New Delhi (NDLS)',
    destination: 'Dibrugarh (DBRG)',
    division: 'Delhi Division',
    stops: [
      { name: 'New Delhi', code: 'NDLS' },
      { name: 'Kanpur Central', code: 'CNB' },
      { name: 'Prayagraj Jn', code: 'PRYJ' },
      { name: 'Patna Jn', code: 'PNBE' },
      { name: 'Guwahati', code: 'GHY' },
      { name: 'Dibrugarh', code: 'DBRG' }
    ]
  }
];

export const mockEqRequests: EqRequest[] = [
  {
    id: 'EQ-2024-001',
    applicantName: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh.k@example.com',
    emergencyReason: 'Medical emergency: Father admitted to hospital in Bhopal for urgent surgery.',
    trainNumber: '12002',
    trainName: 'New Delhi - Bhopal Shatabdi',
    originStation: 'New Delhi (NDLS)',
    destinationStation: 'Bhopal (BPL)',
    fromStation: 'New Delhi (NDLS)',
    toStation: 'Bhopal (BPL)',
    journeyDate: '2024-03-10',
    travelClass: 'Executive Class (EC)',
    division: 'Delhi Division',
    pnrNumber: '2456789012',
    status: 'PENDING',
    submittedBy: 'Amit Sharma',
    submittedAt: '2024-03-05T10:30:00Z'
  },
  {
    id: 'EQ-2024-002',
    applicantName: 'Priya Singh',
    mobile: '9988776655',
    email: 'priya.s@example.com',
    emergencyReason: 'Family emergency: Attending funeral of close relative in Guwahati.',
    trainNumber: '12424',
    trainName: 'Dibrugarh Rajdhani',
    originStation: 'New Delhi (NDLS)',
    destinationStation: 'Dibrugarh (DBRG)',
    fromStation: 'New Delhi (NDLS)',
    toStation: 'Guwahati (GHY)',
    journeyDate: '2024-03-12',
    travelClass: 'AC First Class (1A)',
    division: 'Delhi Division',
    pnrNumber: '4567890123',
    status: 'APPROVED',
    submittedBy: 'Amit Sharma',
    submittedAt: '2024-03-04T15:45:00Z',
    letterNumber: 'MP/NED/EQ/2024/089',
    signedDate: '2024-03-04',
    emailStatus: 'Delivered'
  },
  {
    id: 'EQ-2024-003',
    applicantName: 'Suresh Raina',
    mobile: '9123456789',
    email: 'suresh.r@example.com',
    emergencyReason: 'Official work: Urgent meeting at Railway Board in New Delhi.',
    trainNumber: '12626',
    trainName: 'Kerala Express',
    originStation: 'New Delhi (NDLS)',
    destinationStation: 'Trivandrum (TVC)',
    fromStation: 'Vijayawada Jn (BZA)',
    toStation: 'New Delhi (NDLS)',
    journeyDate: '2024-03-15',
    travelClass: 'AC 2 Tier (2A)',
    division: 'Delhi Division',
    status: 'REJECTED',
    submittedBy: 'Neha Gupta',
    submittedAt: '2024-03-03T09:15:00Z',
    rejectionReason: 'Monthly quota for the division has been exceeded.'
  }
];
