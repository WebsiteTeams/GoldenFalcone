export type VideoEmbed = { kind: "iframe" | "video" | "link"; src: string };

/** Turns an admin-entered https link into something safe to embed. Anything unrecognised is shown as a plain link. */
export function videoEmbed(raw: string): VideoEmbed | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{6,20})/)?.[1];
    if (id && /^[\w-]{6,20}$/.test(id)) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (/^[\w-]{6,20}$/.test(id)) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/^\/(\d{5,12})/)?.[1];
    if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
  }
  if (/\.(mp4|webm)$/i.test(url.pathname)) return { kind: "video", src: url.toString() };
  return { kind: "link", src: url.toString() };
}
