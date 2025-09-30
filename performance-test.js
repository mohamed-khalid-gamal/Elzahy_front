const puppeteer = require('puppeteer');

async function measurePerformance() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Set viewport to desktop size
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('🚀 Starting performance measurement...');

  // Enable performance monitoring
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {
      lcp: null,
      fcp: null,
      cls: null,
      fid: null,
      ttfb: null
    };

    // Measure LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      window.performanceMetrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure FCP
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.performanceMetrics.fcp = entry.startTime;
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Measure CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      window.performanceMetrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  });

  const startTime = Date.now();

  try {
    // Navigate to the page
    await page.goto('http://localhost:4200', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the page to be fully loaded
    await page.waitForTimeout(3000);

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];

      return {
        // Core Web Vitals
        lcp: window.performanceMetrics?.lcp || null,
        fcp: window.performanceMetrics?.fcp || null,
        cls: window.performanceMetrics?.cls || null,

        // Loading metrics
        ttfb: navigation ? navigation.responseStart - navigation.requestStart : null,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,

        // Resource metrics
        resources: performance.getEntriesByType('resource').length,

        // Bundle size estimation
        jsSize: performance.getEntriesByType('resource')
          .filter(r => r.name.includes('.js'))
          .reduce((sum, r) => sum + (r.transferSize || 0), 0),
        cssSize: performance.getEntriesByType('resource')
          .filter(r => r.name.includes('.css'))
          .reduce((sum, r) => sum + (r.transferSize || 0), 0),
        imageSize: performance.getEntriesByType('resource')
          .filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/))
          .reduce((sum, r) => sum + (r.transferSize || 0), 0)
      };
    });

    const totalTime = Date.now() - startTime;

    // Performance analysis and scoring
    console.log('\n📊 Performance Results:');
    console.log('================================');

    if (metrics.lcp) {
      const lcpScore = metrics.lcp < 2500 ? '✅ Good' : metrics.lcp < 4000 ? '⚠️  Needs Improvement' : '❌ Poor';
      console.log(`LCP (Largest Contentful Paint): ${Math.round(metrics.lcp)}ms ${lcpScore}`);
    }

    if (metrics.fcp) {
      const fcpScore = metrics.fcp < 1800 ? '✅ Good' : metrics.fcp < 3000 ? '⚠️  Needs Improvement' : '❌ Poor';
      console.log(`FCP (First Contentful Paint): ${Math.round(metrics.fcp)}ms ${fcpScore}`);
    }

    if (metrics.cls !== null) {
      const clsScore = metrics.cls < 0.1 ? '✅ Good' : metrics.cls < 0.25 ? '⚠️  Needs Improvement' : '❌ Poor';
      console.log(`CLS (Cumulative Layout Shift): ${metrics.cls.toFixed(3)} ${clsScore}`);
    }

    if (metrics.ttfb) {
      const ttfbScore = metrics.ttfb < 600 ? '✅ Good' : metrics.ttfb < 1500 ? '⚠️  Needs Improvement' : '❌ Poor';
      console.log(`TTFB (Time to First Byte): ${Math.round(metrics.ttfb)}ms ${ttfbScore}`);
    }

    console.log('\n📦 Bundle Analysis:');
    console.log('===================');
    console.log(`JavaScript: ${Math.round(metrics.jsSize / 1024)}KB`);
    console.log(`CSS: ${Math.round(metrics.cssSize / 1024)}KB`);
    console.log(`Images: ${Math.round(metrics.imageSize / 1024)}KB`);
    console.log(`Total Resources: ${metrics.resources}`);
    console.log(`DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`Load Complete: ${Math.round(metrics.loadComplete)}ms`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('===================');

    if (metrics.lcp > 2500) {
      console.log('- Optimize LCP by improving image loading and critical resource delivery');
    }

    if (metrics.fcp > 1800) {
      console.log('- Improve FCP by inlining critical CSS and optimizing font loading');
    }

    if (metrics.cls > 0.1) {
      console.log('- Reduce CLS by specifying image dimensions and avoiding layout shifts');
    }

    if (metrics.jsSize > 500 * 1024) {
      console.log('- Consider code splitting and tree shaking to reduce JavaScript bundle size');
    }

    if (metrics.cssSize > 100 * 1024) {
      console.log('- Remove unused CSS and consider critical CSS extraction');
    }

    // Overall score
    const scores = [
      metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 60 : 20,
      metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 60 : 20,
      metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 60 : 20
    ].filter(s => s !== null);

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    console.log(`\n🎯 Overall Performance Score: ${Math.round(averageScore)}/100`);

    if (averageScore >= 90) {
      console.log('🎉 Excellent performance! Your app is well optimized.');
    } else if (averageScore >= 70) {
      console.log('👍 Good performance with room for improvement.');
    } else {
      console.log('⚠️  Performance needs attention. Consider implementing more optimizations.');
    }

  } catch (error) {
    console.error('Error measuring performance:', error.message);

    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('\n❗ Make sure your Angular development server is running on http://localhost:4200');
      console.log('Run: npm start');
    }
  } finally {
    await browser.close();
  }
}

// Run the performance test
measurePerformance().catch(console.error);
