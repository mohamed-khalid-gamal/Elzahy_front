#!/usr/bin/env node

/**
 * LCP Performance Test Script
 * Tests the Largest Contentful Paint optimization
 */

const puppeteer = require('puppeteer');

async function measureLCP() {
  console.log('🚀 Starting LCP Performance Test...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable performance monitoring
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {
      lcp: 0,
      fcp: 0,
      cls: 0
    };

    // Monitor LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        window.performanceMetrics.lcp = lcpEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.fcp = entry.startTime;
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    }
  });

  try {
    // Navigate to the application
    await page.goto('http://localhost:4200', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for hero image to load
    await page.waitForSelector('.hero-section img', { timeout: 10000 });

    // Get performance metrics
    await page.waitForTimeout(2000); // Allow metrics to stabilize

    const metrics = await page.evaluate(() => window.performanceMetrics);
    const paintMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      return paintEntries.reduce((acc, entry) => {
        acc[entry.name] = entry.startTime;
        return acc;
      }, {});
    });

    console.log('📊 Performance Metrics:');
    console.log('=======================');
    console.log(`🎯 LCP (Largest Contentful Paint): ${Math.round(metrics.lcp || 0)}ms`);
    console.log(`🖼️  FCP (First Contentful Paint): ${Math.round(paintMetrics['first-contentful-paint'] || 0)}ms`);
    console.log(`⚡ LCP Status: ${metrics.lcp <= 2500 ? '✅ GOOD' : metrics.lcp <= 4000 ? '⚠️  NEEDS IMPROVEMENT' : '❌ POOR'}`);

    // Take screenshot for visual validation
    await page.screenshot({
      path: 'lcp-test-screenshot.png',
      fullPage: false
    });

    console.log('\n📸 Screenshot saved as: lcp-test-screenshot.png');

    if (metrics.lcp <= 2500) {
      console.log('\n🎉 SUCCESS: LCP is within the GOOD range (<2.5s)!');
    } else if (metrics.lcp <= 4000) {
      console.log('\n⚠️  WARNING: LCP needs improvement (2.5s-4s range)');
      console.log('💡 Suggestions:');
      console.log('   - Optimize hero image further (compress, WebP format)');
      console.log('   - Consider using a CDN');
      console.log('   - Reduce image dimensions if possible');
    } else {
      console.log('\n❌ CRITICAL: LCP is in POOR range (>4s)');
      console.log('🔧 Immediate actions needed:');
      console.log('   - Hero image optimization is critical');
      console.log('   - Check network conditions');
      console.log('   - Verify preload directives');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the Angular dev server is running on http://localhost:4200');
  } finally {
    await browser.close();
  }
}

// Check if server is likely running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:4200');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('⚠️  Angular dev server not detected on http://localhost:4200');
    console.log('🚀 Please run: npm start');
    console.log('   Then run this test again.\n');
    return;
  }

  await measureLCP();
}

if (require.main === module) {
  main();
}
