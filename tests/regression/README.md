# Regression Testing Guide

This directory contains regression tests to ensure existing functionality remains intact.

## Test Files

### visual-regression.spec.ts
Visual regression tests using screenshot comparison:
- Landing page visuals
- Auth page (signin and signup tabs)
- Events page
- Dashboard page
- Event card component
- Responsive design (mobile, tablet, desktop)
- Dark mode
- Masked dynamic content

### functional-regression.spec.ts
Functional regression tests for core features:
- Authentication flow (signup, signin, signout)
- Event booking flow
- Dashboard display
- Navigation between pages
- Form validation
- Error handling
- Protected routes
- Data persistence

## Visual Regression Testing

### First Run (Creating Baselines)
The first time you run visual tests, Playwright creates baseline screenshots:

```bash
npx playwright test tests/regression/visual-regression.spec.ts
```

This creates screenshots in `tests/regression/visual-regression.spec.ts-snapshots/`

### Subsequent Runs (Comparing)
Future runs compare against baselines and fail if differences exceed thresholds:
- **maxDiffPixels**: Maximum allowed pixel differences (default: 100)
- **threshold**: Color difference threshold 0-1 (default: 0.2)

### Updating Baselines
When you intentionally change designs:

```bash
npx playwright test tests/regression/visual-regression.spec.ts --update-snapshots
```

### Handling Failures
When visual tests fail:
1. Review the diff images in `test-results/`
2. Determine if changes are intentional
3. If intentional, update baselines
4. If bugs, fix the code and rerun

## Functional Regression Testing

### Critical Paths Tested
- **User Authentication**: Signup → Signout → Signin
- **Event Booking**: Login → View Events → Book → Verify in Dashboard
- **Navigation**: Events ↔ Dashboard transitions
- **Data Persistence**: Bookings survive page refresh
- **Access Control**: Protected routes redirect to auth

### Running Functional Tests

```bash
# Run all functional regression tests
npx playwright test tests/regression/functional-regression.spec.ts

# Run with UI mode to debug
npx playwright test tests/regression/functional-regression.spec.ts --ui
```

## Best Practices

### Visual Regression
1. **Mask Dynamic Content**: Dates, times, user-specific data
2. **Disable Animations**: Consistent screenshots
3. **Wait for Load**: Ensure content fully loaded
4. **Test Multiple Viewports**: Mobile, tablet, desktop
5. **Version Control Snapshots**: Commit baseline images to git

### Functional Regression
1. **Test Happy Paths**: Most common user flows
2. **Test Edge Cases**: Boundary conditions
3. **Test Error Handling**: Invalid inputs, network errors
4. **Test Data Integrity**: Data persists correctly
5. **Test Access Control**: Security measures work

## CI/CD Integration

### Visual Tests in CI
Configure CI to:
1. Use consistent browser versions
2. Set stable viewport sizes
3. Fail builds on visual regressions
4. Upload diff images as artifacts

### Functional Tests in CI
Configure CI to:
1. Run on every pull request
2. Block merge on failures
3. Parallel execution for speed
4. Generate HTML reports

## Troubleshooting

### Visual Test Failures
**Problem**: Tests fail with minor pixel differences
**Solution**: Increase `maxDiffPixels` or `threshold`

**Problem**: Fonts render differently
**Solution**: Use web fonts, mask text areas

**Problem**: Images load at different speeds
**Solution**: Wait for `networkidle` state

### Functional Test Failures
**Problem**: Timing issues
**Solution**: Use proper waits, avoid hardcoded timeouts

**Problem**: Test data conflicts
**Solution**: Generate unique test data per run

**Problem**: Flaky tests
**Solution**: Add retry logic, improve selectors

## Maintenance

### Regular Updates
- Update baselines when designs change
- Add tests for new features
- Remove tests for deprecated features
- Review and update thresholds

### Monitoring
- Track regression test pass rates
- Identify flaky tests
- Monitor test execution time
- Review false positives

## When to Run Regression Tests

**Before Every Deployment:**
- Run full regression suite
- Review all failures
- Update baselines if needed

**During Development:**
- Run relevant regression tests
- Ensure no existing functionality breaks
- Add new regression tests for bug fixes

**After Major Changes:**
- Run complete suite multiple times
- Test across browsers
- Verify responsive designs
