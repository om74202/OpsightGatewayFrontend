import fs from "fs";
import path from "path";

const [, , command] = process.argv;

if (!command) {
  console.error("Missing react-scripts command. Expected start, build, test, or eject.");
  process.exit(1);
}

const defaultSystemEnvFile = "/etc/gateway/gateway_frontend.env";
const systemEnvFile = process.env.GATEWAY_FRONTEND_ENV_FILE || defaultSystemEnvFile;
const allowedPrefixes = ["REACT_APP_"];

const shouldImportKey = (key) => allowedPrefixes.some((prefix) => key.startsWith(prefix));

const stripWrappingQuotes = (value) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const loadSystemEnvFile = (filePath) => {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`[frontend-env] Skipping missing system env file: ${resolvedPath}`);
    return;
  }

  const contents = fs.readFileSync(resolvedPath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

    if (!shouldImportKey(key)) {
      continue;
    }

    process.env[key] = value;
  }
}

loadSystemEnvFile(systemEnvFile);

const reactScriptsBin = require.resolve("react-scripts/bin/react-scripts.js");
const child = Bun.spawn({
  cmd: [process.execPath, reactScriptsBin, command],
  cwd: process.cwd(),
  env: process.env,
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

const exitCode = await child.exited;
process.exit(exitCode);
