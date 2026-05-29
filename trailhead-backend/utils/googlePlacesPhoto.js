/**
 * Build a backend-proxied photo URL so the Google API key is never sent to the client.
 */
export const getPlacesPhotoProxyUrl = (photoReference) => {
  if (!photoReference || typeof photoReference !== "string") {
    return null;
  }

  return `/api/places/photo?reference=${encodeURIComponent(photoReference)}`;
};
