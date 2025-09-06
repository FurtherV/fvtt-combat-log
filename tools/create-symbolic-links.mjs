import fs from "fs";
import yaml from "js-yaml";
import path from "path";

console.log("Reforging Symlinks");

main();

async function main() {
  if (!fs.existsSync("foundry-config.yaml")) {
    console.log("Foundry config file did not exist.");
    return;
  }

  let fileRoot = "";
  let foundryConfig;

  // Attempt to read our foundry config
  try {
    const fc = await fs.promises.readFile("foundry-config.yaml", "utf-8");
    foundryConfig = yaml.load(fc);

    // As of 13.338, the Node install is *not* nested but electron installs *are*
    const nested = fs.existsSync(
      path.join(foundryConfig.installPath, "resources", "app"),
    );

    fileRoot = nested
      ? path.join(foundryConfig.installPath, "resources", "app")
      : foundryConfig.installPath;
  } catch (err) {
    console.error(`Error reading foundry-config.yaml: ${err}`);
    process.exit(1);
  }

  // Attempt to grab the foundry version we use
  let foundryVersion;
  try {
    const fpack = JSON.parse(
      await fs.promises.readFile(path.join(fileRoot, "package.json"), "utf-8"),
    );
    foundryVersion = fpack["release"]["generation"];
  } catch (err) {
    console.error(
      `Error reading ${path.join(fileRoot, "package.json")}: ${err}`,
    );
    process.exit(1);
  }

  // Create the directory for our symlinks
  try {
    await fs.promises.rm("foundry", { recursive: true, force: true });
    await fs.promises.mkdir("foundry", { recursive: true });
  } catch (e) {
    console.error(`Failed to create 'foundry' directory: ${e}`);
    process.exit(1);
  }

  if (foundryVersion == 12) {
    // Javascript files for v12
    console.info("Using FoundryVTT V12 setup");
    for (const p of ["client", "client-esm", "common"]) {
      const src = path.join(fileRoot, p);
      const dest = path.join("foundry", p);
      await safeSymlink(src, dest);
    }
  } else if (foundryVersion >= 13) {
    // JavaScript files for v13+
    console.info("Using FoundryVTT V13+ setup");
    for (const p of ["client", "common", "tsconfig.json"]) {
      const src = path.join(fileRoot, p);
      const dest = path.join("foundry", p);
      await safeSymlink(src, dest);
    }
  } else {
    console.error(
      `This script does not support the foundry version ${foundryVersion}`,
    );
    process.exit(1);
  }

  // Language files
  await safeSymlink(
    path.join(fileRoot, "public", "lang"),
    path.join("foundry", "lang"),
  );

  // Module symlink in Foundry's modules directory
  try {
    const pkg = JSON.parse(await fs.promises.readFile("package.json", "utf-8"));
    const moduleId = pkg.name;
    const src = path.resolve("dist", moduleId);
    const dest = path.join(
      foundryConfig.userdataPath,
      "Data",
      "modules",
      moduleId,
    );

    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await safeSymlink(src, dest);
  } catch (err) {
    console.error(`Failed to link module: ${err}`);
  }
}

async function safeSymlink(target, linkPath) {
  try {
    await fs.promises
      .lstat(linkPath)
      .then(async (stats) => {
        if (stats.isSymbolicLink() || stats.isFile() || stats.isDirectory()) {
          await fs.promises.unlink(linkPath);
        }
      })
      .catch(() => { }); // ignore if not exists

    await fs.promises.symlink(target, linkPath);
    console.log(`Linked ${linkPath} -> ${target}`);
  } catch (e) {
    console.error(`Failed to create symlink for ${linkPath}: ${e}`);
  }
}
