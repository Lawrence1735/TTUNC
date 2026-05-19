import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from './ui/icons';

interface AttendanceDate {
  date: Date;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}

interface AttendanceCalendarChecklistProps {
  traineeName: string;
  attendanceDates: AttendanceDate[];
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceCalendarChecklist({
  traineeName,
  attendanceDates,
  startDate,
  endDate
}: AttendanceCalendarChecklistProps) {
  // Create a map of dates to attendance status for quick lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceDate>();
    attendanceDates.forEach(record => {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      map.set(dateStr, record);
    });
    return map;
  }, [attendanceDates]);

  // Determine calendar range
  const calendarStart = startDate ? new Date(startDate) : new Date(2024, 5, 1); // June 1 default
  const calendarEnd = endDate ? new Date(endDate) : new Date(2024, 7, 31); // August 31 default

  // Generate all dates in the range
  const allDates = useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(calendarStart);
    
    while (current <= calendarEnd) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [calendarStart, calendarEnd]);

  // Group dates by week for better display
  const weeks = useMemo(() => {
    const weeksArray = [];
    let currentWeek = [];

    allDates.forEach(date => {
      currentWeek.push(date);
      if (currentWeek.length === 7 || date.getTime() === allDates[allDates.length - 1].getTime()) {
        weeksArray.push([...currentWeek]);
        if (currentWeek.length === 7) {
          currentWeek = [];
        }
      }
    });

    return weeksArray;
  }, [allDates]);

  // Statistics
  const stats = useMemo(() => {
    const present = attendanceDates.filter(r => r.status === 'present').length;
    const absent = attendanceDates.filter(r => r.status === 'absent').length;
    const excused = attendanceDates.filter(r => r.status === 'excused').length;
    const total = attendanceDates.length;

    return { present, absent, excused, total };
  }, [attendanceDates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'absent':
        return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200';
      case 'excused':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border border-green-300">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border border-red-300">Absent</Badge>;
      case 'excused':
        return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">Excused</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border border-gray-300">—</Badge>;
    }
  };

  return (
    <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#7A1E1E]" />
          <div>
            <CardTitle>Training Attendance Calendar</CardTitle>
            <CardDescription>Summer intensive attendance record for {traineeName}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Attendance Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 font-medium">Present</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.present}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium">Absent</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{stats.absent}</p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700 font-medium">Excused</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.excused}</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Total Days</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-[#1a1a1a]">Daily Checklist</h4>
          
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                {week.map((date, dayIdx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const attendance = attendanceMap.get(dateStr);
                  const status = attendance?.status || 'unmarked';
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <div
                      key={dayIdx}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded border-2 min-w-16
                        transition-all cursor-default
                        ${getStatusColor(status)}
                        ${isToday ? 'ring-2 ring-offset-1 ring-[#7A1E1E]' : ''}
                      `}
                      title={`${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${status}`}
                    >
                      <span className="text-xs font-bold">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {status !== 'unmarked' && (
                        <span className="text-xs font-semibold mt-1 capitalize">
                          {status === 'present' ? '✓' : status === 'absent' ? '✗' : '◊'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="p-4 bg-[#f8f9fa] border border-[#e0e0e0] rounded-lg">
          <p className="text-xs font-semibold text-[#6c757d] mb-2">LEGEND</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded text-center text-green-800 text-xs font-bold">✓</div>
              <span className="text-xs">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded text-center text-red-800 text-xs font-bold">✗</div>
              <span className="text-xs">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded text-center text-yellow-800 text-xs font-bold">◊</div>
              <span className="text-xs">Excused</span>
            </div>
          </div>
        </div>

        {/* Detailed List View */}
        {attendanceDates.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-[#1a1a1a]">Detailed Attendance Records</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {attendanceDates
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#f8f9fa] border border-[#e0e0e0] rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a]">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-[#6c757d] mt-1">{record.notes}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
