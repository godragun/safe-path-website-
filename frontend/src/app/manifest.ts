import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "SafePath Command Center", short_name: "SafePath", description: "Offline-capable disaster response command center.", start_url: "/", display: "standalone", background_color: "#0b1017", theme_color: "#0b1017", icons: [{ src: "/file.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
