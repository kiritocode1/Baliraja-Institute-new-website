import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.longName,
    short_name: site.name,
    description:
      "Competitive exam coaching in Gangapur for defence, civil services, banking, SSC, police and local government exams.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7efe1",
    theme_color: "#531c21",
    categories: ["education"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
