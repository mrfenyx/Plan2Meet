import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AvailabilityGrid from "./AvailabilityGrid";
import { RefreshCcw, PlusCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export default function EventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loadError, setLoadError] = useState("");
  const [participantLoaded, setParticipantLoaded] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [allAvailabilities, setAllAvailabilities] = useState([]);
  const [submitStatus, setSubmitStatus] = useState("");

  // Fetch event info on mount
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setEvent(null);
      try {
        const res = await fetch(`${API_URL}/event/${eventId}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data);
      } catch {
        setEvent(null);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  // Fetch all participants' availability after event or participant updates
  useEffect(() => {
    if (!event) return;
    fetch(`${API_URL}/event/${eventId}`)
      .then(res => res.json())
      .then(data => {
        setAllAvailabilities(
          (data.participants || []).map((p) => ({
            name: p.name,
            availability: p.availability || []
          }))
        );
      });
  }, [event, participantLoaded, eventId]);

  // When loading an existing participant, set their availability
  useEffect(() => {
    if (participant && participant.availability) {
      setAvailability(participant.availability);
    }
  }, [participant]);

  const handleLoad = async (e) => {
    e.preventDefault();
    setLoadError("");
    setParticipantLoaded(false);
    setParticipant(null);

    try {
      // Call backend to check if participant exists and get their availability
      const res = await fetch(`${API_URL}/event/${eventId}/participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (res.status === 404) {
        // New participant; create new entry in next step
        setParticipantLoaded(true);
        setParticipant({ name, password });
        setAvailability([]);
      } else if (!res.ok) {
        throw new Error("Incorrect password or error loading participant.");
      } else {
        const data = await res.json();
        setParticipantLoaded(true);
        setParticipant(data);
        setAvailability(data.availability || []);
      }
    } catch (err) {
      setLoadError(err.message || "Error loading participant.");
    }
  };

  // Submit/save availability to backend
  const handleSubmit = async () => {
    setSubmitStatus("");
    if (!name) {
      setSubmitStatus("Please enter your name before submitting.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/event/${eventId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
          slots: availability,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitStatus(data.error || "Failed to submit.");
      } else {
        setSubmitStatus("Availability submitted!");
        // Refresh all availabilities after submit
        fetch(`${API_URL}/event/${eventId}`)
          .then(res => res.json())
          .then(data => {
            setAllAvailabilities(
              (data.participants || []).map((p) => ({
                name: p.name,
                availability: p.availability || []
              }))
            );
          });
      }
    } catch {
      setSubmitStatus("Network error submitting availability.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 px-2">
      <div className="w-full max-w-5xl bg-white/80 shadow-xl rounded-2xl p-6 border border-gray-100">
        {loading ? (
          <div className="text-center text-blue-600">Loading event...</div>
        ) : !event ? (
          <div className="text-center text-red-600">Event not found.</div>
        ) : (
          <>
            <div className="w-full flex gap-2">
              <button
                className="inline-flex items-center gap-1 px-3 py-1 mt-4 mb-4 ml-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium shadow transition"
                onClick={() => navigate("/")}
                aria-label="Back to create event"
              >
                <PlusCircle className="w-4 h-4" />
                New Event
              </button>
              {participantLoaded && (
                <button
                  className="inline-flex items-center gap-1 px-3 py-1 mt-4 mb-4 ml-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium shadow transition"
                  onClick={() => window.location.reload()}
                  aria-label="Back to event"
                  type="button"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Back to event
                </button>
              )}
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {event.title}
                {participantLoaded && name && (
                    <span className="font-normal text-xl text-blue-700"> – Let’s plan, {name}</span>
                )}
            </h2>
            {event.description && (
              <div className="text-gray-700 mb-4">{event.description}</div>
            )}
            {/* LOGIN FORM */}
            {!participantLoaded && (
              <form className="space-y-3" onSubmit={handleLoad} autoComplete="off">
                <div>
                  <label className="block font-medium text-sm mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white/60"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-sm mb-1">
                    Password <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white/60"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    If you don’t set a password, anyone with this link can modify your availability using your name.<br />
                    If you use a password, only you can edit your availability for this event.<br />
                    <b>Password cannot be recovered if lost.</b>
                  </div>
                </div>
                <button
                  className="w-full mt-2 py-2 rounded-lg border border-blue-300 text-blue-800 bg-white/70 font-medium hover:bg-blue-50 transition"
                  type="submit"
                >
                  Load
                </button>
                {loadError && (
                  <div className="text-sm text-red-600 text-center">{loadError}</div>
                )}
              </form>
            )}

            {/* AVAILABILITY GRID: always visible below login */}
            <div className="mt-6">
              <AvailabilityGrid
                event={event}
                allAvailabilities={allAvailabilities}
                participantAvailability={participantLoaded ? availability : []}
                onChange={participantLoaded ? setAvailability : undefined}
                readOnly={!participantLoaded}
              />
            </div>

            {/* SUBMIT BUTTON: only if logged in */}
            {participantLoaded && (
              <div className="flex justify-center">
                <button
                  className="mt-4 w-4/5 max-w-md px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
                  onClick={handleSubmit}
                  disabled={availability.length === 0}
                >
                  Submit Availability
                </button>
              </div>
            )}
            {submitStatus && (
              <div className="mt-2 text-sm text-blue-700 text-center">{submitStatus}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
