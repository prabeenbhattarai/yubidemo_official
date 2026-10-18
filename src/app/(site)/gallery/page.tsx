import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import GalleryBrowser from "@/components/GalleryBrowser";
import { getGallery, getGalleryFolders } from "@/lib/content";
import { buildFolders } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A look at Yubi Demolition projects, crews and equipment on site across NSW.",
};

export default async function GalleryPage() {
  const [gallery, folderList] = await Promise.all([getGallery(), getGalleryFolders()]);
  const folders = buildFolders(gallery, folderList);
  const hasPhotos = folders.length > 0;

  return (
    <>
      <PageBanner title="Gallery" />
      <section className="bg-[#fafafa] py-20 md:py-24">
        <div className="container-x">
          {hasPhotos ? (
            <GalleryBrowser folders={folders} />
          ) : (
            <p className="py-16 text-center text-muted">Photos are coming soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
