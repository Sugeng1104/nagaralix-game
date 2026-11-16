/* Komponen bersama: profil karakter murid yang login. Membaca session dari backend. */
(()=>{'use strict';
const portraits={Auril:'img/karakter/auril1.png',Rivo:'img/karakter/rivo.png',Chandra:'img/karakter/chandra.png'};
const fallback='img/karakter/chandra.png';
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function install(){
 if(document.getElementById('ngl-player-bar'))return;
 const bar=node('div');bar.id='ngl-player-bar';bar.setAttribute('aria-label','Identitas murid yang sedang login');
 const profile=node('button','ngl-player-profile');profile.type='button';profile.setAttribute('aria-expanded','false');profile.setAttribute('aria-label','Lihat profil murid');
 const pic=node('img');pic.alt='Karakter pemain';pic.src=fallback;pic.onerror=()=>{pic.onerror=null;pic.src=fallback};
 const info=node('span'),name=node('div','ngl-player-name','Memuat murid…'),sub=node('div','ngl-player-sub','NARAGALIX');info.append(name,sub);profile.append(pic,info);
 const pop=node('div');pop.id='ngl-player-pop';pop.hidden=true;pop.setAttribute('role','status');bar.append(profile,pop);document.body.prepend(bar);
 profile.addEventListener('click',()=>{pop.hidden=!pop.hidden;profile.setAttribute('aria-expanded',String(!pop.hidden))});
 const token=window.NGL?.getToken?.();if(!token){name.textContent='Belum login';sub.textContent='Silakan masuk';pop.textContent='Masuk melalui halaman login untuk menampilkan karakter.';return}
 if(typeof window.NGL?.api!=='function'){name.textContent='Profil belum tersedia';return}
 window.NGL.api('session',{token}).then(result=>{
  const p=result?.player;if(!p)throw Error('Profil tidak ditemukan');
  name.textContent=p.nama_lengkap||p.username||'Penjelajah';sub.textContent=(p.karakter||'Karakter belum dipilih')+' · Kelas '+(p.kelas||'—');
  pic.src=portraits[p.karakter]||fallback;
  pop.replaceChildren(node('strong','',p.nama_lengkap||p.username||'Penjelajah'),node('div','', 'Karakter: '+(p.karakter||'Belum dipilih')),node('div','', 'Kelas: '+(p.kelas||'—')+(p.rombel?' '+p.rombel:'')),node('div','', 'Sekolah: '+(p.sekolah||'—')));
 }).catch(()=>{name.textContent='Sesi tidak tersedia';sub.textContent='Periksa login';pop.textContent='Data profil belum dapat dimuat. Coba buka ulang halaman.'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
