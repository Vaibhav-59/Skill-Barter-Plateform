import React from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTheme } from "../../hooks/useTheme";

const localizer = momentLocalizer(moment);

const CalendarView = ({ sessions, onSelectSession }) => {
  const { isDarkMode } = useTheme();

  const events = sessions.map((session) => {
    // Combine date and time to create proper Date objects
    // Handle standard database ISO strings avoiding TZ shifts
    const startDate = new Date(session.date);
    const [startHour, startMinute] = session.startTime.split(":");
    startDate.setHours(parseInt(startHour, 10), parseInt(startMinute, 10));

    const endDate = new Date(session.date);
    const [endHour, endMinute] = session.endTime.split(":");
    endDate.setHours(parseInt(endHour, 10), parseInt(endMinute, 10));

    return {
      title: `${session.skillTeach} ↔ ${session.skillLearn}`,
      start: startDate,
      end: endDate,
      resource: session,
    };
  });

  // Custom Event Component for better UI within the calendar blocks
  const EventComponent = ({ event }) => {
    const isAccepted = event.resource.status === "accepted";
    const isCompleted = event.resource.status === "completed";
    
    return (
      <div className="flex items-center group relative overflow-hidden h-full rounded-md px-1">
        <div className="flex-1 w-full text-xs font-semibold truncate z-10">
          {event.title}
        </div>
        {/* Subtle status indicator overlay */}
        {isAccepted && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
        )}
      </div>
    );
  };

  const eventPropGetter = (event) => {
    let style = {
      background: "linear-gradient(to right, #10b981, #0d9488)", // Emerald-Teal
      borderRadius: "0.375rem",
      color: "white",
      border: "0px",
      display: "block",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    };

    if (event.resource.status === "completed") {
      style.background = "linear-gradient(to right, #3b82f6, #1d4ed8)"; // Blue
      style.opacity = 0.8;
    } else if (event.resource.status === "pending") {
      style.background = "linear-gradient(to right, #f59e0b, #d97706)"; // Amber
    } else if (event.resource.status === "rejected") {
      style.background = "linear-gradient(to right, #ef4444, #b91c1c)"; // Red
    }

    return { style };
  };

  // State for Navigation and Views
  const [view, setView] = React.useState(Views.MONTH);
  const [date, setDate] = React.useState(new Date());

  return (
    <div className={`h-[650px] w-full ${isDarkMode ? 'bg-gray-900/40 border-gray-700/50' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden group`}>
      {/* Decorative Glows */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Internal Custom CSS to completely override react-big-calendar defaults */}
      <style>{`
        .rbc-calendar {
          font-family: inherit;
          color: ${isDarkMode ? '#e5e7eb' : '#374151'}; 
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          border-color: ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
          border-radius: 0.75rem;
          overflow: hidden;
          background: ${isDarkMode ? 'rgba(31, 41, 55, 0.2)' : 'rgba(255, 255, 255, 0.5)'};
        }
        .rbc-header {
          padding: 0.75rem 0.5rem;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          border-bottom: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
          border-left: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-header + .rbc-header {
          border-left: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-day-bg.rbc-today {
          background-color: ${isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.1)'};
        }
        .rbc-day-bg:hover {
          background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
          transition: background-color 0.2s ease;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px dashed ${isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.6)'};
        }
        .rbc-time-content {
          border-top: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-time-header-content {
          border-left: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-time-view .rbc-allday-cell {
          background: ${isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)'};
          border-bottom: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-time-view .rbc-time-gutter {
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          background: ${isDarkMode ? 'rgba(17, 24, 39, 0.2)' : 'rgba(249, 250, 251, 0.5)'};
          font-size: 0.75rem;
          font-weight: 500;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-event {
          padding: 2px 4px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .rbc-event:hover {
          transform: translateY(-2px) scale(1.01);
          opacity: 1;
        }
        .rbc-toolbar {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rbc-toolbar button {
          color: ${isDarkMode ? '#d1d5db' : '#4b5563'};
          border: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 1)'};
          background: ${isDarkMode ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
          padding: 0.5rem 1rem;
          font-weight: 500;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        .rbc-toolbar button:hover {
          background: ${isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(243, 244, 246, 1)'};
          color: ${isDarkMode ? 'white' : 'black'};
        }
        .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10b981 !important; 
          border-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: none !important;
        }
        .rbc-toolbar .rbc-toolbar-label {
          font-weight: 800;
          font-size: 1.5rem;
          color: ${isDarkMode ? 'transparent' : '#111827'};
          background: ${isDarkMode ? 'linear-gradient(to right, #a7f3d0, #6ee7b7, #10b981)' : 'none'};
          -webkit-background-clip: ${isDarkMode ? 'text' : 'border-box'};
        }
        .rbc-agenda-view table.rbc-agenda-table {
          border: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td {
          border-left: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr + tr {
          border-top: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
        }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          border-bottom: 1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.8)'};
          padding: 0.75rem 0.5rem;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
        .rbc-agenda-time-cell, .rbc-agenda-date-cell, .rbc-agenda-event-cell {
          color: ${isDarkMode ? '#d1d5db' : '#374151'};
          padding: 0.75rem 0.5rem;
        }
        .rbc-off-range-bg {
          background: ${isDarkMode ? 'rgba(17, 24, 39, 0.2)' : 'rgba(249, 250, 251, 0.5)'};
        }
        .rbc-date-cell {
          padding: 0.25rem 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .rbc-date-cell.rbc-now {
          font-weight: 800;
          color: #10b981;
        }
      `}</style>
      
      <div className="relative z-10 h-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={(event) => onSelectSession(event.resource)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          components={{
            event: EventComponent,
          }}
          eventPropGetter={eventPropGetter}
          popup
          selectable
        />
      </div>
    </div>
  );
};

export default CalendarView;
