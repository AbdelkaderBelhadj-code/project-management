import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/CalendarPage.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const initialEvents = [
    {
        title: 'Réunion d\'équipe',
        start: new Date(2025, 3, 15, 10, 0),
        end: new Date(2025, 3, 15, 11, 0),
    },
    {
        title: 'Présentation projet',
        start: new Date(2025, 3, 17, 14, 0),
        end: new Date(2025, 3, 17, 16, 0),
    },
];

const CalendarPage = () => {
    const [events] = useState(initialEvents);
    const [search, setSearch] = useState('');

    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2> Calendrier des événements</h2>
                <div className="calendar-actions">
                    <input
                        type="text"
                        placeholder=" Rechercher un événement..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="calendar-search"
                    />
                    <button className="calendar-add-btn">
                         Ajouter un événement
                    </button>
                </div>
            </div>
            <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '80vh', backgroundColor: '#fff', borderRadius: '10px', padding: '10px' }}
            />
        </div>
    );
};

export default CalendarPage;
