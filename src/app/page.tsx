import { Currently } from "@/components/sections/Currently";
import { TheWork } from "@/components/sections/TheWork";
import { HowIWork } from "@/components/sections/HowIWork";
import { FieldNotesPreview } from "@/components/sections/FieldNotesPreview";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 pb-8">
      <Currently />
      <TheWork />
      <HowIWork />
      <FieldNotesPreview />
    </main>
  );
}
