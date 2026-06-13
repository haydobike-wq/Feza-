const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const filesToCopy = ["index.html", "style.css", "app.js"];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`${file} not found, skipping.`);
  }
}

console.log("Static build completed.");
