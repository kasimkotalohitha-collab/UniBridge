import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/event.service';
import { CampusEvent } from '../../types/database.types';
import { EventCard } from '../../components/events/EventCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Spinner } from '../../components/common/Spinner';
import { Calendar, Plus, Search, MapPin, Users } from 'lucide-react';

export const CampusEventsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for adding event (faculty/admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('Campus Life');
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const newEvt = await eventService.createEvent({
        title,
        description,
        organizer,
        location,
        event_date: new Date(eventDate).toISOString(),
        category,
        created_by: user.id,
      });
      if (newEvt) {
        setEvents((prev) => [...prev, newEvt]);
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setOrganizer('');
        setLocation('');
        setEventDate('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campus Events & Activities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover student hackathons, town halls, sports fixtures, and club gatherings.
          </p>
        </div>

        {(role === 'admin' || role === 'faculty') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Campus Event
          </Button>
        )}
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-subtle flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
        <input
          type="text"
          placeholder="Search campus events by name, club, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-100 flex justify-center">
          <Spinner label="Loading campus events..." />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 text-brand-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no campus events matching your criteria at this moment.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}

      {/* Create Event Modal for Faculty / Admins */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Campus Event"
        description="Publish an announcement or activity for students and faculty."
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g. Annual Campus Career Fair 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Event Details / Description"
            placeholder="Provide timing, registration details, eligibility, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Organizing Body / Club"
              placeholder="e.g. Student Senate, Tech Society"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              required
            />
            <Input
              label="Category"
              placeholder="e.g. Career, Sports, Culture"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Campus Location / Venue"
              placeholder="e.g. Auditorium Hall 1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              label="Date & Time"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
