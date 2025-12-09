import { Room, Instructor, Group, Subject } from '../types';

export const initialRooms: Room[] = [
  { id: 'r1', name: 'Hall A', capacity: 100, type: 'Lecture Hall' },
  { id: 'r2', name: 'Room 101', capacity: 30, type: 'Classroom' },
  { id: 'r3', name: 'Room 102', capacity: 30, type: 'Classroom' },
  { id: 'r4', name: 'Comp Lab 1', capacity: 25, type: 'Lab' },
];

export const initialInstructors: Instructor[] = [
  { id: 'i1', name: 'Dr. Alan Turing', specialty: 'CS', unavailableSlots: ['Monday-0'] },
  { id: 'i2', name: 'Dr. Ada Lovelace', specialty: 'Math', unavailableSlots: [] },
  { id: 'i3', name: 'Prof. Einstein', specialty: 'Physics', unavailableSlots: ['Friday-6'] },
  { id: 'i4', name: 'Prof. Curie', specialty: 'Chemistry', unavailableSlots: [] },
];

export const initialGroups: Group[] = [
  { id: 'g1', name: 'CS - Year 1', size: 25 },
  { id: 'g2', name: 'Physics - Year 1', size: 20 },
  { id: 'g3', name: 'Math - Year 2', size: 30 },
];

export const initialSubjects: Subject[] = [
  { id: 's1', name: 'Intro to CS', instructorId: 'i1', groupId: 'g1', duration: 1, requiredRoomType: 'Lecture Hall', sessionsPerWeek: 3 },
  { id: 's2', name: 'Calculus I', instructorId: 'i2', groupId: 'g1', duration: 1, requiredRoomType: 'Classroom', sessionsPerWeek: 2 },
  { id: 's3', name: 'Physics Lab', instructorId: 'i3', groupId: 'g2', duration: 2, requiredRoomType: 'Lab', sessionsPerWeek: 1 },
  { id: 's4', name: 'Organic Chem', instructorId: 'i4', groupId: 'g2', duration: 1, requiredRoomType: 'Classroom', sessionsPerWeek: 3 },
  { id: 's5', name: 'Advanced Math', instructorId: 'i2', groupId: 'g3', duration: 1, requiredRoomType: 'Classroom', sessionsPerWeek: 4 },
];