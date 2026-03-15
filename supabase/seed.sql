-- Seed data for Railway EQ train lookup flow
INSERT INTO public.train_master (train_number, train_name, origin, destination, division, stops)
VALUES
  (
    '12627',
    'Karnataka Express',
    'SBC',
    'NDLS',
    'South Western Railway',
    '[
      {"code":"SBC","name":"KSR Bengaluru City"},
      {"code":"DMM","name":"Dharmavaram Junction"},
      {"code":"GTL","name":"Guntakal Junction"},
      {"code":"SC","name":"Secunderabad Junction"},
      {"code":"BPL","name":"Bhopal Junction"},
      {"code":"AGC","name":"Agra Cantt"},
      {"code":"NZM","name":"Hazrat Nizamuddin"},
      {"code":"NDLS","name":"New Delhi"}
    ]'::jsonb
  ),
  (
    '12628',
    'Karnataka Express',
    'NDLS',
    'SBC',
    'South Western Railway',
    '[
      {"code":"NDLS","name":"New Delhi"},
      {"code":"NZM","name":"Hazrat Nizamuddin"},
      {"code":"AGC","name":"Agra Cantt"},
      {"code":"BPL","name":"Bhopal Junction"},
      {"code":"SC","name":"Secunderabad Junction"},
      {"code":"GTL","name":"Guntakal Junction"},
      {"code":"DMM","name":"Dharmavaram Junction"},
      {"code":"SBC","name":"KSR Bengaluru City"}
    ]'::jsonb
  ),
  (
    '12002',
    'New Delhi Shatabdi',
    'BPL',
    'NDLS',
    'West Central Railway',
    '[
      {"code":"BPL","name":"Bhopal Junction"},
      {"code":"JHS","name":"Jhansi Junction"},
      {"code":"GWL","name":"Gwalior Junction"},
      {"code":"AGC","name":"Agra Cantt"},
      {"code":"NDLS","name":"New Delhi"}
    ]'::jsonb
  ),
  (
    '12951',
    'Mumbai Rajdhani',
    'MMCT',
    'NDLS',
    'Western Railway',
    '[
      {"code":"MMCT","name":"Mumbai Central"},
      {"code":"RTM","name":"Ratlam Junction"},
      {"code":"KOTA","name":"Kota Junction"},
      {"code":"NZM","name":"Hazrat Nizamuddin"},
      {"code":"NDLS","name":"New Delhi"}
    ]'::jsonb
  ),
  (
    '12649',
    'Sampark Kranti Express',
    'YPR',
    'NZM',
    'South Western Railway',
    '[
      {"code":"YPR","name":"Yesvantpur Junction"},
      {"code":"DMM","name":"Dharmavaram Junction"},
      {"code":"GTL","name":"Guntakal Junction"},
      {"code":"SC","name":"Secunderabad Junction"},
      {"code":"BPL","name":"Bhopal Junction"},
      {"code":"NZM","name":"Hazrat Nizamuddin"}
    ]'::jsonb
  )
ON CONFLICT (train_number) DO UPDATE
SET
  train_name = EXCLUDED.train_name,
  origin = EXCLUDED.origin,
  destination = EXCLUDED.destination,
  division = EXCLUDED.division,
  stops = EXCLUDED.stops;

-- Seed data for development works browser
INSERT INTO public.development_works (
  work_title,
  sector,
  status,
  zilla,
  taluk,
  gram_panchayat,
  village,
  budget,
  beneficiaries,
  description,
  start_date,
  is_public
)
VALUES
  (
    'Shivamogga Ring Road Strengthening - Phase I',
    'Roads',
    'ONGOING',
    'Shivamogga',
    'Shivamogga',
    'Sogane GP',
    'Sogane',
    18500000,
    54000,
    'Resurfacing and widening of key urban connector roads with drainage upgrades.',
    CURRENT_DATE - INTERVAL '90 days',
    true
  ),
  (
    'Ayanur Main Road Culvert and Shoulder Upgrade',
    'Roads',
    'PLANNED',
    'Shivamogga',
    'Shivamogga',
    'Ayanur GP',
    'Ayanur',
    6200000,
    12000,
    'Road shoulder stabilization and culvert replacement for monsoon resilience.',
    CURRENT_DATE + INTERVAL '15 days',
    true
  ),
  (
    'Bhadravati Industrial Link Road Rehabilitation',
    'Roads',
    'COMPLETED',
    'Shivamogga',
    'Bhadravati',
    'Holehonnur GP',
    'Holehonnur',
    14800000,
    30000,
    'Bitumen relaying and lane marking for freight and commuter movement.',
    CURRENT_DATE - INTERVAL '220 days',
    true
  ),
  (
    'Tunga Drinking Water Intake Modernization',
    'Water',
    'ONGOING',
    'Shivamogga',
    'Shikaripura',
    'Kanive GP',
    'Kanive',
    9700000,
    18000,
    'Modernized intake pumps and filtration units for rural water distribution.',
    CURRENT_DATE - INTERVAL '120 days',
    true
  ),
  (
    'Village Overhead Tank and Pipeline Extension - Hosanagara',
    'Water',
    'PLANNED',
    'Shivamogga',
    'Hosanagara',
    'Nittur GP',
    'Nittur',
    5400000,
    7600,
    'New overhead tank and household tap connection extension for underserved wards.',
    CURRENT_DATE + INTERVAL '30 days',
    true
  ),
  (
    'Minor Bridge Construction Across Kumudvathi Stream',
    'Bridge',
    'ONGOING',
    'Shivamogga',
    'Sagar',
    'Anandapura GP',
    'Anandapura',
    12300000,
    9500,
    'Two-lane RCC bridge improving school and market access for nearby villages.',
    CURRENT_DATE - INTERVAL '70 days',
    true
  )
ON CONFLICT DO NOTHING;

-- Seed data for citizen public schedule
INSERT INTO public.tour_programs (
  title,
  type,
  start_date,
  start_time,
  duration,
  location_name,
  location_address,
  status,
  participants,
  instructions
)
SELECT
  v.title,
  v.type,
  v.start_date,
  v.start_time,
  v.duration,
  v.location_name,
  v.location_address,
  v.status,
  v.participants::jsonb,
  v.instructions
FROM (
  VALUES
    (
      'Public Constituency Interaction at Shivamogga Town Hall',
      'Community Engagement',
      CURRENT_DATE + INTERVAL '2 days',
      '10:30'::time,
      '2h',
      'Town Hall, Shivamogga',
      'Opposite District Stadium, Shivamogga',
      'Scheduled',
      '[{"name":"MP Office Team","role":"Organizer"},{"name":"Ward Representatives","role":"Community"}]',
      'Open public interaction for local development and grievance collection.'
    ),
    (
      'Inauguration of Rural Water Supply Upgrade - Nittur',
      'Community Engagement',
      CURRENT_DATE + INTERVAL '5 days',
      '09:00'::time,
      '1h 30m',
      'Nittur Gram Panchayat Grounds',
      'Nittur, Hosanagara Taluk, Shivamogga',
      'Scheduled',
      '[{"name":"PWD Officials","role":"Officials"},{"name":"GP Members","role":"Hosts"}]',
      'Public inauguration event for completed village water infrastructure works.'
    ),
    (
      'School Infrastructure Review Visit - Ayanur',
      'Official Visit',
      CURRENT_DATE + INTERVAL '7 days',
      '11:15'::time,
      '2h 15m',
      'Government High School, Ayanur',
      'Ayanur Main Road, Shivamogga',
      'Scheduled',
      '[{"name":"Education Dept","role":"Department"},{"name":"Local Parents Committee","role":"Stakeholders"}]',
      'On-site review of smart classroom and sanitation upgrades.'
    )
) AS v(title, type, start_date, start_time, duration, location_name, location_address, status, participants, instructions)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.tour_programs tp
  WHERE tp.title = v.title
    AND tp.start_date = v.start_date::date
);