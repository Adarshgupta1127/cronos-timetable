import { AppState, Session, DAYS, TIME_SLOTS, Subject, Room, Instructor, Group, ScheduleConflict } from '../types';

// Helper to check if a slot is valid
const isValid = (
  day: string,
  slotIndex: number,
  subject: Subject,
  roomId: string,
  currentSessions: Session[],
  instructors: Instructor[],
  rooms: Room[],
  groups: Group[]
): boolean => {
  const duration = subject.duration;
  
  // 1. Check bounds (does the class fit in the day?)
  if (slotIndex + duration > TIME_SLOTS.length) return false;

  // 2. Identify resources
  const instructor = instructors.find(i => i.id === subject.instructorId);
  const room = rooms.find(r => r.id === roomId);
  const group = groups.find(g => g.id === subject.groupId);

  if (!instructor || !room || !group) return false;

  // 3. Check Room Constraints
  if (room.type !== subject.requiredRoomType) return false;
  if (room.capacity < group.size) return false;

  // 4. Check Overlaps
  // We need to check every slot this session would occupy
  for (let d = 0; d < duration; d++) {
    const currentSlot = slotIndex + d;
    const timeKey = `${day}-${currentSlot}`;

    // a. Instructor Availability (Hard constraint in data)
    if (instructor.unavailableSlots.includes(timeKey)) return false;

    // b. Conflict with existing sessions
    // Let's rewrite the overlap check to be robust
    for (const existingSession of currentSessions) {
      if (existingSession.day !== day) continue;
      
      // We assume strict slot checking logic is handled by caller or we ignore this helper since checkConflict is used below.
    }
  }

  return true;
};

// Simplified Constraint Check for the Solver
const checkConflict = (
  day: string,
  slot: number,
  duration: number,
  roomId: string,
  instructorId: string,
  groupId: string,
  schedule: Session[],
  subjects: Subject[]
): boolean => {
  for (let d = 0; d < duration; d++) {
    const checkSlot = slot + d;
    if (checkSlot >= TIME_SLOTS.length) return true; // Out of bounds

    for (const s of schedule) {
      if (s.day !== day) continue;
      
      const sSubject = subjects.find(sub => sub.id === s.subjectId);
      if (!sSubject) continue;

      const sStart = s.slotIndex;
      const sEnd = s.slotIndex + sSubject.duration;
      const checkStart = slot;
      const checkEnd = slot + duration;

      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      if (sStart < checkEnd && sEnd > checkStart) {
        // Overlap detected. Check resources.
        if (s.roomId === roomId) return true; // Room occupied
        if (sSubject.instructorId === instructorId) return true; // Instructor occupied
        if (sSubject.groupId === groupId) return true; // Group occupied
      }
    }
  }
  return false;
};

export const generateSchedule = (
  rooms: Room[],
  instructors: Instructor[],
  groups: Group[],
  subjects: Subject[]
): Session[] => {
  let schedule: Session[] = [];
  
  // 1. Flatten subjects into individual required sessions
  // E.g., if Math requires 3 sessions/week, we create 3 tasks.
  const tasks: { subjectId: string; duration: number; id: string }[] = [];
  subjects.forEach(sub => {
    for (let i = 0; i < sub.sessionsPerWeek; i++) {
      tasks.push({ subjectId: sub.id, duration: sub.duration, id: `${sub.id}_instance_${i}` });
    }
  });

  // Sort tasks: Longest duration first (Heuristic)
  tasks.sort((a, b) => b.duration - a.duration);

  // Backtracking Solver
  const solve = (taskIndex: number): boolean => {
    if (taskIndex >= tasks.length) return true; // All tasks placed

    const task = tasks[taskIndex];
    const subject = subjects.find(s => s.id === task.subjectId)!;
    const group = groups.find(g => g.id === subject.groupId)!;
    const instructor = instructors.find(i => i.id === subject.instructorId)!;

    // Try every Day
    for (const day of DAYS) {
      // Try every Slot
      for (let slot = 0; slot < TIME_SLOTS.length; slot++) {
        
        // Optimization: Don't schedule multi-hour classes at the end of the day if they don't fit
        if (slot + subject.duration > TIME_SLOTS.length) continue;

        // Try every valid Room
        for (const room of rooms) {
            // Room constraints
            if (room.type !== subject.requiredRoomType) continue;
            if (room.capacity < group.size) continue;

            // Check conflicts
            if (!checkConflict(day, slot, subject.duration, room.id, instructor.id, group.id, schedule, subjects)) {
                
                // Also check instructor specific unavailability
                let instructorAvailable = true;
                for(let d=0; d<subject.duration; d++) {
                    if (instructor.unavailableSlots.includes(`${day}-${slot + d}`)) {
                        instructorAvailable = false;
                        break;
                    }
                }
                if (!instructorAvailable) continue;

                // Place assignment
                const newSession: Session = {
                    id: Math.random().toString(36).substr(2, 9),
                    subjectId: subject.id,
                    roomId: room.id,
                    day: day,
                    slotIndex: slot
                };
                schedule.push(newSession);

                // Recurse
                if (solve(taskIndex + 1)) return true;

                // Backtrack
                schedule.pop();
            }
        }
      }
    }

    return false; // Could not place this task anywhere
  };

  const success = solve(0);
  if (!success) {
    console.error("Could not find a valid schedule for all subjects.");
    // In a real app, we would return partial schedule or errors
    // For now, return what we managed (which is empty if it failed at root, or partial if we change logic)
    // Actually, pure backtracking returns empty on fail. Let's return empty to signal failure.
    return [];
  }

  return schedule;
};

export const detectConflicts = (
    timetable: Session[],
    subjects: Subject[],
    rooms: Room[],
    instructors: Instructor[],
    groups: Group[]
): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    
    // Compare every session against every other session
    for (let i = 0; i < timetable.length; i++) {
        for (let j = i + 1; j < timetable.length; j++) {
            const s1 = timetable[i];
            const s2 = timetable[j];

            if (s1.day !== s2.day) continue;

            const sub1 = subjects.find(s => s.id === s1.subjectId)!;
            const sub2 = subjects.find(s => s.id === s2.subjectId)!;

            const start1 = s1.slotIndex;
            const end1 = s1.slotIndex + sub1.duration;
            const start2 = s2.slotIndex;
            const end2 = s2.slotIndex + sub2.duration;

            if (start1 < end2 && end1 > start2) {
                // Overlap
                if (s1.roomId === s2.roomId) {
                    conflicts.push({ type: 'Room', description: `Room ${rooms.find(r=>r.id===s1.roomId)?.name} double booked`, sessionId: s1.id });
                }
                if (sub1.instructorId === sub2.instructorId) {
                    conflicts.push({ type: 'Instructor', description: `Instructor ${instructors.find(ins=>ins.id===sub1.instructorId)?.name} double booked`, sessionId: s1.id });
                }
                if (sub1.groupId === sub2.groupId) {
                    conflicts.push({ type: 'Group', description: `Group ${groups.find(g=>g.id===sub1.groupId)?.name} double booked`, sessionId: s1.id });
                }
            }
        }
    }
    return conflicts;
};