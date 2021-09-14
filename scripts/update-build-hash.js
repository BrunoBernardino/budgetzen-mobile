const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }),
);

const newBuildHash = Date.now().toString(36);

packageJson.build = newBuildHash;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), {
  encoding: 'utf-8',
});

console.log(
  `\n\n## UPDATED BUILD HASH in package.json to "${packageJson.build}"\n\n`,
);
