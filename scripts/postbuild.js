import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "../public");

const distDir = path.join(__dirname, "../dist");

const filesToCopy = ["404.html", ".nojekyll"];

filesToCopy.forEach((file) => {
  const source = path.join(publicDir, file);
  const destination = path.join(distDir, file);

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`Copied ${file} to ${distDir}`);
  } else {
    console.error(`File ${file} does not exist in ${publicDir}`);
  }
});
