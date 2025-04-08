const fs = require('fs');
const path = require('path');

// Read the test results
const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));

// Create a readable summary
const summary = {
    passed: results.numPassedTests,
    failed: results.numFailedTests,
    total: results.numTotalTests,
    duration: results.testResults.reduce((acc, curr) => acc + curr.endTime - curr.startTime, 0) / 1000,
    testDetails: []
};

// Helper function to extract file path from test file
const getRelativeFilePath = (testFile) => {
    return path.relative(process.cwd(), testFile)
        .replace(/^src\/__tests__\//, '')
        .replace(/\.test\.(ts|tsx)$/, '');
};

// Helper function to format the error message
const formatError = (errorMessage) => {
    if (!errorMessage) return '';
    // Remove ANSI color codes but keep full error message
    const cleanMessage = errorMessage
        .replace(/\u001b\[\d+m/g, '')
        .trim();

    // Extract the most relevant parts of the error
    const lines = cleanMessage.split('\n');
    if (lines.length <= 1) return cleanMessage;

    // Get expected/received values if they exist
    const expectedLine = lines.find(line => line.includes('Expected:'));
    const receivedLine = lines.find(line => line.includes('Received:'));

    if (expectedLine && receivedLine) {
        return `${lines[0]}\n${expectedLine}\n${receivedLine}`;
    }

    // If no expected/received, return first 3 relevant lines
    return lines
        .filter(line => line.trim() && !line.includes('at '))
        .slice(0, 3)
        .join('\n');
};

// Helper function to get test context
const getTestContext = (test) => {
    const ancestors = test.ancestorTitles || [];
    return ancestors.length > 0 ? `[${ancestors.join(' > ')}]` : '';
};

// Collect test details with structured information
results.testResults.forEach(suite => {
    const filePath = getRelativeFilePath(suite.testFilePath);

    suite.testResults.forEach(test => {
        const errorType = test.status === 'failed' ? 'Failed' : 'Passed';
        const errorName = test.title;
        const context = getTestContext(test);
        const duration = test.duration ? `(${test.duration}ms)` : '';

        const explanation = test.status === 'failed'
            ? `${context}\n${formatError(test.failureMessages[0])}`
            : `${context}\nTest completed successfully ${duration}`;

        summary.testDetails.push({
            errorName,
            file: filePath,
            errorType,
            explanation,
            coverage: suite.coverage ? `${Math.round(suite.coverage.pct)}%` : 'N/A'
        });
    });
});

// Create table headers
const headers = ['Error Name', 'File', 'Error Type', 'Explanation', 'Coverage'];
// Increase explanation column width
const columnWidths = [25, 25, 15, 50, 10];
const separator = headers.map((h, i) => '-'.repeat(columnWidths[i])).join(' | ');

// Format the table
const table = [
    headers.map((h, i) => h.padEnd(columnWidths[i])).join(' | '),
    separator,
    ...summary.testDetails.map(detail => {
        // Split explanation into lines and pad them properly
        const explanationLines = detail.explanation.split('\n');
        const paddedExplanation = explanationLines.map((line, i) =>
            i === 0 ? line.padEnd(columnWidths[3]) : ' '.repeat(columnWidths[0] + columnWidths[1] + columnWidths[2] + 9) + line
        ).join('\n');

        return [
            detail.errorName.padEnd(columnWidths[0]).substring(0, columnWidths[0]),
            detail.file.padEnd(columnWidths[1]).substring(0, columnWidths[1]),
            detail.errorType.padEnd(columnWidths[2]).substring(0, columnWidths[2]),
            explanationLines[0].padEnd(columnWidths[3]).substring(0, columnWidths[3]),
            detail.coverage.padEnd(columnWidths[4]).substring(0, columnWidths[4])
        ].join(' | ') + (
                explanationLines.length > 1
                    ? '\n' + explanationLines.slice(1).map(line =>
                        ' '.repeat(columnWidths[0] + columnWidths[1] + columnWidths[2] + 9) +
                        line.padEnd(columnWidths[3]).substring(0, columnWidths[3])
                    ).join('\n')
                    : ''
            );
    })
];

// Create readable output
const output = `
Test Summary
============
Total Tests: ${summary.total}
Passed: ${summary.passed}
Failed: ${summary.failed}
Duration: ${summary.duration.toFixed(2)}s

Test Results Table
=================
${table.join('\n')}
`;

// Write to log file
const logFile = path.join('test-logs', `test-run-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

// Ensure test-logs directory exists
if (!fs.existsSync('test-logs')) {
    fs.mkdirSync('test-logs');
}

fs.writeFileSync(logFile, output);
console.log(output);
console.log(`\nDetailed log saved to: ${logFile}`);

// If there are failures, exit with error code
if (summary.failed > 0) {
    process.exit(1);
} 