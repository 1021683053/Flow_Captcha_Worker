const GlobalTokenPool = require('./src/GlobalTokenPool');
const createApiApp = require('./src/api');
const { PORT } = require('./src/config');
const http = require('http');

async function main() {
  console.log(`\n==========================================`);
  console.log(`[CaptchaWorker v5] Modular Dynamic Node Version`);
  console.log(`==========================================\n`);

  const pool = new GlobalTokenPool();
  const app = createApiApp(pool);
  const server = http.createServer(app);

  // 解决由于 Node >= 18 默认 keepAliveTimeout 过短 (5s)，
  // 导致 Next.js Proxy/反向代理试图复用 TCP 链接时遭遇强制切断 (ECONNRESET/Socket hang up) 的问题。
  server.keepAliveTimeout = 120000; // 120 secs
  server.headersTimeout = 125000;  // 必须大于 keepAliveTimeout
  server.setTimeout(300000); // 长轮询接口等待上限 (5分钟)

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[CaptchaWorker v5] API Server Ready on port ${PORT}`);
  });

  // Launch the heavy headless instances in the background AFTER the HTTP port answers
  await pool.init();

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`\x1b[31m[Fatal]\x1b[0m Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      console.error(`\x1b[31m[Fatal]\x1b[0m failed: ${e.message}`);
    }
  });

  process.on('SIGINT', async () => {
    console.log("\n[CaptchaWorker v5] Shutting down all proxy nodes...");
    for(const worker of pool.workers) {
      if(!worker.isShuttingDown) {
         await worker.shutdown().catch(()=>{});
      }
    }
    process.exit(0);
  });
}

main().catch(e => {
  console.error("Critical failure spinning up application:", e);
  process.exit(1);
});
