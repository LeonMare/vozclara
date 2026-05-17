/**
 * One-shot deployment to Cloudflare:
 *   1. Deploy the transcript Worker, capture its URL.
 *   2. Write .env.production so the frontend hits that Worker.
 *   3. Build the frontend.
 *   4. Deploy the frontend to Cloudflare Pages.
 *
 * Pre-req (one time, manual): `npx wrangler login` in the project root.
 *
 * On success, prints the public URLs you can open on your phone.
 */
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const workerDir = resolve(repoRoot, 'worker');

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd ?? repoRoot,
      shell: true,
      stdio: opts.capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
      env: { ...process.env, ...(opts.env ?? {}) },
    });
    let stdout = '';
    let stderr = '';
    if (opts.capture) {
      child.stdout.on('data', (d) => {
        const s = d.toString();
        stdout += s;
        process.stdout.write(s);
      });
      child.stderr.on('data', (d) => {
        const s = d.toString();
        stderr += s;
        process.stderr.write(s);
      });
    }
    child.on('exit', (code) => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else rejectPromise(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
    });
  });
}

console.log('\n┌─ 1/4  Deploying Cloudflare Worker (transcript proxy) ──────');
const workerOut = await run('npx', ['wrangler', 'deploy'], { cwd: workerDir, capture: true });

// Wrangler prints something like: "Published vozclara-transcript ... (X.XX sec)
//                                    https://vozclara-transcript.<sub>.workers.dev"
const workerUrlMatch = workerOut.stdout.match(/https?:\/\/[\w.-]+\.workers\.dev/);
if (!workerUrlMatch) {
  console.error('\nCould not find Worker URL in wrangler output. Aborting.');
  process.exit(1);
}
const workerUrl = workerUrlMatch[0];
console.log(`\n└─ Worker URL: ${workerUrl}\n`);

// Same-origin mode: if wrangler.toml has an active [[routes]] block,
// the Worker is on the production domain (e.g. vozclara.app/api/*) and
//   • frontend calls /api/* same-origin → VITE_API_BASE stays empty
//   • the same host is the canonical site URL → derive VITE_SITE_URL
//     from the route's pattern instead of the pages.dev staging URL
// Without an active route, fall back to the workers.dev subdomain and
// keep the staging site URL.
const wranglerToml = await readFile(resolve(workerDir, 'wrangler.toml'), 'utf8');
const routePattern = wranglerToml
  .split(/^\s*#.*$/gm)
  .join('')
  .match(/\[\[routes\]\][\s\S]*?pattern\s*=\s*"([^"\/]+)\/api\/\*"/m);
const customHost = routePattern?.[1];
const apiBase = customHost ? '' : workerUrl;
const siteUrl = customHost ? `https://${customHost}` : 'https://vozclara.pages.dev';

console.log('┌─ 2/4  Updating .env.production (API/site only) ────────────');
// Preserve any other VITE_* keys (Sentry DSN, CF beacon token, etc.)
// — we only own VITE_API_BASE and VITE_SITE_URL here. Everything else
// is committed by the human and must survive the round-trip.
const envPath = resolve(repoRoot, '.env.production');
let existing = '';
try {
  existing = await readFile(envPath, 'utf8');
} catch {
  /* first-deploy: no file yet */
}
const stripped = existing
  .split('\n')
  .filter((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_API_BASE=')) return false;
    if (trimmed.startsWith('VITE_SITE_URL=')) return false;
    return true;
  })
  .join('\n')
  .trimEnd();
const next =
  (stripped ? stripped + '\n\n' : '') +
  `# API + site URL auto-written by scripts/deploy.mjs.\n` +
  `VITE_API_BASE=${apiBase}\nVITE_SITE_URL=${siteUrl}\n`;
await writeFile(envPath, next);
console.log(
  customHost
    ? `└─ wrote .env.production (same-origin on ${customHost})\n`
    : `└─ wrote .env.production (API at ${workerUrl}, site at vozclara.pages.dev)\n`,
);

console.log('┌─ 3/4  Building frontend ────────────────────────────────────');
await run('npm', ['run', 'build']);
console.log('└─ build complete\n');

console.log('┌─ 4/4  Deploying frontend to Cloudflare Pages ──────────────');
// Wrangler v4 won't auto-create a Pages project in non-interactive mode,
// so we create it explicitly first. If it already exists, the create call
// errors and we ignore that — the subsequent deploy works either way.
try {
  await run(
    'npx',
    ['wrangler', 'pages', 'project', 'create', 'vozclara', '--production-branch', 'main'],
    { capture: true },
  );
  console.log('  Pages project created.');
} catch {
  console.log('  Pages project already exists — skipping create.');
}
const pagesOut = await run(
  'npx',
  [
    'wrangler', 'pages', 'deploy', 'dist',
    '--project-name', 'vozclara',
    '--branch', 'main',
    '--commit-dirty=true',
  ],
  { capture: true },
);
const pagesUrlMatch = pagesOut.stdout.match(/https?:\/\/[\w.-]+\.pages\.dev/);
const pagesUrl = pagesUrlMatch ? pagesUrlMatch[0] : '(see wrangler output above)';
console.log('\n────────────────────────────────────────────────────────────');
console.log('  Deployment complete.');
console.log('');
console.log(`  Worker (transcript proxy):   ${workerUrl}`);
console.log(`  Frontend (open on phone):    ${pagesUrl}`);
console.log('────────────────────────────────────────────────────────────\n');
