import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class CustomReporter implements Reporter {
  private startTime: number = 0;
  private testResults: Array<{
    title: string;
    status: string;
    duration: number;
    file: string;
    project: string;
    error?: string;
  }> = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log(`\n🚀 Starting test run with ${suite.allTests().length} tests`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : status === 'skipped' ? '⏭️' : '⚠️';
    
    this.testResults.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      file: test.location.file,
      project: test.parent.project()?.name || 'unknown',
      error: result.error?.message,
    });

    if (status === 'failed') {
      console.log(`${emoji} ${test.title} - ${result.duration}ms`);
      if (result.error) {
        console.log(`   Error: ${result.error.message.split('\n')[0]}`);
      }
    }
  }

  onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const passed = this.testResults.filter(t => t.status === 'passed').length;
    const failed = this.testResults.filter(t => t.status === 'failed').length;
    const skipped = this.testResults.filter(t => t.status === 'skipped').length;
    const flaky = this.testResults.filter(t => t.status === 'flaky').length;

    console.log('\n' + '='.repeat(80));
    console.log('📊 Test Summary Report');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`⚠️  Flaky: ${flaky}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));

    // Generate custom JSON report
    const reportData = {
      summary: {
        total: this.testResults.length,
        passed,
        failed,
        skipped,
        flaky,
        duration,
        successRate: (passed / this.testResults.length) * 100,
      },
      tests: this.testResults,
      timestamp: new Date().toISOString(),
    };

    const reportDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportDir, 'custom-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    // Generate HTML summary
    this.generateHtmlSummary(reportData);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`  • ${t.title} (${t.file})`);
          if (t.error) {
            console.log(`    ${t.error.split('\n')[0]}`);
          }
        });
    }
  }

  private generateHtmlSummary(reportData: any) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report Summary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; font-size: 1.1rem; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      background: #f8f9fa;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-4px); }
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .skipped { color: #f59e0b; }
    .flaky { color: #8b5cf6; }
    .tests-list {
      padding: 2rem;
    }
    .tests-list h2 {
      margin-bottom: 1.5rem;
      color: #333;
      font-size: 1.5rem;
    }
    .test-item {
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-item.failed { background: #fee2e2; }
    .test-name { font-weight: 500; }
    .test-duration { color: #666; font-size: 0.9rem; }
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 1rem 2rem;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      transition: width 0.3s;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Test Report</h1>
      <p>${new Date(reportData.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${reportData.summary.successRate}%"></div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${reportData.summary.total}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat-card">
        <div class="stat-value passed">${reportData.summary.passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value failed">${reportData.summary.failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value skipped">${reportData.summary.skipped}</div>
        <div class="stat-label">Skipped</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(reportData.summary.duration / 1000).toFixed(2)}s</div>
        <div class="stat-label">Duration</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reportData.summary.successRate.toFixed(1)}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
    </div>
    
    ${reportData.summary.failed > 0 ? `
    <div class="tests-list">
      <h2>❌ Failed Tests</h2>
      ${reportData.tests
        .filter((t: any) => t.status === 'failed')
        .map((t: any) => `
          <div class="test-item failed">
            <div class="test-name">${t.title}</div>
            <div class="test-duration">${t.duration}ms</div>
          </div>
        `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
    `;

    fs.writeFileSync(
      path.join(process.cwd(), 'test-results', 'summary.html'),
      html
    );
  }
}

export default CustomReporter;
