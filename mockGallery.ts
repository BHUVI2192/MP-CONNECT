import { Album } from './types';

export const mockAlbums: Album[] = [
  {
    id: 'alb-1',
    name: 'Flood Relief Distribution - Rampur',
    description: 'Distribution of essential supplies to flood-affected families in Rampur village. The MP interacted with over 200 families and ensured direct delivery of kits.',
    eventDate: '2024-05-20',
    eventType: 'Public Service',
    location: 'Rampur Village, North Block',
    tags: ['Flood Relief', 'Rampur', 'Direct Interaction'],
    isPublic: true,
    coverPhotoUrl: 'https://picsum.photos/seed/flood1/800/600',
    photoCount: 12,
    viewCount: 1240,
    downloadCount: 45,
    createdAt: '2024-05-21',
    photos: Array.from({ length: 12 }).map((_, i) => ({
      id: `p1-${i}`,
      url: `https://picsum.photos/seed/flood${i}/1200/900`,
      thumbnailUrl: `https://picsum.photos/seed/flood${i}/400/300`,
      caption: `Relief distribution activity ${i + 1}`,
      photographer: 'Office Media Team',
      dateTaken: '2024-05-20',
      isCover: i === 0
    }))
  },
  {
    id: 'alb-2',
    name: 'Shyampur Primary School Inauguration',
    description: 'Inauguration of the newly constructed primary school wing in Shyampur. The project was completed under MPLADS funds.',
    eventDate: '2024-05-15',
    eventType: 'Inauguration',
    location: 'Shyampur, East Block',
    tags: ['Education', 'Inauguration', 'MPLADS'],
    isPublic: true,
    coverPhotoUrl: 'https://picsum.photos/seed/school1/800/600',
    photoCount: 8,
    viewCount: 850,
    downloadCount: 12,
    createdAt: '2024-05-16',
    photos: Array.from({ length: 8 }).map((_, i) => ({
      id: `p2-${i}`,
      url: `https://picsum.photos/seed/school${i}/1200/900`,
      thumbnailUrl: `https://picsum.photos/seed/school${i}/400/300`,
      caption: `School inauguration ceremony ${i + 1}`,
      photographer: 'Office Media Team',
      dateTaken: '2024-05-15',
      isCover: i === 0
    }))
  },
  {
    id: 'alb-3',
    name: 'Internal Strategy Meeting - May',
    description: 'Monthly internal strategy meeting with block level coordinators to discuss upcoming projects and grievance resolution progress.',
    eventDate: '2024-05-10',
    eventType: 'Internal Meeting',
    location: 'Constituency Office',
    tags: ['Strategy', 'Internal', 'Planning'],
    isPublic: false,
    coverPhotoUrl: 'https://picsum.photos/seed/meeting1/800/600',
    photoCount: 5,
    viewCount: 45,
    downloadCount: 2,
    createdAt: '2024-05-11',
    photos: Array.from({ length: 5 }).map((_, i) => ({
      id: `p3-${i}`,
      url: `https://picsum.photos/seed/meeting${i}/1200/900`,
      thumbnailUrl: `https://picsum.photos/seed/meeting${i}/400/300`,
      caption: `Strategy discussion ${i + 1}`,
      photographer: 'PA Anand',
      dateTaken: '2024-05-10',
      isCover: i === 0
    }))
  }
];
