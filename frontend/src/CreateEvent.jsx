import { useState, useEffect } from "react";
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
  const [locale, setLocale] = useState();

  useEffect(() => {
    const loadLocale = async () => {
      const lang = navigator.language || "en-US";
      try {
        const mod = await import(`date-fns/locale/${lang}`);
        setLocale(mod.default || mod[Object.keys(mod)[0]]);
      } catch {
        const short = lang.split("-")[0];
        try {
          const mod = await import(`date-fns/locale/${short}`);
          setLocale(mod.default || mod[Object.keys(mod)[0]]);
        } catch {
          setLocale(undefined);
        }
      }
    };
    loadLocale();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-2">
      <form
        className="w-full max-w-md bg-white/80 rounded-2xl shadow-xl p-6 flex flex-col gap-6 border border-gray-100"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-blue-900 text-center mb-1">Create Event</h2>
        <div className="pb-4 flex flex-col gap-2">
          <label className="block font-medium text-sm">Event Title</label>
          <input
            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/60"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <label className="block font-medium text-sm mt-3">Description</label>
          <input
            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none bg-white/60"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="pb-4">
          <label className="block font-medium text-sm mb-2">Date Range</label>
          <div className="flex justify-center">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              locale={locale}
              weekStartsOn={locale?.options?.weekStartsOn ?? 1}
              className="rounded-xl shadow bg-white"
              style={{ minWidth: "280px" }}
            />
          </div>
        </div>
        <div className="flex gap-3 pb-4">
          <div className="flex-1 flex flex-col">
            <label className="font-medium text-sm mb-1">No earlier than</label>
            <select
              className="border border-gray-200 rounded-md px-2 py-2 bg-white/60"
              value={fromTime}
              onChange={e => setFromTime(e.target.value)}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <label className="font-medium text-sm mb-1">No later than</label>
            <select
              className="border border-gray-200 rounded-md px-2 py-2 bg-white/60"
              value={toTime}
              onChange={e => setToTime(e.target.value)}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block font-medium text-sm mb-1">Time slot step (minutes)</label>
          <input
            className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white/60"
            type="number"
            min={15}
            max={120}
            step={15}
            value={step}
            onChange={e => setStep(e.target.value)}
          />
        </div>
        {error && <div className="text-red-600 text-center text-sm">{error}</div>}
        <button
          className="w-full mt-2 py-2 rounded-lg border border-blue-300 text-blue-800 bg-white/70 font-medium hover:bg-blue-50 transition"
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
      {/* Minimal DayPicker custom style */}
      <style>{`
        .rdp {
          margin: 0 auto;
          --rdp-accent-color: #2563eb;
          --rdp-background-color: #f1f5f9;
        }
        .rdp .rdp-day_selected, .rdp .rdp-day_range_start, .rdp .rdp-day_range_end {
          background: #2563eb !important;
          color: #fff !important;
        }
        .rdp .rdp-day_range_middle {
          background: #bfdbfe !important;
        }
        .rdp .rdp-day_today {
          border-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
}
