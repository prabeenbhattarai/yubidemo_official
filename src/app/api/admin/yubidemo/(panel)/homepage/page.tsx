import Flash from "@/components/admin/Flash";
import ImageUploader from "@/components/admin/ImageUploader";
import { getHome } from "@/lib/content";
import { saveHomeAction } from "../../actions";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="a-card p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-wide text-brand">{title}</legend>
      <div className="grid gap-5">{children}</div>
    </fieldset>
  );
}

function Text({ name, label, def }: { name: string; label: string; def: string }) {
  return (
    <div className="a-field">
      <label className="a-label">{label}</label>
      <input name={name} defaultValue={def} className="a-input" />
    </div>
  );
}

function Area({ name, label, def }: { name: string; label: string; def: string }) {
  return (
    <div className="a-field">
      <label className="a-label">{label}</label>
      <textarea name={name} defaultValue={def} className="a-textarea" />
    </div>
  );
}

export default async function HomepageAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [home, sp] = await Promise.all([getHome(), searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Homepage Content
      </h1>
      <p className="mt-1 text-muted">Edit every text block and image on the home page.</p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} />
        <form action={saveHomeAction} className="grid gap-6">
          <Group title="Hero">
            <Text name="heroTitle" label="Title" def={home.heroTitle} />
            <Area name="heroSubtitle" label="Subtitle" def={home.heroSubtitle} />
            <ImageUploader name="heroImage" defaultValue={home.heroImage} folder="home" label="Hero background image (optional)" />
            <Text name="responseTitle" label="Response card title" def={home.responseTitle} />
            <Area name="responseText" label="Response card text" def={home.responseText} />
          </Group>

          <Group title="About & Mission">
            <Text name="aboutTitle" label="About title" def={home.aboutTitle} />
            <Area name="aboutP1" label="About paragraph 1" def={home.aboutP1} />
            <Area name="aboutP2" label="About paragraph 2" def={home.aboutP2} />
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid gap-2 rounded border border-gray-100 p-3">
                  <Text name={`stat${i}value`} label={`Stat ${i + 1} value`} def={home.stats[i]?.value ?? ""} />
                  <Text name={`stat${i}label`} label={`Stat ${i + 1} label`} def={home.stats[i]?.label ?? ""} />
                </div>
              ))}
            </div>
            <Area name="missionText" label="Mission text" def={home.missionText} />
            <Area name="visionText" label="Vision text" def={home.visionText} />
          </Group>

          <Group title="Services section">
            <Text name="servicesTitle" label="Section title" def={home.servicesTitle} />
            <Text name="servicesSubtitle" label="Section subtitle" def={home.servicesSubtitle} />
          </Group>

          <Group title="Why Choose Us">
            <Text name="whyTitle" label="Title" def={home.whyTitle} />
            <Area name="whySubtitle" label="Subtitle" def={home.whySubtitle} />
            <Area name="whyPoints" label="Points (one per line)" def={home.whyPoints.join("\n")} />
            <ImageUploader name="whyImage" defaultValue={home.whyImage} folder="home" label="Why-us image (optional)" />
          </Group>

          <Group title="Sustainability">
            <Text name="sustainEyebrow" label="Eyebrow" def={home.sustainEyebrow} />
            <Text name="sustainTitle" label="Title" def={home.sustainTitle} />
            <Area name="sustainText" label="Text" def={home.sustainText} />
            <ImageUploader name="sustainImage" defaultValue={home.sustainImage} folder="home" label="Sustainability image (optional)" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid gap-2 rounded border border-gray-100 p-3">
                  <Text name={`safety${i}title`} label={`Card ${i + 1} title`} def={home.safetyCards[i]?.title ?? ""} />
                  <Area name={`safety${i}text`} label={`Card ${i + 1} text`} def={home.safetyCards[i]?.text ?? ""} />
                </div>
              ))}
            </div>
          </Group>

          <Group title="Projects section">
            <Text name="projectsTitle" label="Title" def={home.projectsTitle} />
            <Area name="projectsText" label="Text" def={home.projectsText} />
          </Group>

          <div className="sticky bottom-4">
            <button className="a-btn a-btn-primary shadow-lg">Save all homepage content</button>
          </div>
        </form>
      </div>
    </div>
  );
}
