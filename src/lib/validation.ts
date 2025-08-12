const req = (v: any, msg: string) => {
  if (!v) throw new Error(msg);
  return v;
};
export const validatePain = (d: any) => {
  const { intensity, location, description, timestamp } = d;
  req(intensity >= 0 && intensity <= 10, 'Pain intensity must be 0-10');
  req(location?.length >= 1 && location?.length <= 100, 'Location required (1-100 chars)');
  req(description?.length >= 1 && description?.length <= 500, 'Description required (1-500 chars)');
  req(timestamp && new Date(timestamp).getTime(), 'Valid timestamp required');
  return {
    intensity: +intensity,
    location: String(location).trim(),
    description: String(description).trim(),
    timestamp: new Date(timestamp).toISOString(),
  };
};
