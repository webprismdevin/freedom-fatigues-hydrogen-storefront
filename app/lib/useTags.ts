export default function useTags(tags: string[], tagToFind: string) {
  const tagFound = tags.some((tag) => tag === tagToFind);

  return tagFound;
}
