export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subject: string;
  courseCode: string;
  faculty: string;
  faculty_id?: string;
  department_id?: string;
  room: string;
  building: string;
  startTime: string;
  endTime: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Real faculty mapping to live Supabase profiles:
// jyothi: 43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba (CSE: 60bf383e-802f-47c7-a732-e936320946be)
// Dr. CSE Professor: 62a659f2-0d5c-4f55-8247-ee592827a21e (CSE: 60bf383e-802f-47c7-a732-e936320946be)
// lohitha raj: cbebe3e8-421a-4e6d-b382-ac93614da4e9 (Mechanical: 68b6cf54-20a2-4a41-b1e1-118837e29548)

const DEFAULT_TIMETABLE: TimetableEntry[] = [
  // Monday
  {
    id: 'mon-1',
    day: 'Monday',
    subject: 'Data Structures & Algorithms',
    courseCode: 'CS301',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-201',
    building: 'Computing Sciences Block',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: 'Lecture',
  },
  {
    id: 'mon-2',
    day: 'Monday',
    subject: 'Computer Networks & Security',
    courseCode: 'CS303',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-204',
    building: 'Computing Sciences Block',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    startHour: 10,
    startMinute: 15,
    endHour: 11,
    endMinute: 15,
    type: 'Lecture',
  },
  {
    id: 'mon-3',
    day: 'Monday',
    subject: 'Database Systems Laboratory',
    courseCode: 'CS305L',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'Lab 4 (Ground Floor)',
    building: 'Technology Tower',
    startTime: '01:30 PM',
    endTime: '03:30 PM',
    startHour: 13,
    startMinute: 30,
    endHour: 15,
    endMinute: 30,
    type: 'Lab',
  },

  // Tuesday
  {
    id: 'tue-1',
    day: 'Tuesday',
    subject: 'Artificial Intelligence & Neural Nets',
    courseCode: 'AI401',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-102',
    building: 'Academic Block A',
    startTime: '09:30 AM',
    endTime: '10:45 AM',
    startHour: 9,
    startMinute: 30,
    endHour: 10,
    endMinute: 45,
    type: 'Lecture',
  },
  {
    id: 'tue-2',
    day: 'Tuesday',
    subject: 'Operating Systems Principles',
    courseCode: 'CS302',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-305',
    building: 'Computing Sciences Block',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    type: 'Lecture',
  },
  {
    id: 'tue-3',
    day: 'Tuesday',
    subject: 'Engineering Mechanics & Design CAD',
    courseCode: 'ME201',
    faculty: 'lohitha raj (ME)',
    faculty_id: 'cbebe3e8-421a-4e6d-b382-ac93614da4e9',
    department_id: '68b6cf54-20a2-4a41-b1e1-118837e29548',
    room: 'Design Studio 2',
    building: 'Mechanical Wing',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    type: 'Tutorial',
  },

  // Wednesday
  {
    id: 'wed-1',
    day: 'Wednesday',
    subject: 'Data Structures & Algorithms',
    courseCode: 'CS301',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-201',
    building: 'Computing Sciences Block',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: 'Lecture',
  },
  {
    id: 'wed-2',
    day: 'Wednesday',
    subject: 'Discrete Mathematics & Graph Theory',
    courseCode: 'MA204',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-108',
    building: 'Mathematics Block',
    startTime: '10:30 AM',
    endTime: '11:45 AM',
    startHour: 10,
    startMinute: 30,
    endHour: 11,
    endMinute: 45,
    type: 'Lecture',
  },
  {
    id: 'wed-3',
    day: 'Wednesday',
    subject: 'Algorithms Problem Solving Session',
    courseCode: 'CS301T',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'Tutorial Room 3',
    building: 'Computing Sciences Block',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    type: 'Tutorial',
  },

  // Thursday
  {
    id: 'thu-1',
    day: 'Thursday',
    subject: 'Operating Systems Principles',
    courseCode: 'CS302',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-305',
    building: 'Computing Sciences Block',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: 'Lecture',
  },
  {
    id: 'thu-2',
    day: 'Thursday',
    subject: 'Computer Networks & Security',
    courseCode: 'CS303',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-204',
    building: 'Computing Sciences Block',
    startTime: '10:15 AM',
    endTime: '11:15 AM',
    startHour: 10,
    startMinute: 15,
    endHour: 11,
    endMinute: 15,
    type: 'Lecture',
  },
  {
    id: 'thu-3',
    day: 'Thursday',
    subject: 'Networks Practical & Packet Inspection',
    courseCode: 'CS303L',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'Cisco Networking Lab',
    building: 'Technology Tower',
    startTime: '01:30 PM',
    endTime: '03:30 PM',
    startHour: 13,
    startMinute: 30,
    endHour: 15,
    endMinute: 30,
    type: 'Lab',
  },

  // Friday
  {
    id: 'fri-1',
    day: 'Friday',
    subject: 'Artificial Intelligence & Neural Nets',
    courseCode: 'AI401',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-102',
    building: 'Academic Block A',
    startTime: '10:00 AM',
    endTime: '11:15 AM',
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 15,
    type: 'Lecture',
  },
  {
    id: 'fri-2',
    day: 'Friday',
    subject: 'Discrete Mathematics & Graph Theory',
    courseCode: 'MA204',
    faculty: 'Dr. CSE Professor',
    faculty_id: '62a659f2-0d5c-4f55-8247-ee592827a21e',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'LH-108',
    building: 'Mathematics Block',
    startTime: '11:30 AM',
    endTime: '12:30 PM',
    startHour: 11,
    startMinute: 30,
    endHour: 12,
    endMinute: 30,
    type: 'Lecture',
  },
  {
    id: 'fri-3',
    day: 'Friday',
    subject: 'Capstone Project / Innovation Lab',
    courseCode: 'CS499',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'Innovation Sandbox Hub',
    building: 'Central Innovation Hub',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    type: 'Seminar',
  },

  // Saturday
  {
    id: 'sat-1',
    day: 'Saturday',
    subject: 'Industry Speaker Colloquium',
    courseCode: 'SEM101',
    faculty: 'jyothi (Assoc. Prof - CSE)',
    faculty_id: '43e66ea3-1af3-4bbf-90ee-b0c57dfff8ba',
    department_id: '60bf383e-802f-47c7-a732-e936320946be',
    room: 'Main Auditorium',
    building: 'Central Complex',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    type: 'Seminar',
  },
];

export const timetableService = {
  getTimetable(): Promise<TimetableEntry[]> {
    return Promise.resolve(DEFAULT_TIMETABLE);
  },

  getClassesForDay(day: DayOfWeek): Promise<TimetableEntry[]> {
    return Promise.resolve(
      DEFAULT_TIMETABLE.filter((c) => c.day.toLowerCase() === day.toLowerCase())
    );
  },

  getTodayClasses(): Promise<TimetableEntry[]> {
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
      new Date()
    ) as DayOfWeek;
    return this.getClassesForDay(todayName);
  },
};
