import {readFileSync,writeFileSync,mkdirSync,readdirSync,cpSync,rmSync,existsSync} from 'node:fs';
import {resolve,dirname,join,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'.github-pages-output');
const base='/Vikram-3D/', origin='https://vikram3d.github.io';
if(dirname(output)!==root || !output.endsWith('.github-pages-output'))throw Error('Unexpected output location');
console.log('Rebuilding generated output: '+output);
rmSync(output,{recursive:true,force:true});mkdirSync(output,{recursive:true});cpSync(join(root,'dist'),output,{recursive:true});
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
const files=walk(output);
for(const file of files){
 const rel=relative(output,file).replaceAll('\\','/');
 if(!['.html','.css','.xml','.txt'].includes(extname(file)) && !['app.js','cartridge.js'].includes(rel))continue;
 let s=readFileSync(file,'utf8');
 if(file.endsWith('.html')){
  s=s.replace(/\b(src|href|poster|data-preview-src)="\/(?!\/)/g,(_,attribute)=>attribute+'="'+base)
   .replace('"three":"/vendor/','"three":"'+base+'vendor/')
   .replaceAll("location.pathname === '/'",'location.pathname === '+JSON.stringify(base))
   .replaceAll("location.pathname === '/index.html'",'location.pathname === '+JSON.stringify(base+'index.html'));
 }
 if(file.endsWith('.css'))s=s.replace(/url\((['"]?)\/(?!\/)/g,(_,quote)=>'url('+quote+base);
 if(rel==='app.js')s=s.replace("location.pathname === '/'",'location.pathname === '+JSON.stringify(base)).replace("location.replace('/' + legacy + '/')",'location.replace('+JSON.stringify(base)+" + legacy + '/')");
 if(rel==='cartridge.js')s=s.replaceAll("= '/' +",'= '+JSON.stringify(base)+' +').replace("= '/projects/' +",'= '+JSON.stringify(base+'projects/')+' +');
 s=s.replaceAll('https://vikram-form-motion.vikram700405.chatgpt.site',origin+base.slice(0,-1));
 writeFileSync(file,s);
}
// Version scripts and styles so an earlier Pages cache cannot retain old routes.
for(const file of files.filter(f=>f.endsWith('.html'))){
 let s=readFileSync(file,'utf8');
 s=s.replace(/\b(src|href)="([^"]+\.(?:js|css))"/g,(match,attribute,url)=>{
  if(!url.startsWith(base))return match;
  const asset=join(output,url.slice(base.length));
  if(!existsSync(asset))throw Error('Missing versioned asset: '+url);
  const version=createHash('sha256').update(readFileSync(asset)).digest('hex').slice(0,12);
  return attribute+'="'+url+'?v='+version+'"';
 });
 writeFileSync(file,s);
}
writeFileSync(join(output,'.nojekyll'),'');
const pages=files.filter(f=>f.endsWith('.html')), errors=[];
for(const file of pages){
 const s=readFileSync(file,'utf8');
 for(const [,attribute,url] of s.matchAll(/\b(src|href|poster|data-preview-src)="([^"]+)"/g)){
  if(!url.startsWith('/')||url.startsWith('//'))continue;
  if(!url.startsWith(base)){errors.push(relative(output,file)+': unprefixed '+attribute+' '+url);continue;}
  const path=url.slice(base.length).split(/[?#]/)[0];
  if(!existsSync(join(output,path,path.endsWith('/')||!path?'index.html':'')))errors.push('Missing '+url);
 }
}
if(pages.length!==11)errors.push('Expected 11 pages');
if(errors.length)throw Error(errors.join('\n'));
console.log('Verified '+pages.length+' GitHub Pages routes, media, styles and navigation paths.');
