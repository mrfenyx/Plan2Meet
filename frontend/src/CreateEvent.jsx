import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0");
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("17:00");
  const [step, setStep] = useState(30);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setEventId("");
    try {
      const res = await fetch(`${API_URL}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date_range: {
            start: range.from && format(range.from, "yyyy-MM-dd"),
            end: range.to && format(range.to, "yyyy-MM-dd"),
          },
          time_range: { from: fromTime, to: toTime },
          time_step_minutes: Number(step),
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const data = await res.json();
      setEventId(data._id);
    } catch (err) {
      setError(err.message || "Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
      <form
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-blue-800 text-center">Create Event</h2>
        <div>
          <label className="block font-medium mb-1">Event Title</label>
          <input
            className="w-full border rounded-lg p-2"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <input
            className="w-full border rounded-lg p-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
            <label className="block font-medium mb-1">Date Range</label>
            <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                className="rounded-lg border"
            />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">No sooner than</label>
            <select
              className="w-full border rounded-lg p-2"
              value={fromTime}
              onChange={e => setFromTime(e.target.value)}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">No later than</label>
            <select
              className="w-full border rounded-lg p-2"
              value={toTime}
              onChange={e => setToTime(e.target.value)}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Time slot step (minutes)</label>
          <input
            className="w-full border rounded-lg p-2"
            type="number"
            min={15}
            max={120}
            step={15}
            value={step}
            onChange={e => setStep(e.target.value)}
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          className="bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 transition"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
        {eventId && (
            <div className="bg-green-50 border border-green-200 p-4 rounded text-center mt-2">
                <div className="text-green-800 font-medium">Event created!</div>
                <div className="text-green-600 break-all">
                Event link:{" "}
                <a
                    href={`${window.location.origin}/event/${eventId}`}
                    className="underline text-blue-700"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {window.location.origin}/event/{eventId}
                </a>
                </div>
            </div>
        )}
      </form>
    </div>
  );
}

// Simple wrapper for DateRangePicker
function DateRangePicker({ range, setRange }) {
  const [selected, setSelected] = useState(range);

  // Sync with parent state
  React.useEffect(() => setSelected(range), [range]);
  React.useEffect(() => setRange(selected), [selected]);

  // Import from react-day-picker
  const { DateRangePicker: Picker } = require("react-day-picker");
  return (
    <Picker
      mode="range"
      selected={selected}
      onSelect={setSelected}
      numberOfMonths={2}
      className="rounded-lg border"
    />
  );
}
