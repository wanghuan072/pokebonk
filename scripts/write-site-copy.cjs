// Canonical copy lives in the content JSON and tdk.js; do not regenerate it from old literals.
const {getTdk}=require('./lib/page-fingerprints.cjs');
const pages=require('../src/data/content/pages.json');
for(const [route,seo] of Object.entries(getTdk())){
 if(!pages[route]?.h1||!pages[route]?.description)throw new Error('Missing introduction: '+route);
 if(seo.title.length<40||seo.title.length>60||seo.description.length<140||seo.description.length>160)throw new Error('Invalid TDK length: '+route);
}
console.log('Canonical page introductions and TDK verified; no files overwritten.');
