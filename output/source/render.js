const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{
 const [,,dir,mode,out,...rest]=process.argv;
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 p.on('console',m=>console.log('PAGE',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+path.resolve(dir,'index.html'));await p.evaluate(()=>window.ready);
 if(mode==='stills'){for(const t of rest){await p.evaluate(t=>seek(t),+t);await p.screenshot({path:`${out}/s_${t}.png`});}}
 else{const N=Math.round(+rest[0]*30);
  const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','png','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
  for(let f=0;f<N;f++){await p.evaluate(t=>seek(t),f/30);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%60==0)console.log('frame',f,'/',N);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));}
 await b.close();})();
