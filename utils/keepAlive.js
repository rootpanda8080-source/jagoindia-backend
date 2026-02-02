/**
 * Keep-Alive Mechanism for Render Free Tier
 * Prevents service from sleeping due to inactivity
 * 
 * Sends periodic ping requests to /health endpoint
 * Only runs in production environment
 * Configurable via environment variables
 */

let pingInterval = null;

/**
 * Initialize the keep-alive system
 * @param {string} serviceUrl - Full URL to the health endpoint (e.g., https://your-service.render.com/health)
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable keep-alive (default: true in production)
 * @param {number} options.interval - Ping interval in milliseconds (default: 600000 = 10 minutes)
 * @param {boolean} options.verbose - Log ping attempts (default: false)
 */
export function initKeepAlive(serviceUrl, options = {}) {
  // Use environment variables or provided options
  const isProduction = process.env.NODE_ENV === 'production';
  const enabled = options.enabled !== undefined 
    ? options.enabled 
    : process.env.ENABLE_SELF_PING === 'true' || (isProduction && process.env.ENABLE_SELF_PING !== 'false');
  
  const interval = options.interval || parseInt(process.env.SELF_PING_INTERVAL || '600000', 10);
  const url = serviceUrl || process.env.SELF_PING_URL;
  const verbose = options.verbose || process.env.KEEP_ALIVE_VERBOSE === 'true';

  // Don't run in development unless explicitly enabled
  if (!isProduction && !process.env.ENABLE_SELF_PING) {
    if (verbose) {
      console.log('⏭️  Keep-alive disabled (not in production)');
    }
    return;
  }

  // Can't start without URL
  if (!url || !enabled) {
    if (verbose && !url) {
      console.log('⏭️  Keep-alive disabled (SELF_PING_URL not provided)');
    }
    return;
  }

  if (pingInterval) {
    console.log('⚠️  Keep-alive already running');
    return;
  }

  console.log('🔄 Keep-alive initialized');
  console.log(`   ├─ URL: ${url}`);
  console.log(`   ├─ Interval: ${interval}ms (${(interval / 60000).toFixed(1)} min)`);
  console.log(`   └─ Status: Active`);

  // Initial ping after a short delay to let server start
  setTimeout(() => {
    pingHealth(url, verbose);
  }, 2000);

  // Set up recurring pings
  pingInterval = setInterval(() => {
    pingHealth(url, verbose);
  }, interval);

  // Graceful cleanup on process exit
  process.on('exit', () => {
    if (pingInterval) {
      clearInterval(pingInterval);
    }
  });

  // Also handle SIGTERM and SIGINT
  process.on('SIGTERM', () => {
    if (pingInterval) {
      clearInterval(pingInterval);
    }
  });
}

/**
 * Stop the keep-alive system
 */
export function stopKeepAlive() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('🛑 Keep-alive stopped');
  }
}

/**
 * Send a single ping request to the health endpoint
 * @private
 */
async function pingHealth(url, verbose = false) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'JagoIndia-KeepAlive/1.0',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (verbose) {
        console.log(`✅ Keep-alive ping successful [${new Date().toISOString()}]`);
        console.log(`   Status: ${data.status}, Uptime: ${data.uptime}`);
      }
    } else {
      console.warn(`⚠️  Keep-alive ping returned status ${response.status}`);
    }
  } catch (error) {
    // Log errors but don't crash the app
    console.warn(`⚠️  Keep-alive ping failed: ${error.message}`);
    // Could implement retry logic here if needed
  }
}

/**
 * Verify configuration for keep-alive
 * Call this before deploying to production
 */
export function verifyKeepAliveConfig() {
  const issues = [];

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SELF_PING_URL) {
      issues.push('❌ SELF_PING_URL not set in production (keep-alive will not work)');
    }

    if (process.env.ENABLE_SELF_PING === 'false') {
      console.log('⚠️  ENABLE_SELF_PING is disabled in production - server may sleep');
    }
  }

  if (issues.length > 0) {
    console.warn('\n🔍 Keep-Alive Configuration Issues:');
    issues.forEach(issue => console.warn(issue));
    console.warn('See RENDER_DEPLOYMENT.md for setup instructions\n');
  }

  return issues;
}
