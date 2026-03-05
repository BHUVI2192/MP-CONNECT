import { Speech } from './types';

export const mockSpeeches: Speech[] = [
  {
    id: 'sp-1',
    title: 'Debate on Agricultural Reforms in Lok Sabha',
    type: 'Parliament',
    eventName: 'Budget Session 2024',
    date: '2024-03-15',
    location: 'Parliament House, New Delhi',
    occasion: 'Discussion on Demand for Grants',
    language: 'Hindi',
    description: 'A comprehensive speech highlighting the need for technological integration in farming and direct benefit transfers to small-scale farmers in Northeast Delhi.',
    keyTopics: ['Agriculture', 'Technology', 'DBT', 'Farmers'],
    keyPoints: [
      'Integration of AI in crop yield prediction.',
      'Expansion of cold storage facilities in peri-urban areas.',
      'Simplifying the process for PM-Kisan registration.'
    ],
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoThumbnail: 'https://picsum.photos/seed/parliament/800/450',
    transcript: '[00:00] Speaker Sir, today I stand to support the agricultural reforms. [00:45] Our farmers in Northeast Delhi are facing unique challenges due to rapid urbanization. [01:30] We need a hybrid model that supports both traditional farming and modern vertical agriculture.',
    duration: '12:45',
    relatedProjectIds: ['proj-1'],
    isImportant: true,
    isPublic: true,
    createdAt: '2024-03-16'
  },
  {
    id: 'sp-2',
    title: 'Inauguration of Community Center in Seelampur',
    type: 'Public Address',
    eventName: 'Seelampur Development Meet',
    date: '2024-04-10',
    location: 'Seelampur, Delhi',
    occasion: 'Public Inauguration',
    language: 'Hindi',
    description: 'Address to the local residents during the opening of the new multi-purpose community center.',
    keyTopics: ['Community', 'Infrastructure', 'Youth'],
    keyPoints: [
      'The center will host vocational training for local youth.',
      'Free library access for students from low-income families.',
      'Weekly health check-up camps to be organized here.'
    ],
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    transcript: 'My dear brothers and sisters of Seelampur. This center is not just a building, it is a hub for your dreams. We have ensured that the best facilities are available right at your doorstep.',
    duration: '08:20',
    relatedProjectIds: ['proj-2'],
    isImportant: false,
    isPublic: true,
    createdAt: '2024-04-11'
  },
  {
    id: 'sp-3',
    title: 'Press Briefing on New Metro Line Extension',
    type: 'Press Conference',
    eventName: 'Media Interaction',
    date: '2024-05-05',
    location: 'Constituency Office',
    occasion: 'Announcement of Phase 4 Extension',
    language: 'English',
    description: 'Detailed briefing to the media regarding the upcoming metro connectivity projects in the constituency.',
    keyTopics: ['Transport', 'Metro', 'Connectivity'],
    keyPoints: [
      'Three new stations proposed for the Pink Line extension.',
      'Expected to reduce travel time to Central Delhi by 30 minutes.',
      'Environment-friendly construction methods being adopted.'
    ],
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    videoThumbnail: 'https://picsum.photos/seed/press/800/450',
    transcript: 'Good morning everyone. Today we have a major update regarding the Phase 4 extension of the Delhi Metro. This project will specifically benefit the residents of Maujpur and surrounding areas.',
    duration: '15:10',
    isImportant: true,
    isPublic: true,
    createdAt: '2024-05-06'
  }
];
