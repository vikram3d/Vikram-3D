import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
const root = new URL('../',import.meta.url);
const original = readFileSync(new URL('dist/index.html',root),'utf8');
mkdirSync(new URL('content/sections/',root),{recursive:true});
for(const id of ['home','work','playground','about','contact']){
  const match = original.match(new RegExp('<section\\b[^>]*\\bid="'+id+'"[\\s\\S]*?<\\/section>'));
  if(!match)throw new Error('Missing original section '+id);
  const target = new URL('content/sections/'+id+'.html',root);
  if(!existsSync(target))writeFileSync(target,match[0]+'\n');
}
for(const [filename,pattern] of [['head.html',/<head>[\s\S]*?<\/head>/],['explorer-dialog.html',/<dialog id="explorer-dialog"[\s\S]*?<\/dialog>/]]){
  const target = new URL('content/sections/'+filename,root);
  if(!existsSync(target))writeFileSync(target,original.match(pattern)[0]+'\n');
}
const dataUrl=new URL('content/projects.json',root);
const projects=JSON.parse(readFileSync(dataUrl,'utf8'));
if(!projects.some(p=>p.id==='graphics-card'))projects.unshift({id:'graphics-card',title:'Graphics Card',category:'product',label:'3D PRODUCT ANIMATION',summary:'A product brought into focus through form, light, and movement.',description:'A cinematic graphics-card render exploring the product through close-up detail, changing camera angles, and dramatic lighting.',poster:'assets/graphics-card-cover.jpg',alt:'A graphics card in dramatic lighting against a red atmospheric background',clips:[{label:'Product film',src:'assets/graphics-card-render.mp4',poster:'assets/graphics-card-cover.jpg',duration:'00:24',format:'16:9'}]});
writeFileSync(dataUrl,JSON.stringify(projects,null,2)+'\n');
console.log('Prepared source templates and seven project records.');
