import { ParliamentLetter, ParliamentQuestion } from './types';

export const mockParliamentLetters: ParliamentLetter[] = [
  {
    id: 'let-1',
    refNumber: 'MP/NED/2024/045',
    subject: 'Request for New Overbridge at Maujpur Metro Station',
    ministry: 'Ministry of Railways',
    department: 'Railway Board',
    addressedTo: 'Minister of Railways',
    type: 'Request',
    priority: 'High',
    sentDate: '2024-02-10',
    expectedResponseDate: '2024-03-10',
    summary: 'Requesting the construction of a pedestrian overbridge to improve safety and connectivity for commuters at Maujpur.',
    constituencyIssue: 'Heavy traffic congestion and pedestrian safety risks at the Maujpur intersection.',
    relatedProjectId: 'proj-1',
    status: 'SENT',
    timeline: [
      { status: 'SENT', date: '2024-02-10', note: 'Letter dispatched via speed post and email.' }
    ]
  },
  {
    id: 'let-2',
    refNumber: 'MP/NED/2024/012',
    subject: 'Recommendation for Skill Development Center in Seelampur',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    addressedTo: 'Secretary, MSDE',
    type: 'Recommendation',
    priority: 'Medium',
    sentDate: '2024-01-15',
    expectedResponseDate: '2024-02-15',
    summary: 'Recommending the establishment of a Pradhan Mantri Kaushal Kendra (PMKK) in Seelampur to benefit local youth.',
    constituencyIssue: 'High unemployment rates among youth in Seelampur due to lack of vocational training.',
    status: 'ACKNOWLEDGED',
    timeline: [
      { status: 'SENT', date: '2024-01-15' },
      { status: 'ACKNOWLEDGED', date: '2024-01-22', note: 'Received acknowledgment from Secretary\'s office.' }
    ]
  },
  {
    id: 'let-3',
    refNumber: 'MP/NED/2023/189',
    subject: 'Query regarding Clean Ganga Mission funds for Yamuna cleaning',
    ministry: 'Ministry of Jal Shakti',
    addressedTo: 'Minister of Jal Shakti',
    type: 'Query',
    priority: 'Low',
    sentDate: '2023-11-05',
    expectedResponseDate: '2023-12-05',
    summary: 'Seeking details on the allocation of funds for Yamuna riverfront development and cleaning in Northeast Delhi.',
    constituencyIssue: 'Pollution levels in Yamuna affecting local health and environment.',
    status: 'REPLIED',
    timeline: [
      { status: 'SENT', date: '2023-11-05' },
      { status: 'ACKNOWLEDGED', date: '2023-11-12' },
      { status: 'REPLIED', date: '2023-12-20', note: 'Detailed response received with fund allocation chart.' }
    ]
  }
];

export const mockParliamentQuestions: ParliamentQuestion[] = [
  {
    id: 'q-1',
    questionNumber: 'USQ 1245',
    type: 'Unstarred',
    sessionName: 'Budget Session 2024',
    sessionDate: '2024-03-05',
    subject: 'Status of PM Awas Yojana in Northeast Delhi',
    fullText: 'Will the Minister of Housing and Urban Affairs be pleased to state: (a) the total number of houses sanctioned under PMAY-U in Northeast Delhi; (b) the number of houses completed and handed over; and (c) the timeline for completion of pending projects?',
    ministry: 'Ministry of Housing and Urban Affairs',
    constituencyRelevance: 'Many residents in Northeast Delhi are awaiting completion of sanctioned PMAY houses.',
    tags: ['Housing', 'PMAY', 'Urban Development'],
    expectedAnswerDate: '2024-03-12',
    priority: 'High',
    status: 'ANSWERED',
    answer: {
      date: '2024-03-12',
      answeredBy: 'Shri Hardeep Singh Puri',
      type: 'Written',
      text: 'The Ministry has sanctioned 12,450 houses in Northeast Delhi. Out of these, 8,900 have been completed. The remaining are expected to be finished by December 2024.',
      satisfaction: 'Satisfactory',
      followUpRequired: false
    }
  },
  {
    id: 'q-2',
    questionNumber: 'SQ 45',
    type: 'Starred',
    sessionName: 'Budget Session 2024',
    sessionDate: '2024-02-20',
    subject: 'Expansion of CGHS Wellness Centers',
    fullText: 'Whether the Government proposes to open new CGHS wellness centers in Northeast Delhi; if so, the details thereof and the locations identified?',
    ministry: 'Ministry of Health and Family Welfare',
    constituencyRelevance: 'Central Government employees in the constituency have to travel long distances for CGHS facilities.',
    tags: ['Health', 'CGHS', 'Infrastructure'],
    expectedAnswerDate: '2024-02-27',
    priority: 'Medium',
    status: 'ADMITTED'
  }
];
