"use client";

import { useEffect, useState } from "react";
import { MapPin, Lock, AlertTriangle } from "lucide-react";

// ── Restaurant location boundary ────────────────────────────────────────
// How to get your coordinates: open Google Maps, find your restaurant,
// right-click the exact spot -> click the "lat, lng" numbers that appear
// at the top of the menu to copy them. Paste the two numbers in below.
const RESTAURANT_LAT = 21.3697513; // TODO: replace with your restaurant's latitude
const RESTAURANT_LNG = 80.3771933; // TODO: replace with your restaurant's longitude

// How close someone has to be (in meters) for the menu to unlock.
// GPS is rarely exact, especially indoors — 150-250m is a sane starting
// point. Go too tight (e.g. 20m) and real customers inside the building
// may get rejected because their GPS fix is slightly off.
const ALLOWED_RADIUS_METERS = 150;
// ──────────────────────────────────────────────────────────────────────

type Status =
  | "idle" // waiting for the visitor to tap "Share Location"
  | "checking"
  | "allowed"
  | "too-far"
  | "permission-denied"
  | "unsupported"
  | "error";

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LocationGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [distance, setDistance] = useState<number | null>(null);

  // The actual permission request — this is what makes the browser show
  // its native "Allow this site to use your location?" popup (same family
  // of prompt as camera/mic). Calling it from inside a button's onClick is
  // what makes that popup reliably appear on every device, including
  // iOS Safari and the in-app browsers inside WhatsApp/Instagram/QR-scanner
  // apps — those commonly swallow permission requests that aren't tied to
  // a direct tap.
  const requestLocation = () => {
    setStatus("checking");

    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = distanceInMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          RESTAURANT_LAT,
          RESTAURANT_LNG
        );
        setDistance(d);
        setStatus(d <= ALLOWED_RADIUS_METERS ? "allowed" : "too-far");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "permission-denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // On return visits, if the browser already remembers "granted" for this
  // site, skip straight to checking — no popup needed, and none will show.
  // (Safari doesn't support this query; it just falls through to "idle" and
  // shows the tap-to-share screen, which works everywhere regardless.)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (result.state === "granted") requestLocation();
        })
        .catch(() => {
          /* Permissions API not supported for geolocation — stay on "idle" */
        });
    }
  }, []);

  if (status === "allowed") {
    return <>{children}</>;
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 text-center"
      style={{ background: "#fdf6ec", color: "#1a120b" }}
    >
      <div className="max-w-sm">
        {status === "idle" && (
          <>
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full grid place-items-center"
              style={{ background: "rgba(193,68,14,0.1)" }}
            >
              <MapPin size={28} style={{ color: "#c1440e" }} />
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
              This menu needs your location
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(26,18,11,0.6)" }}>
              It only unlocks while you&apos;re at the restaurant. Your browser will ask you
              to confirm — tap &quot;Allow&quot; on that prompt.
              We added this for our safety, and apologise for any inconvience caused.
            </p>
            <button
              onClick={requestLocation}
              className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full text-white"
              style={{ background: "#c1440e" }}
            >
              <MapPin size={16} /> Share My Location
            </button>
          </>
        )}

        {status === "checking" && (
          <>
            <div
              className="w-12 h-12 mx-auto mb-5 rounded-full border-4 animate-spin"
              style={{ borderColor: "rgba(193,68,14,0.15)", borderTopColor: "#c1440e" }}
            />
            <p className="font-semibold text-lg">Finding your location…</p>
            <p className="text-sm mt-2" style={{ color: "rgba(26,18,11,0.6)" }}>
              This menu is only available on-site.
            </p>
          </>
        )}

        {status === "too-far" && (
          <>
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full grid place-items-center"
              style={{ background: "rgba(193,68,14,0.1)" }}
            >
              <MapPin size={28} style={{ color: "#c1440e" }} />
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
              You&apos;re not at the restaurant
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(26,18,11,0.6)" }}>
              This menu only works within the restaurant. This is for our safety, Thank you for understanding.
              {distance !== null && ` — you're about ${Math.round(distance)}m away`}.
            </p>
            <button
              onClick={requestLocation}
              className="font-semibold text-sm px-5 py-2.5 rounded-full text-white"
              style={{ background: "#c1440e" }}
            >
              Check again
            </button>
          </>
        )}

        {status === "permission-denied" && (
          <>
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full grid place-items-center"
              style={{ background: "rgba(193,68,14,0.1)" }}
            >
              <Lock size={28} style={{ color: "#c1440e" }} />
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
              Location access needed
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(26,18,11,0.6)" }}>
              You&apos;ll need to allow location access for this site in your browser
              settings, then try again. This is for our safety, thank you for understanding.
            </p>
            <button
              onClick={requestLocation}
              className="font-semibold text-sm px-5 py-2.5 rounded-full text-white"
              style={{ background: "#c1440e" }}
            >
              Try again
            </button>
            <p className="text-sm mb-6" style={{ color: "rgba(26,18,11,0.6)" }}>If this doesn&apos;t work, please refresh the site.</p>
          </>
        )}

        {(status === "unsupported" || status === "error") && (
          <>
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full grid place-items-center"
              style={{ background: "rgba(193,68,14,0.1)" }}
            >
              <AlertTriangle size={28} style={{ color: "#c1440e" }} />
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
              Couldn&apos;t check your location
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(26,18,11,0.6)" }}>
              {status === "unsupported"
                ? "Your browser doesn't support location access."
                : "Something went wrong getting your location."}
            </p>
            <button
              onClick={requestLocation}
              className="font-semibold text-sm px-5 py-2.5 rounded-full text-white"
              style={{ background: "#c1440e" }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </main>
  );
}
