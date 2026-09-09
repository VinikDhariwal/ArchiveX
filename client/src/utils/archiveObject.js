/** Shared helpers for archive object records (API or local demo shape). */

export function getPrimaryImage(object) {
  if (!object?.images?.length) return null;
  return object.images.find((item) => item.type === 'hero') || object.images[0];
}

export function getSecondaryImage(object) {
  if (!object?.images?.length || object.images.length < 2) return null;
  return object.images.find((item) => item.type !== 'hero') || object.images[1];
}

export function getPublisher(object) {
  return object?.publisher || 'ArchiveX';
}
