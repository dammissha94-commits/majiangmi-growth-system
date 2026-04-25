/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");

const rootDir = process.cwd();
const scanDirs = ["src", "supabase"];
const forbiddenTerms = [
  "cash",
  "gambling",
  "debt",
  "settlement",
  "loan",
  "commission",
  "rake",
  "抽水",
  "赌资",
  "欠款",
  "输赢金额",
  "现金结算",
];

const findings = [];

function walkDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkDir(entryPath);
      continue;
    }

    if (entry.isFile()) {
      scanFile(entryPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();

    for (const term of forbiddenTerms) {
      const matched = /[a-z]/i.test(term)
        ? lowerLine.includes(term.toLowerCase())
        : line.includes(term);

      if (matched) {
        findings.push({
          filePath: path.relative(rootDir, filePath),
          lineNumber: index + 1,
          term,
        });
      }
    }
  });
}

for (const dir of scanDirs) {
  walkDir(path.join(rootDir, dir));
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(
      `${finding.filePath}:${finding.lineNumber} matched forbidden term "${finding.term}"`,
    );
  }

  process.exit(1);
}

console.log("COMPLIANCE_CHECK_PASSED");
