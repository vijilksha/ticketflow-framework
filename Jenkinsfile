pipeline {
  agent any

  environment {
    NODE_VERSION = '20'
    VITE_SUPABASE_URL = credentials('supabase-url')
    VITE_SUPABASE_PUBLISHABLE_KEY = credentials('supabase-publishable-key')
    VITE_SUPABASE_PROJECT_ID = credentials('supabase-project-id')
  }

  tools {
    nodejs "NodeJS-${NODE_VERSION}"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 1, unit: 'HOURS')
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
          env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint || true'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
      post {
        success {
          archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Unit Tests') {
          steps {
            script {
              sh 'npm run test:unit || true'
            }
          }
        }

        stage('API Tests') {
          steps {
            script {
              sh 'npx playwright test tests/api/ --reporter=json --output=test-results/api'
            }
          }
        }

        stage('Integration Tests') {
          steps {
            script {
              sh 'npx playwright test tests/integration/ --reporter=json --output=test-results/integration'
            }
          }
        }

        stage('E2E Tests') {
          steps {
            script {
              sh 'npx playwright test tests/*.spec.ts --reporter=json --output=test-results/e2e'
            }
          }
        }

        stage('Data-Driven Tests') {
          steps {
            script {
              sh 'npx playwright test tests/data-driven/ --reporter=json --output=test-results/data-driven'
            }
          }
        }
      }
      post {
        always {
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Test Report'
          ])
          junit 'test-results/junit.xml'
          archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
      }
    }

    stage('Performance Tests') {
      when {
        branch 'main'
      }
      steps {
        script {
          sh 'npx playwright test tests/performance/ --reporter=json --output=test-results/performance'
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'test-results/performance/**/*', allowEmptyArchive: true
        }
      }
    }

    stage('Regression Tests') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      steps {
        script {
          sh 'npx playwright test tests/regression/ --reporter=json --output=test-results/regression'
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'test-results/regression/**/*', allowEmptyArchive: true
        }
      }
    }

    stage('Deploy to Staging') {
      when {
        branch 'develop'
      }
      steps {
        echo 'Deploying to staging environment...'
        // Add your staging deployment commands here
        // Example: sh 'npm run deploy:staging'
      }
    }

    stage('Deploy to Production') {
      when {
        branch 'main'
      }
      steps {
        input message: 'Deploy to production?', ok: 'Deploy'
        echo 'Deploying to production environment...'
        // Add your production deployment commands here
        // Example: sh 'npm run deploy:prod'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo "Pipeline succeeded! Build #${env.BUILD_NUMBER} completed successfully."
      // Add notification here (Slack, email, etc.)
    }
    failure {
      echo "Pipeline failed! Build #${env.BUILD_NUMBER} failed."
      // Add notification here (Slack, email, etc.)
    }
    unstable {
      echo "Pipeline unstable! Build #${env.BUILD_NUMBER} is unstable."
      // Add notification here (Slack, email, etc.)
    }
  }
}
