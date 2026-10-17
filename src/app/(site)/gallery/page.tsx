import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import { getGallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look at Yubi Demolition projects, crews and equipment on site across NSW.",
};

const tones = [
  "#6f7681", "#8a949e", "#7c8590", "#9aa3ad", "#727b86", "#868f9a",
  "#5f6570", "#94a0a9", "#6b7580", "#808a95", "#767f8a", "#8f99a3",
];

export default async function GalleryPage() {
  const images = await getGallery();

  return (
    <>
      <PageBanner title="Gallery" />
      <section className="bg-[#fafafa] py-20 md:py-24">
        <div className="container-x">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <div key={img.id ?? img.url} className="group relative aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-sm font-medium text-white">{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {tones.map((t, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden" style={{ background: t }}>
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent 0 14px, rgba(0,0,0,.18) 14px 15px)",
                      }}
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm font-medium text-white">Yubi on site #{i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-10 text-center text-sm text-muted">
                Upload your real site photos from the admin panel (Gallery) to replace these placeholders.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
