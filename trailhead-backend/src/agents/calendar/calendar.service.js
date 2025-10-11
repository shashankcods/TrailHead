// src/agents/calendar/calendar.service.js
import { createEvents } from "ics";
import fs from "fs";
import path from "path";

export const generateCalendar = async (destination, startDate, endDate) => {
  try {
    if (!startDate || !endDate) throw new Error("Missing start or end date");

    const start = new Date(startDate);
    const end = new Date(endDate);
    const events = [];

    // Loop over each trip day
    let current = new Date(start);
    let day = 1;

    while (current <= end) {
      const dateArray = [
        current.getFullYear(),
        current.getMonth() + 1,
        current.getDate(),
      ];

      events.push({
        start: dateArray,
        title: `Day ${day} - ${destination || "Trip"}`,
        description: `Activities for Day ${day} in ${destination || "your destination"}`,
        duration: { hours: 24 },
      });

      current.setDate(current.getDate() + 1);
      day++;
    }

    const { error, value } = createEvents(events);
    if (error) throw new Error(error);

    // Ensure folder exists
    const folder = "calendar_files";
    fs.mkdirSync(folder, { recursive: true });

    // Create safe filename
    const safeName = (destination || "trip").replace(/\s+/g, "_");
    const fileName = `${safeName}.ics`;
    const filePath = path.join(folder, fileName);

    fs.writeFileSync(filePath, value);

    // Construct public download link
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const downloadUrl = `${baseUrl}/${folder}/${fileName}`;

    return {
      summary: "Calendar file generated successfully",
      fileName,
      downloadUrl,
    };
  } catch (error) {
    console.error("Calendar Service Error:", error.message);
    throw new Error("Failed to generate calendar");
  }
};
