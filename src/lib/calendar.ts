/**
 * Google Calendar integration for autonomous call booking.
 *
 * Env vars required:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *   GOOGLE_CALENDAR_ID  (optional, defaults to "primary")
 *
 * Slot rules:
 *   - Mon, Wed, Fri only
 *   - Window: 10:00am to 5:00pm London time
 *   - Call duration: 30 minutes
 *   - Slot interval: every 30 minutes (10:00, 10:30, 11:00, ...)
 *   - Buffer: if an existing event ends at X, no slot offered before X + 1hr
 *   - Max 3 slots returned across the lookahead window
 */

const TIMEZONE = "Europe/London";
const WINDOW_START_HOUR = 10;  // 10:00am
const WINDOW_END_HOUR = 17;    // 5:00pm — last slot must end by this
const CALL_DURATION_MINS = 30;
const BUFFER_MINS = 60;        // gap required after any existing meeting
const SLOT_INTERVAL_MINS = 30; // candidate slots every 30 minutes
const ALLOWED_DAYS = [1, 3, 5]; // Mon=1, Wed=3, Fri=5
const LOOKAHEAD_DAYS = 14;
const MAX_SLOTS = 3;

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Auth ───────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`Google auth failed: ${data.error ?? "unknown"}`);
  }
  return data.access_token;
}

// ── Timezone helpers ───────────────────────────────────────────────────────────

/**
 * Returns the UTC offset in hours for Europe/London on the given date.
 * Returns 1 during BST (late Mar to late Oct), 0 otherwise.
 */
function getLondonUTCOffset(date: Date): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0");
  const londonAsUTC = Date.UTC(
    get("year"), get("month") - 1, get("day"),
    get("hour"), get("minute"), get("second")
  );
  return Math.round((londonAsUTC - date.getTime()) / 3_600_000);
}

/**
 * Given a calendar date and a time in London minutes-from-midnight,
 * returns the UTC Date and a display string for that slot.
 */
function buildSlot(
  date: Date,
  startMins: number
): {
  startUTC: Date;
  endUTC: Date;
  isoLocal: string;
  display: string;
} {
  const offset = getLondonUTCOffset(date);
  const tzLabel = offset === 1 ? "BST" : "GMT";

  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(Math.floor(startMins / 60)).padStart(2, "0");
  const m = String(startMins % 60).padStart(2, "0");
  const isoLocal = `${y}-${mo}-${d}T${h}:${m}:00`;

  const offsetSign = offset >= 0 ? "+" : "-";
  const offsetStr = `${offsetSign}${String(Math.abs(offset)).padStart(2, "0")}:00`;
  const startUTC = new Date(`${isoLocal}${offsetStr}`);
  const endUTC = new Date(startUTC.getTime() + CALL_DURATION_MINS * 60_000);

  const endMins = startMins + CALL_DURATION_MINS;
  const endH = Math.floor(endMins / 60);
  const endM = String(endMins % 60).padStart(2, "0");
  const startH = Math.floor(startMins / 60);
  const startM = String(startMins % 60).padStart(2, "0");

  const display = `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${
    MONTH_NAMES[date.getMonth()]
  }, ${startH}:${startM} to ${endH}:${endM} ${tzLabel}`;

  return { startUTC, endUTC, isoLocal, display };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface CalendarSlot {
  display: string;  // "Monday 21 April, 10:00 to 10:30 BST"
  isoLocal: string; // "2026-04-21T10:00:00" — used as ref in confirm_booking
}

export async function getAvailableSlots(): Promise<CalendarSlot[]> {
  const token = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  // Candidate days: next LOOKAHEAD_DAYS days, Mon/Wed/Fri only
  const now = new Date();
  const candidateDays: Date[] = [];

  for (let i = 1; i <= LOOKAHEAD_DAYS; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const londonDay = new Date(
      d.toLocaleString("en-US", { timeZone: TIMEZONE })
    ).getDay();
    if (ALLOWED_DAYS.includes(londonDay)) {
      candidateDays.push(d);
    }
  }

  // Fetch free/busy for the whole lookahead window
  const timeMin = now.toISOString();
  const timeMax = new Date(
    now.getTime() + (LOOKAHEAD_DAYS + 1) * 86_400_000
  ).toISOString();

  const fbRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: TIMEZONE,
      items: [{ id: calendarId }],
    }),
  });

  const fbData = (await fbRes.json()) as {
    calendars?: Record<
      string,
      { busy?: { start: string; end: string }[] }
    >;
  };

  const busyPeriods = (fbData.calendars?.[calendarId]?.busy ?? []).map(
    ({ start, end }) => ({
      start: new Date(start).getTime(),
      end: new Date(end).getTime(),
    })
  );

  const available: CalendarSlot[] = [];

  outer: for (const date of candidateDays) {
    if (available.length >= MAX_SLOTS) break;

    // Generate all candidate slots for this day within the window
    // e.g. 10:00, 10:30, 11:00 ... up to the last slot that ends by 17:00
    const windowStartMins = WINDOW_START_HOUR * 60;
    const windowEndMins = WINDOW_END_HOUR * 60;

    for (
      let slotStart = windowStartMins;
      slotStart + CALL_DURATION_MINS <= windowEndMins;
      slotStart += SLOT_INTERVAL_MINS
    ) {
      if (available.length >= MAX_SLOTS) break outer;

      const { startUTC, endUTC, isoLocal, display } = buildSlot(date, slotStart);

      // Skip slots in the past (edge case: today is a candidate day)
      if (startUTC.getTime() <= now.getTime()) continue;

      // Check 1: does this slot overlap any busy period?
      const overlaps = busyPeriods.some(
        ({ start, end }) =>
          startUTC.getTime() < end && endUTC.getTime() > start
      );
      if (overlaps) continue;

      // Check 2: is there a busy period that ends within BUFFER_MINS before this slot?
      // i.e. something ends between (slotStart - buffer) and slotStart
      const bufferWindowStart = startUTC.getTime() - BUFFER_MINS * 60_000;
      const tooSoonAfterMeeting = busyPeriods.some(
        ({ end }) => end > bufferWindowStart && end <= startUTC.getTime()
      );
      if (tooSoonAfterMeeting) continue;

      available.push({ display, isoLocal });
      // Once we find one valid slot per day, move to the next day
      // so we spread slots across different days rather than
      // offering three slots on the same Monday
      break;
    }
  }

  return available;
}

export async function createCalendarEvent(params: {
  isoLocal: string;
  attendeeEmail: string;
  attendeeName: string;
  company: string;
  role: string;
}): Promise<void> {
  const token = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const yourEmail = process.env.GOOGLE_CALENDAR_ID ?? "feruza97k@gmail.com";

  // Parse isoLocal to compute end time correctly
  // isoLocal is like "2026-04-21T10:00:00" — local London time, no offset
  // We need to get the London offset for that specific date to convert correctly
  const localDate = new Date(params.isoLocal + "Z"); // temporary UTC parse for arithmetic
  const endIsoLocal = new Date(localDate.getTime() + CALL_DURATION_MINS * 60_000)
    .toISOString()
    .slice(0, 19)
    .replace("Z", "");

  const event = {
    summary: `Call: ${params.attendeeName} / ${params.company}`,
    description: `Role: ${params.role}\n\nBooked via feruza.dev portfolio agent.`,
    start: { dateTime: params.isoLocal, timeZone: TIMEZONE },
    end: { dateTime: endIsoLocal, timeZone: TIMEZONE },
    attendees: [
      // Recruiter gets the invite email
      { email: params.attendeeEmail, displayName: params.attendeeName },
      // You are explicitly added so you also receive the invite email
      { email: yourEmail, displayName: "Feruza Kachkinbayeva" },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 15 },
      ],
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = (await res.json()) as unknown;
    throw new Error(`Calendar event creation failed: ${JSON.stringify(err)}`);
  }
}

/** Returns true if Google Calendar env vars are configured. */
export function isCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}
