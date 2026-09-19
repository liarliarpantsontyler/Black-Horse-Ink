#!/usr/bin/env node
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const BATCH = path.join(import.meta.dirname, "ig-import-batch.json");
const OVERRIDES_PATH = path.join(ROOT, "src/content/portfolio.overrides.json");

function tagFromArtist(artistId) {
  if (artistId === "lucia") return ["fine-line", "small"];
  if (artistId === "juan") return ["small", "medium"];
  return ["large", "medium"];
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(buf)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(dest);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(BATCH, "utf8"));
  const overrides = fs.existsSync(OVERRIDES_PATH)
    ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"))
    : {};
  const portfolio = [];

  for (const artist of data.artists) {
    const portraitDest = path.join(
      ROOT,
      "public/images/artists",
      `${artist.slug}-portrait.jpg`,
    );
    try {
      await download(artist.avatar, portraitDest);
      console.log(`Portrait: ${artist.slug}`);
    } catch (e) {
      console.warn(`Portrait failed ${artist.slug}:`, e.message);
    }

    for (let i = 0; i < artist.posts.length; i++) {
      const post = artist.posts[i];
      const id = `${artist.artistId}-ig-${post.shortcode}`;
      const rel = `/images/portfolio/${artist.slug}/${post.shortcode}.jpg`;
      const dest = path.join(ROOT, "public", rel);
      try {
        await download(post.url, dest);
        console.log(`  ${rel}`);
      } catch (e) {
        console.error(`  skip ${id}:`, e.message);
        continue;
      }
      const override = overrides[id] ?? {};
      portfolio.push({
        id,
        image: rel,
        alt: override.alt ?? post.alt,
        artistId: artist.artistId,
        tags: override.tags ?? tagFromArtist(artist.artistId),
        featured: override.featured ?? i < 2,
      });
    }
  }

  if (data.heroUrl) {
    try {
      await download(data.heroUrl, path.join(ROOT, "public/images/hero.jpg"));
      console.log("Hero updated");
    } catch (e) {
      console.warn("Hero download failed:", e.message);
    }
  }

  const outPath = path.join(ROOT, "src/content/portfolio.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(portfolio, null, 2));
  console.log(`\nWrote ${portfolio.length} portfolio items.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
