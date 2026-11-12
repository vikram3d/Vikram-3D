import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
const root=resolve('dist');
function htmlFiles(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?htmlFiles(join(directory,entry.name)):entry.name.endsWith('.html')?[join(directory,entry.name)]:[]);}
const files=htmlFiles(root),errors=[],titles=new Set();
for(const file of files){
  const html=readFileSync(file,'utf8'),name=relative(root,file);
  if((html.match(/<h1\b/g)||[]).length!==1)errors.push(name+': expected one primary heading');
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  if(!title||titles.has(title))errors.push(name+': missing or duplicated page title');
  titles.add(title);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)errors.push(name+': duplicated element IDs');
  for(const [,url] of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(url))continue;
    if(url.startsWith('#')){if(!ids.includes(url.slice(1)))errors.push(name+': broken fragment '+url);continue;}
    const path=url.split(/[?#]/)[0];
    const target=path.startsWith('/')?join(root,path.slice(1)):resolve(file,'..',path);
    const actual=path.endsWith('/')?join(target,'index.html'):target;
    if(!existsSync(actual))errors.push(name+': missing route or asset '+url);
  }
}
if(files.length!==11)errors.push('Expected eleven generated pages, found '+files.length);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Verified all 11 pages: titles, headings, IDs, internal links, fragments, and media paths.');
