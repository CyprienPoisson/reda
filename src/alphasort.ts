export default function alphasort(a: string, b: string): number {
  return a.localeCompare(b, "fr", {
    ignorePunctuation: true,
    numeric: true,
    sensitivity: "base",
  });
}
