import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import ora from "ora";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const spinner = ora('Generating snapshots...').start();
const pagesDir = path.resolve(__dirname, "..", "pages");
const snapshotsDir = path.resolve(__dirname, "..", "public","snapshots");

const checkSnapShotIsExist = p=> fs.existsSync(path.join(snapshotsDir,`${p}.png`));

const CONFIG_FILE = path.join(snapshotsDir,`index.js`)

const wait = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t);
  });
};

// let pages = fs.readdirSync(pagesDir);
// pages = pages
//   .filter((p) => !p.startsWith("_") && p !== "index.tsx" && p.endsWith(".tsx"))
//   .map((p) => ({path:p.substr(0, p.length - 4),delay:2}));

// console.log(pages)
// return;

const pages = [
  { path: 'box', delay: 1000 },
  { path: 'first_demo', delay: 1000 },
  { path: 'webgl_animation_keyframes', delay: 4000 },
  { path: 'webgl_animation_skinning_blending', delay: 3000 },
  { path: 'webgl_geometry_cube', delay: 1000 },
  { path: 'webgl_camera_array', delay: 1000 },
  { path: 'webgl_decals', delay: 2000 }
];

(async () => {
  const browser = await puppeteer.launch({
    headless:true,
  });

  const page = await browser.newPage();
  page.setViewport({
    width: 250,
    height: 200,
    deviceScaleFactor:2
  });
  
  await pages.map(({path,delay}) => {
    return async function () {
      try {
        if(checkSnapShotIsExist(path)){
          spinner.info(`${path} already exist!`);
          return;
        }
        
        await page.goto(`http://127.0.0.1:3000/${path}?hideGUI=true`);
        await wait(delay);
        const png = await page.screenshot({
          // clip: { x: 0, y: 0, width: 500, height: 400 },
          path: `public/snapshots/${path}.png`,
        });
        spinner.succeed(`${path} generate success!`);
      } catch (e) {
        spinner.fail(`${path} generate fail!:${e.message}`);
        // console.log(path, "generate error", e);
      }
    };
  }).reduce((obj,cb)=>{
    return obj.then(cb);
  },Promise.resolve());

  const config = pages.map(item=>item.path);
  fs.writeFileSync(CONFIG_FILE,`const config = ${JSON.stringify(config)};export default config`)

  await page.close();
  await browser.close();
  spinner.stopAndPersist({
    symbol:'🎉', 
    text:'Finished generating screenshots!'
  });

})();
