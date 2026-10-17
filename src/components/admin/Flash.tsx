export default function Flash({ saved, deleted }: { saved?: boolean; deleted?: boolean }) {
  if (!saved && !deleted) return null;
  return (
    <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
      {saved ? "✓ Changes saved successfully." : "✓ Item deleted."}
    </div>
  );
}
