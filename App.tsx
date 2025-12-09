import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import TimetableGrid from './components/TimetableGrid';
import { 
  AppState, Session, Subject, Room, Instructor, Group, 
  DAYS, TIME_SLOTS 
} from './types';
import { initialRooms, initialInstructors, initialGroups, initialSubjects } from './services/mockData';
import { generateSchedule, detectConflicts } from './services/scheduler';
import { generateScheduleReport } from './services/geminiService';
import { 
  Calendar, Users, BookOpen, Layers, Play, AlertTriangle, CheckCircle, 
  Bot, Loader2, Plus, Trash2 
} from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appState, setAppState] = useState<AppState>({
    rooms: initialRooms,
    instructors: initialInstructors,
    groups: initialGroups,
    subjects: initialSubjects,
    timetable: []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  
  // AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Handlers ---

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setGenerationError(null);
    setConflicts([]);
    
    // Simulate thinking delay for UX
    setTimeout(() => {
        try {
            const newSchedule = generateSchedule(
                appState.rooms,
                appState.instructors,
                appState.groups,
                appState.subjects
            );
            
            if (newSchedule.length === 0 && appState.subjects.length > 0) {
                setGenerationError("Failed to generate a valid schedule. Constraints are too tight. Try adding more rooms or reducing subject sessions.");
                setAppState(prev => ({ ...prev, timetable: [] }));
            } else {
                setAppState(prev => ({ ...prev, timetable: newSchedule }));
                // Check conflicts immediately (should be 0 if algorithm works, but good for validation)
                const issues = detectConflicts(
                    newSchedule, 
                    appState.subjects, 
                    appState.rooms, 
                    appState.instructors, 
                    appState.groups
                );
                setConflicts(issues);
                if (activeTab === 'dashboard') setActiveTab('timetable');
            }
        } catch (e) {
            console.error(e);
            setGenerationError("An unexpected error occurred during scheduling.");
        } finally {
            setIsGenerating(false);
        }
    }, 800);
  }, [appState.rooms, appState.instructors, appState.groups, appState.subjects, activeTab]);

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;
    setIsAiThinking(true);
    const response = await generateScheduleReport(appState, aiQuery);
    setAiResponse(response);
    setIsAiThinking(false);
  };

  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Instructors" value={appState.instructors.length} icon={Users} color="bg-indigo-500" />
        <StatsCard label="Active Classes" value={appState.subjects.length} icon={BookOpen} color="bg-pink-500" />
        <StatsCard label="Rooms Available" value={appState.rooms.length} icon={Layers} color="bg-emerald-500" />
        <StatsCard label="Scheduled Sessions" value={appState.timetable.length} icon={Calendar} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Action Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Status</h2>
          
          {appState.timetable.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
               <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
               <h3 className="text-lg font-medium text-gray-900">No Timetable Generated</h3>
               <p className="text-gray-500 max-w-sm mx-auto mb-6">Configuration is ready. Run the algorithmic scheduler to generate a conflict-free timetable.</p>
               <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
               >
                 {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                 {isGenerating ? 'Solving CSP...' : 'Generate Timetable'}
               </button>
               {generationError && (
                   <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-center justify-center">
                       <AlertTriangle className="w-4 h-4 mr-2" />
                       {generationError}
                   </div>
               )}
            </div>
          ) : (
             <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                     <div className="flex items-center">
                         <CheckCircle className="text-green-600 w-6 h-6 mr-3" />
                         <div>
                             <p className="font-semibold text-green-900">Timetable Active</p>
                             <p className="text-sm text-green-700">{appState.timetable.length} sessions scheduled successfully.</p>
                         </div>
                     </div>
                     <button 
                        onClick={handleGenerate}
                        className="text-sm font-medium text-green-700 hover:text-green-800 underline"
                     >
                        Regenerate
                     </button>
                 </div>
                 
                 {conflicts.length > 0 ? (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <h4 className="font-semibold text-red-900 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" /> Conflicts Detected
                        </h4>
                        <ul className="list-disc pl-5 mt-2 text-sm text-red-700">
                            {conflicts.map((c, i) => (
                                <li key={i}>{c.description}</li>
                            ))}
                        </ul>
                    </div>
                 ) : (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
                        No conflicts detected. All constraints satisfied.
                    </div>
                 )}

                 <div className="flex justify-end mt-4">
                     <button onClick={() => setActiveTab('timetable')} className="text-blue-600 font-medium hover:underline">View Full Timetable &rarr;</button>
                 </div>
             </div>
          )}
        </div>

        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl shadow-lg text-white p-6 flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
                <Bot className="text-yellow-400" />
                <h2 className="text-xl font-bold">Cronos AI</h2>
            </div>
            <p className="text-indigo-200 text-sm mb-4">
                Ask questions about your schedule, fairness, or get a summary.
            </p>
            
            <div className="flex-1 overflow-y-auto mb-4 bg-white/10 rounded-lg p-3 min-h-[150px] max-h-[200px] text-sm">
                {aiResponse ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
                ) : (
                    <span className="text-indigo-400 italic">Example: "Are there any instructors with more than 5 hours on Monday?"</span>
                )}
            </div>

            <div className="mt-auto">
                <textarea 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask about the schedule..."
                    className="w-full bg-indigo-950/50 border border-indigo-700 rounded-lg p-3 text-sm text-white placeholder-indigo-400 focus:outline-none focus:border-indigo-500 resize-none h-20 mb-2"
                />
                <button 
                    onClick={handleAskAI}
                    disabled={isAiThinking || appState.timetable.length === 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isAiThinking ? <Loader2 className="animate-spin w-4 h-4" /> : 'Analyze with Gemini'}
                </button>
                {appState.timetable.length === 0 && <p className="text-xs text-center text-indigo-400 mt-2">Generate schedule first.</p>}
            </div>
        </div>
      </div>
    </div>
  );

  const renderResourceList = (title: string, data: any[], type: 'room' | 'instructor' | 'group' | 'subject') => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700 text-lg">{title}</h3>
            <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add New
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {type === 'room' && `Cap: ${item.capacity} | ${item.type}`}
                                {type === 'instructor' && `${item.specialty}`}
                                {type === 'group' && `Size: ${item.size}`}
                                {type === 'subject' && `${item.sessionsPerWeek} sessions/wk (${item.duration}h)`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">No records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="h-full">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'timetable' && (
             appState.timetable.length > 0 ? (
                <TimetableGrid state={appState} />
             ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Calendar className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-medium text-gray-500">Schedule Empty</h3>
                    <p className="text-gray-400 mt-2 mb-6">Go to Dashboard to generate a new timetable.</p>
                    <button onClick={() => setActiveTab('dashboard')} className="text-blue-600 hover:underline">Back to Dashboard</button>
                </div>
             )
        )}

        {activeTab === 'instructors' && renderResourceList('Instructors', appState.instructors, 'instructor')}
        {activeTab === 'subjects' && renderResourceList('Subjects', appState.subjects, 'subject')}
        {activeTab === 'resources' && (
            <div className="space-y-8">
                {renderResourceList('Rooms', appState.rooms, 'room')}
                {renderResourceList('Student Groups', appState.groups, 'group')}
            </div>
        )}
        
        {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-gray-600 mb-6">Configuration for the Constraint Satisfaction Algorithm.</p>
                <div className="space-y-4 max-w-lg">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                         <span>Allow gaps between classes for groups</span>
                         <input type="checkbox" className="h-5 w-5 text-blue-600 rounded" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                         <span>Max consecutive hours for instructors</span>
                         <select className="border-gray-300 rounded-md shadow-sm p-1 border">
                             <option>2 hours</option>
                             <option selected>4 hours</option>
                             <option>6 hours</option>
                         </select>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full mt-4">Save Configuration</button>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default App;