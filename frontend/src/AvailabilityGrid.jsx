import React from "react";
import { format, isAfter } from "date-fns";
import clsx from "clsx";

// Helper: generate time slots between two times (e.g., 09:00–17:00, step 30)
function generateTimeSlots(from, to, stepMinutes) {
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  const startMinutes = fromH * 60 + fromM;
  const endMinutes = toH * 60 + toM;
  const slots = [];
  for (let mins = startMinutes; mins < endMinutes; mins += stepMinutes) {
    const hour = Math.floor(mins / 60).toString().padStart(2, "0");
    const min = (mins % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${min}`);
  }
  return slots;
}

// Helper: generate all dates in [start, end] inclusive
function generateDateRange(start, end) {
  const dates = [];
  let d = new Date(start);
  end = new Date(end);
  while (!isAfter(d, end)) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// Helper: slot key (date + time)
function slotKey(date, time) {
  return `${format(date, "yyyy-MM-dd")}|${time}`;
}

export default function AvailabilityGrid({
  event,
  participantAvailability,
  allAvailabilities,
  onChange,
  readOnly = false,
}) {
  const dates = generateDateRange(event.date_range.start, event.date_range.end);
  const times = generateTimeSlots(
    event.time_range.from,
    event.time_range.to,
    event.time_step_minutes
  );

  const ownSlots = new Set(participantAvailability || []);
  const slotToNames = {};
  for (const { name, availability } of allAvailabilities) {
    for (const slot of availability || []) {
      if (!slotToNames[slot]) slotToNames[slot] = [];
      slotToNames[slot].push(name);
    }
  }

  // Toggle function (add or remove slot)
  const toggleSlot = slot =>
    onChange &&
    onChange(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );

  const maxTotal = Math.max(
    0,
    ...Object.values(slotToNames).map(names => names.length)
  );

  return (
    <div className="overflow-x-auto max-w-4xl mx-auto mt-2 select-none">
      <table className="table-fixed border-separate border-spacing-0 w-full rounded-xl bg-white shadow">
        <thead>
          <tr>
            <th className="sticky left-0 w-[60px] z-10 border-b py-0.5 px-1 text-xs font-medium text-blue-900 bg-blue-50 text-left whitespace-nowrap">
              Time
            </th>
            {dates.map((date, i) => (
              <th
                key={format(date, "yyyy-MM-dd")}
                className={clsx(
                  "w-[90px] text-center border-b py-0.5 px-1 text-xs font-medium text-blue-900 bg-blue-50 whitespace-nowrap",
                  i === dates.length - 1 && "rounded-tr-xl"
                )}
              >
                {format(date, "EEE dd/MM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time, rowIdx) => (
            <tr key={time} className={rowIdx % 2 === 1 ? "bg-blue-50/30" : ""}>
              <td className="sticky left-0 w-[60px] z-10 text-xs py-0.5 pl-1 pr-0 text-gray-500 bg-blue-50 whitespace-nowrap">
                {time}
              </td>
              {dates.map((date) => {
                const slot = slotKey(date, time);
                const userHas = ownSlots.has(slot);
                const total = (slotToNames[slot] || []).length;
                return (
                  <td key={slot} className="w-[90px] py-0.5 px-0">
                    <div className="flex h-8 rounded border border-gray-200 shadow-sm bg-white group overflow-hidden select-none">
                      {/* Left: User availability (green when selected) */}
                      <div
                        className={clsx(
                          "flex-1 flex items-center justify-center text-base transition rounded-l select-none",
                          userHas
                            ? "bg-green-400/90 text-white"
                            : "bg-gray-100 text-gray-400",
                          readOnly
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:bg-green-100"
                        )}
                        onClick={
                          readOnly
                            ? undefined
                            : () => toggleSlot(slot)
                        }
                        title={
                          readOnly
                            ? "Log in to select your availability"
                            : userHas
                            ? "You are available"
                            : "Click to select"
                        }
                        style={{ minWidth: 0, minHeight: 0, userSelect: "none" }}
                      >
                        {userHas ? "✔" : ""}
                      </div>
                      {/* Right: Group availability (blue, count, names on hover) */}
                      <div
                        className={clsx(
                          "flex-1 flex items-center justify-center text-xs transition cursor-default relative group rounded-r select-none",
                          total > 0
                            ? "bg-blue-200/90 text-blue-800"
                            : "bg-gray-50 text-gray-300",
                          total === maxTotal && maxTotal > 0 && "ring-2 ring-amber-400"
                        )}
                        title={
                          total > 0
                            ? "Available: " + slotToNames[slot].join(", ")
                            : "No one available"
                        }
                        style={{ minWidth: 0, minHeight: 0, userSelect: "none" }}
                      >
                        {total > 0 ? (
                          <span className="flex items-center gap-1">
                            {total}
                            {total === maxTotal && maxTotal > 0 && (
                              <span
                                role="img"
                                aria-label="most participants"
                                className="ml-1 text-amber-500 text-lg"
                              >
                                👑
                              </span>
                            )}
                          </span>
                        ) : ""}
                        {total > 0 && (
                          <span className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 bg-white shadow border rounded text-xs p-1 min-w-[80px] opacity-0 group-hover:opacity-100 transition pointer-events-none">
                            {slotToNames[slot].join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-400 mt-2 text-center">
        <b>Left:</b> Your selection. <b>Right:</b> Number of people available, names on hover.
        <br />
        {readOnly && (
          <span>
            <b>Log in above to select or update your own availability.</b>
          </span>
        )}
      </div>
    </div>
  );
}
