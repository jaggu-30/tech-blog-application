import { chromium } from 'playwright';
import { mkdir, readdir, rename, rm } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const BASE = 'http://127.0.0.1:8765';
const OUT_DIR = join(process.cwd(), 'video-output');
const FINAL_VIDEO = join(process.cwd(), 'assets', 'inkly_linkedin_walkthrough.mp4');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, distance, steps = 24) {
  const step = distance / steps;
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, step);
    await sleep(40);
  }
}

async function runWalkthrough(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('inklyUser');
    localStorage.removeItem('inklyPosts');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(1800);

  // Homepage hero
  await smoothScroll(page, 420);
  await sleep(1200);

  // Featured stories
  await smoothScroll(page, 520);
  await sleep(1600);

  // Join banner + footer
  await smoothScroll(page, 700);
  await sleep(1400);

  // Explore
  await page.click('[data-page="explore"]');
  await sleep(1200);
  await smoothScroll(page, 500);
  await sleep(1000);

  // Filter by category
  const filter = page.locator('.filter-btn').nth(1);
  if (await filter.count()) {
    await filter.click();
    await sleep(900);
  }

  // Open a story from explore grid
  const exploreCard = page.locator('#explore-grid .post-card').first();
  await exploreCard.scrollIntoViewIfNeeded();
  await sleep(500);
  await exploreCard.click();
  await sleep(1800);
  await smoothScroll(page, 450);
  await sleep(1200);
  await page.click('#btn-post-back');
  await sleep(800);

  // Register flow
  await page.click('#btn-register-header');
  await sleep(1000);
  await page.fill('#register-name', 'Alex Morgan');
  await sleep(400);
  await page.fill('#register-email', 'alex@inkly.dev');
  await sleep(400);
  await page.fill('#register-password', 'inkly123');
  await sleep(600);
  await page.click('#btn-register-submit');
  await sleep(1600);

  // Dashboard
  await page.click('[data-page="dashboard"]');
  await sleep(1400);
  await smoothScroll(page, 350);
  await sleep(1000);

  // Create and publish a story
  await page.click('#btn-write-story');
  await sleep(1000);
  await page.fill('#post-title', 'Building Inkly: A responsive blog in vanilla JS');
  await sleep(500);
  await page.fill('#post-category', 'Frontend');
  await sleep(400);
  await page.fill(
    '#post-content',
    'Inkly is a front-end blog platform with login, dashboard, and publish flows. It uses HTML, CSS, and JavaScript with local storage so drafts and posts persist in the browser.'
  );
  await sleep(900);
  await smoothScroll(page, 180);
  await sleep(700);
  await page.click('#btn-publish');
  await sleep(1800);

  // Dashboard shows the published story
  await smoothScroll(page, 300);
  await sleep(1200);

  // Back to home to show the app landing
  await page.click('[data-page="home"]');
  await sleep(1200);
  await smoothScroll(page, 500);
  await sleep(1400);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(1200);
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(join(process.cwd(), 'assets'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  await runWalkthrough(page);

  await context.close();
  await browser.close();

  const files = await readdir(OUT_DIR);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No recorded video found');

  const rawPath = join(OUT_DIR, webm);
  const tempMp4 = join(OUT_DIR, 'walkthrough.mp4');

  execSync(
    `ffmpeg -y -i "${rawPath}" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart "${tempMp4}"`,
    { stdio: 'inherit' }
  );

  await rename(tempMp4, FINAL_VIDEO);
  await rm(OUT_DIR, { recursive: true, force: true });

  const probe = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${FINAL_VIDEO}"`,
    { encoding: 'utf8' }
  ).trim();

  console.log(`\nVideo saved: ${FINAL_VIDEO}`);
  console.log(`Duration: ${Number(probe).toFixed(1)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
