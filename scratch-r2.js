const { execSync } = require('child_process');
try {
  execSync('npx.cmd wrangler r2 bucket create coursesproj-media', {
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: 'f3988ca02d5b5aef9e2514bc47beba9b' },
    stdio: 'inherit'
  });
} catch (e) {
  console.error(e);
}
