# Jenkins CI/CD Pipeline Configuration

This directory contains Jenkins pipeline configuration and related files for automated testing and deployment.

## Prerequisites

### Jenkins Setup

1. **Install Required Plugins**:
   - Pipeline
   - NodeJS Plugin
   - Git Plugin
   - HTML Publisher Plugin
   - JUnit Plugin
   - Credentials Binding Plugin

2. **Configure Node.js**:
   - Go to Jenkins → Manage Jenkins → Global Tool Configuration
   - Add NodeJS installation named `NodeJS-20` with version 20.x

3. **Configure Credentials**:
   Create the following credentials in Jenkins (Manage Jenkins → Credentials):
   - `supabase-url`: Secret text with your Supabase URL
   - `supabase-publishable-key`: Secret text with your Supabase publishable key
   - `supabase-project-id`: Secret text with your Supabase project ID

## Pipeline Stages

The Jenkins pipeline includes the following stages:

### 1. Checkout
- Checks out the code from the repository
- Captures git commit information

### 2. Install Dependencies
- Installs Node.js dependencies via `npm ci`
- Installs Playwright browsers and dependencies

### 3. Lint
- Runs ESLint to check code quality
- Continues even if linting fails (for visibility)

### 4. Build
- Builds the application using Vite
- Archives build artifacts

### 5. Test (Parallel Execution)
- **Unit Tests**: Runs unit tests (if configured)
- **API Tests**: Tests API endpoints
- **Integration Tests**: Tests combined UI and API workflows
- **E2E Tests**: End-to-end UI tests
- **Data-Driven Tests**: Parameterized tests with CSV/JSON data

### 6. Performance Tests
- Runs only on `main` branch
- Tests page load times and API performance

### 7. Regression Tests
- Runs on `main` and `develop` branches
- Includes visual regression tests

### 8. Deploy to Staging
- Triggers on `develop` branch
- Add your staging deployment commands

### 9. Deploy to Production
- Triggers on `main` branch
- Requires manual approval before deployment

## Creating a Jenkins Pipeline Job

1. **Create New Job**:
   - Click "New Item"
   - Enter job name (e.g., "Event-Booking-Platform")
   - Select "Pipeline"
   - Click OK

2. **Configure Pipeline**:
   - Under "Pipeline" section, select "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: Your repository URL
   - Branch Specifier: `*/main` or `*/develop`
   - Script Path: `Jenkinsfile`

3. **Configure Triggers**:
   - Poll SCM: `H/5 * * * *` (checks every 5 minutes)
   - Or use GitHub webhooks for instant triggers

## Branch Strategy

### Main Branch (`main`)
- Runs all tests including performance and regression
- Requires approval for production deployment
- Recommended for production releases

### Develop Branch (`develop`)
- Runs all tests including regression
- Auto-deploys to staging environment
- Recommended for integration and testing

### Feature Branches
- Runs standard test suite (API, Integration, E2E, Data-Driven)
- No deployment stages

## Test Reports

After each build, the following reports are available:

1. **Playwright HTML Report**: Full test results with screenshots and traces
2. **JUnit XML Report**: Test results in JUnit format
3. **JSON Results**: Detailed test results in JSON format
4. **Custom Report**: Enhanced console output and HTML dashboard

Access reports via:
- Build page → "Playwright Test Report" link
- Build page → "Test Result" link

## Artifacts

The pipeline archives the following artifacts:

- **Build Artifacts**: `dist/**/*` (production build)
- **Test Results**: `test-results/**/*` (all test outputs)
- **Test Reports**: `playwright-report/**/*` (HTML reports)
- **Performance Metrics**: `test-results/performance/**/*`
- **Regression Results**: `test-results/regression/**/*`

## Environment Variables

The pipeline uses the following environment variables:

- `NODE_VERSION`: Node.js version to use (default: 20)
- `VITE_SUPABASE_URL`: Supabase backend URL (from credentials)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (from credentials)
- `VITE_SUPABASE_PROJECT_ID`: Supabase project ID (from credentials)

## Notifications

Configure notifications in the `post` section of the Jenkinsfile:

### Slack Notifications
```groovy
post {
  success {
    slackSend(
      color: 'good',
      message: "Build succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
    )
  }
  failure {
    slackSend(
      color: 'danger',
      message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
    )
  }
}
```

### Email Notifications
```groovy
post {
  always {
    emailext(
      subject: "Build ${env.BUILD_STATUS}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
      body: "Check console output at ${env.BUILD_URL}",
      to: 'team@example.com'
    )
  }
}
```

## Troubleshooting

### Common Issues

1. **Playwright Installation Fails**
   - Ensure the Jenkins agent has required system dependencies
   - Run: `npx playwright install-deps`

2. **Tests Timeout**
   - Increase timeout in `playwright.config.ts`
   - Or increase pipeline timeout in Jenkinsfile

3. **Environment Variables Not Set**
   - Verify credentials are configured in Jenkins
   - Check credential IDs match those in Jenkinsfile

4. **Build Artifacts Not Archived**
   - Ensure paths in `archiveArtifacts` are correct
   - Check file permissions on Jenkins workspace

### Viewing Logs

- **Console Output**: Click on build number → "Console Output"
- **Test Logs**: Check archived test-results artifacts
- **Build Logs**: Available in workspace directory

## Best Practices

1. **Use Branch Protection**: Require builds to pass before merging
2. **Run Tests in Parallel**: Speeds up feedback time
3. **Cache Dependencies**: Configure npm cache in Jenkins
4. **Monitor Performance**: Track test execution times
5. **Regular Maintenance**: Update dependencies and plugins
6. **Security**: Use credentials, never hardcode secrets
7. **Clean Workspace**: Enable workspace cleanup after builds

## Advanced Configuration

### Matrix Builds (Multiple Browsers)
```groovy
stage('Test') {
  matrix {
    axes {
      axis {
        name 'BROWSER'
        values 'chromium', 'firefox', 'webkit'
      }
    }
    stages {
      stage('Test Browser') {
        steps {
          sh "npx playwright test --project=${BROWSER}"
        }
      }
    }
  }
}
```

### Conditional Stages
```groovy
stage('Security Scan') {
  when {
    anyOf {
      branch 'main'
      changeRequest target: 'main'
    }
  }
  steps {
    sh 'npm audit'
  }
}
```

## Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Jenkins NodeJS Plugin](https://plugins.jenkins.io/nodejs/)
- [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)
