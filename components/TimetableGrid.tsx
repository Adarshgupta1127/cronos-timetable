import React, { useMemo, useState } from 'react';
import { AppState, DAYS, TIME_SLOTS, Session } from '../types';
import { Filter, X, Zap } from 'lucide-react';

interface TimetableGridProps {
  state: AppState;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ state }) => {
  const [filterType, setFilterType] = useState<'Group' | 'Instructor' | 'Room'>('Group');
  const [filterValue, setFilterValue] = useState<string>('all');

  // Derive filter options
  const filterOptions = useMemo(() => {
    switch (filterType) {
      case 'Group': return state.groups.map(g => ({ id: g.id, name: g.name }));
      case 'Instructor': return state.instructors.map(i => ({ id: i.id, name: i.name }));
      case 'Room': return state.rooms.map(r => ({ id: r.id, name: r.name }));
      default: return [];
    }
  }, [filterType, state]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return state.timetable.filter(session => {
      if (filterValue === 'all') return true;
      const subject = state.subjects.find(s => s.id === session.subjectId);
      if (!subject) return false;

      if (filterType === 'Group') return subject.groupId === filterValue;
      if (filterType === 'Instructor') return subject.instructorId === filterValue;
      if (filterType === 'Room') return session.roomId === filterValue;
      return true;
    });
  }, [state.timetable, filterType, filterValue, state.subjects]);

  const getCellData = (day: string, slotIndex: number) => {
    return filteredSessions.find(s => s.day === day && s.slotIndex === slotIndex);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" /> 
            Master Timetable
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
             {(['Group', 'Instructor', 'Room'] as const).map((t) => (
                 <button
                    key={t}
                    onClick={() => { setFilterType(t); setFilterValue('all'); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        filterType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                 >
                     {t}
                 </button>
             ))}
          </div>
          
          <select 
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="block w-40 pl-3 pr-10 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white text-gray-900"
          >
            <option value="all">View All</option>
            {filterOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto flex-1 p-4">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-8 gap-1 mb-1">
             <div className="font-bold text-gray-400 text-xs uppercase tracking-wider text-center py-2">Time</div>
             {DAYS.map(day => (
                 <div key={day} className="font-bold text-gray-700 text-sm text-center py-2 bg-gray-50 rounded">{day}</div>
             ))}
          </div>

          <div className="grid grid-cols-8 gap-1">
            {TIME_SLOTS.map((slot) => (
                <React.Fragment key={slot.index}>
                    {/* Time Column */}
                    <div className="text-xs font-medium text-gray-500 flex items-center justify-center h-24 border-r border-gray-100 pr-2">
                        {slot.label}
                    </div>

                    {/* Days Columns */}
                    {DAYS.map((day) => {
                        const session = getCellData(day, slot.index);
                        const subject = session ? state.subjects.find(s => s.id === session.subjectId) : null;
                        const room = session ? state.rooms.find(r => r.id === session.roomId) : null;
                        const group = subject ? state.groups.find(g => g.id === subject.groupId) : null;
                        const instructor = subject ? state.instructors.find(i => i.id === subject.instructorId) : null;

                        return (
                            <div 
                                key={`${day}-${slot.index}`} 
                                className={`h-24 rounded-lg border p-2 text-xs flex flex-col justify-center transition-all ${
                                    session 
                                    ? 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200 cursor-pointer shadow-sm' 
                                    : 'bg-white border-dashed border-gray-200'
                                }`}
                            >
                                {session && subject ? (
                                    <>
                                        <div className="font-bold text-blue-800 line-clamp-2">{subject.name}</div>
                                        <div className="mt-1 flex flex-col gap-0.5 text-blue-600/80">
                                            <span className="flex items-center gap-1">
                                                <span className="font-semibold">Loc:</span> {room?.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="font-semibold">Grp:</span> {group?.name}
                                            </span>
                                            {filterType !== 'Instructor' && (
                                                <span className="italic opacity-75">{instructor?.name}</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-gray-300 text-center opacity-0 hover:opacity-100 select-none">Free</span>
                                )}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
)

export default TimetableGrid;