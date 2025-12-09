export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture Hall' | 'Lab' | 'Classroom';
}

export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  unavailableSlots: string[]; // Format: "Day-TimeSlotIndex" e.g. "Mon-0"
}

export interface Group {
  id: string;
  name: string;
  size: number;
}

export interface Subject {
  id: string;
  name: string;
  instructorId: string;
  groupId: string;
  duration: number; // in slots (1 slot = 1 hour usually)
  requiredRoomType: 'Lecture Hall' | 'Lab' | 'Classroom';
  sessionsPerWeek: number;
}

export interface TimeSlot {
  index: number;
  label: string; // e.g., "09:00 - 10:00"
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIME_SLOTS: TimeSlot[] = [
  { index: 0, label: '08:00 - 09:00' },
  { index: 1, label: '09:00 - 10:00' },
  { index: 2, label: '10:00 - 11:00' },
  { index: 3, label: '11:00 - 12:00' },
  { index: 4, label: '13:00 - 14:00' },
  { index: 5, label: '14:00 - 15:00' },
  { index: 6, label: '15:00 - 16:00' },
];

export interface Session {
  id: string;
  subjectId: string;
  roomId: string;
  day: string;
  slotIndex: number;
}

export interface ScheduleConflict {
  type: 'Instructor' | 'Room' | 'Group' | 'Capacity';
  description: string;
  sessionId: string;
}

export interface AppState {
  rooms: Room[];
  instructors: Instructor[];
  groups: Group[];
  subjects: Subject[];
  timetable: Session[];
}