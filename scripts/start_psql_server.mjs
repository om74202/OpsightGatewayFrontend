#!/usr/bin/env node

import { execSync } from "child_process";

const containerName = "opsight-postgres";
const postgresUser = "postgres";
const postgresPassword = "opsight";
const postgresDatabase = "postgres";
const postgresPort = "5432";
const postgresImage = "postgres:16";
const volumeName = "opsight_pgdata";

const runCommand = (command) => {
  return execSync(command, {
    stdio: "pipe",
    encoding: "utf-8",
  }).trim();
};

const runCommandWithOutput = (command) => {
  execSync(command, {
    stdio: "inherit",
  });
};

const containerExists = () => {
  const result = runCommand(
    `docker ps -a --filter "name=^/${containerName}$" --format "{{.Names}}"`,
  );

  return result === containerName;
};

const containerRunning = () => {
  const result = runCommand(
    `docker ps --filter "name=^/${containerName}$" --format "{{.Names}}"`,
  );

  return result === containerName;
};

try {
  runCommand("docker --version");

  if (containerRunning()) {
    console.log(`${containerName} is already running.`);
  } else if (containerExists()) {
    console.log(`${containerName} exists but is stopped. Starting it...`);
    runCommandWithOutput(`docker start ${containerName}`);
  } else {
    console.log(`${containerName} does not exist. Creating and starting it...`);

    runCommandWithOutput(`
      docker run -d \
        --name ${containerName} \
        -e POSTGRES_USER=${postgresUser} \
        -e POSTGRES_PASSWORD=${postgresPassword} \
        -e POSTGRES_DB=${postgresDatabase} \
        -p ${postgresPort}:5432 \
        -v ${volumeName}:/var/lib/postgresql/data \
        ${postgresImage}
    `);
  }

  console.log("");
  console.log("PostgreSQL is ready/running with:");
  console.log(
    `DATABASE_URL="postgresql://${postgresUser}:${postgresPassword}@localhost:${postgresPort}/${postgresDatabase}?sslmode=disable"`,
  );
} catch (error) {
  console.error("Failed to start PostgreSQL Docker container.");
  console.error(error.message);
  process.exit(1);
}
