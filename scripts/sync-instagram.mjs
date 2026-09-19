#!/usr/bin/env node
/**
 * Sync recent Instagram posts into public/images and portfolio.generated.json
 *
 * Requires INSTAGRAM_SESSION_ID cookie (sessionid) for reliable downloads.
 * See scripts/README.md
 */
import fs from "fs";
import path from "path";

const PROFILES = [
  { artistId: "lucia", slug: "lucia", handle: "inkbylucia", name: "Lucia" },
  { artistId: "juan", slug: "juan", handle: "juzertattoo", name: "Juan" },
  { artistId: "marcos", slug: "marcos", handle: "cacoink", name: "Marcos" },
];

const POSTS_PER_PROFILE = 8;
const ROOT = path.resolve(import.meta.dirname, "..");
const OVERRIDES_PATH = path.join(ROOT, "src/content/portfolio.overrides.json");

function tagFromCaption(caption, artistId) {
  const c = (caption ?? "").toLowerCase();
  const tags = new Set();
  if (/fine.?line|minimal|delicate|single.?needle/.test(c)) tags.add("fine-line");
  if (/small|tiny|micro|minimal/.test(c)) tags.add("small");
  if (/medium|half.?sleeve/.test(c)) tags.add("medium");
  if (/large|sleeve|back.?piece|full/.test(c)) tags.add("large");
  if (!tags.size) {
    if (artistId === "lucia") tags.add("fine-line");
    if (artistId === "juan") tags.add("small");
    if (artistId === "marcos") tags.add("large");
  }
  if (tags.has("fine-line") && !tags.has("small")) tags.add("small");
  return [...tags];
}

async function fetchProfilePosts(handle, sessionId) {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${handle}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "X-IG-App-ID": "936619743392459",
      ...(sessionId ? { Cookie: `sessionid=${sessionId}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Instagram API ${res.status} for @${handle}`);
  }
  const json = await res.json();
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
  return edges.slice(0, POSTS_PER_PROFILE).map((edge) => {
    const node = edge.node;
    const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";
    const imageUrl = node.display_url;
    const shortcode = node.shortcode;
    return { caption, imageUrl, shortcode };
  });
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

async function main() {
  const sessionId = process.env.INSTAGRAM_SESSION_ID;
  if (!sessionId) {
    console.warn("INSTAGRAM_SESSION_ID not set — sync may fail for private rate limits.");
  }

  const overrides = fs.existsSync(OVERRIDES_PATH)
    ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))
    : {};

  const portfolio = [];

  for (const profile of PROFILES) {
    console.log(`Fetching @${profile.handle}…`);
    let posts = [];
    try {
      posts = await fetchProfilePosts(profile.handle, sessionId);
    } catch (e) {
      console.error(e.message);
      continue;
    }

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const id = `${profile.artistId}-ig-${post.shortcode}`;
      const rel = `/images/portfolio/${profile.slug}/${post.shortcode}.jpg`;
      const dest = path.join(ROOT, "public", rel);
      try {
        await download(post.imageUrl, dest);
      } catch (e) {
        console.error(`Skip ${id}:`, e.message);
        continue;
      }

      const override = overrides[id] ?? {};
      portfolio.push({
        id,
        image: rel,
        alt: override.alt ?? `Tattoo work by ${profile.name}`,
        artistId: profile.artistId,
        tags: override.tags ?? tagFromCaption(post.caption, profile.artistId),
        featured: override.featured ?? i < 2,
      });
    }

    const portraitSrc = posts[0]?.imageUrl;
    if (portraitSrc) {
      const portraitDest = path.join(
        ROOT,
        "public/images/artists",
        `${profile.slug}-portrait.jpg`,
      );
      try {
        await download(portraitSrc, portraitDest);
        console.log(`Portrait updated: ${profile.slug}`);
      } catch {
        /* keep existing portrait */
      }
    }
  }

  const outPath = path.join(ROOT, "src/content/portfolio.generated.json");
  if (!portfolio.length) {
    console.error("No posts downloaded — keeping existing portfolio.generated.json");
    process.exit(1);
  }
  fs.writeFileSync(outPath, JSON.stringify(portfolio, null, 2));
  console.log(`Wrote ${portfolio.length} items to portfolio.generated.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
