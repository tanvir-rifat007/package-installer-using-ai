#!/usr/bin/env node

import "dotenv/config";
import OpenAI from "openai";
import os from "os";
import { exec } from "node:child_process";
import ora from "ora";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function detectOS() {
  const platform = os.platform();
  if (platform === "darwin") return "macos";
  if (platform === "win32") return "windows";
  if (platform === "linux") return "linux";
  return "unsupported";
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }

      if (stderr) {
        reject(stderr.trim());
        return;
      }

      resolve(stdout.trim());
    });
  });
}

async function installPackage() {
  const userInput = process.argv[2];
  const osType = detectOS();

  if (osType === "unsupported") {
    console.log("Unsupported operating system.");
    return;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `You are a helpful package manager. Provide only the OS-specific shell command to install a package.
        Or uninstall a package if it is already installed. 
                  Do not include any explanations, markdown formatting, or additional text.`,
      },
      {
        role: "user",
        content: `Install/uninstall ${userInput} on ${osType}.`,
      },
    ],
  });

  const command = response.choices[0].message.content.trim();
  console.log(`Generated Command: ${command}`);

  let wants;
  if (process.argv[2].toLowerCase().includes("uninstall")) {
    wants = "uninstall";
  } else if (process.argv[2].toLowerCase().includes("install")) {
    wants = "install";
  }
  const spinner = ora(wants).start();

  try {
    const result = await executeCommand(command);

    spinner.succeed("Package installed successfully!");
    console.log(result);
  } catch (err) {
    spinner.fail("Failed to install package.");
    console.error(`Error occurred: ${err}`);
  }
}

installPackage();
