// =========================
// Timed Service Wrapper
// =========================

export const timedServiceCall = async (label, fn) => {
  console.time(label);

  try {
    const result = await fn();
    console.timeEnd(label);
    return result;
  } catch (error) {
    console.timeEnd(label);
    console.error(`${label} failed:`, error.message);
    throw error;
  }
};
