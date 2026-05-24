export const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const parts = time.split(":");

  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
  const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");

  return `${hrs}:${mins}`;
};

export const addMinutes = (time, minutesToAdd) => {
  const base = timeToMinutes(time);

  if (base === null) {
    return null;
  }

  return minutesToTime(base + minutesToAdd);
};
