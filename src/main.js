import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#07090e');
scene.fog = new THREE.FogExp2('#07090e', 0.035);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, 2.8, 13);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

scene.add(new THREE.HemisphereLight(0x9bbdce, 0x11131c, 1.3));
const key = new THREE.PointLight(0x00bfff, 32, 35); key.position.set(3, 5, 5); scene.add(key);
const rim = new THREE.PointLight(0x718cff, 25, 30); rim.position.set(-5, 3, -12); scene.add(rim);

const world = new THREE.Group(); scene.add(world);
const metal = new THREE.MeshStandardMaterial({ color: 0x252c35, metalness: 0.88, roughness: 0.24 });
const dark = new THREE.MeshStandardMaterial({ color: 0x090d13, metalness: 0.65, roughness: 0.32 });
const cyan = new THREE.MeshStandardMaterial({ color: 0x00cfff, emissive: 0x007d9c, emissiveIntensity: 2.2, metalness: 0.4, roughness: 0.22 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0x8bcce0, metalness: 0.3, roughness: 0.08, transmission: 0.25, transparent: true, opacity: 0.32 });

function box(w,h,d,mat,x,y,z,parent=world) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z); parent.add(mesh); return mesh;
}
function ring(radius,tube,mat,x,y,z,parent=world) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,96),mat);
  mesh.position.set(x,y,z); parent.add(mesh); return mesh;
}

// Reflective floor and architectural rails.
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshStandardMaterial({color:0x080c12,metalness:0.72,roughness:0.3}));
floor.rotation.x = -Math.PI/2; floor.position.y = -0.06; world.add(floor);
for(let i=-5;i<=5;i++){
  box(0.018,0.015,55,cyan,i*1.5,0.01,-17);
  box(45,0.018,0.018,cyan,0,0.015,-17+i*3);
}

// Hero portal, repeated architectural frames create depth.
const portal = new THREE.Group(); portal.position.set(0,2.4,-5); world.add(portal);
for(let i=0;i<3;i++){
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2+i*0.5,5.3+i*0.5,0.16), metal);
  frame.position.z = -i*0.55; portal.add(frame);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(4.92+i*0.5,5.02+i*0.5,0.05), dark);
  inner.position.z = -i*0.55-0.1; portal.add(inner);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.035,4.9+i*0.5,0.04),cyan);
  light.position.set(-2.48-i*0.25,0,-i*0.55-0.14); portal.add(light);
  const light2=light.clone(); light2.position.x=-light.position.x; portal.add(light2);
}
ring(1.55,0.025,cyan,0,0,-0.45,portal).rotation.x=Math.PI/2;

// Floating glass slabs and distant towers.
const floaters=[];
for(let i=0;i<18;i++){
  const g=new THREE.Group();
  const w=0.65+Math.random()*1.5, h=0.7+Math.random()*2.1;
  const slab=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.08),i%3===0?glass:metal);
  g.add(slab);
  const edge=new THREE.Mesh(new THREE.BoxGeometry(w*0.88,0.018,0.1),cyan);
  edge.position.y=h*0.36; g.add(edge);
  g.position.set((Math.random()-0.5)*17,1+Math.random()*4,-8-Math.random()*30);
  g.rotation.y=(Math.random()-0.5)*0.35; world.add(g); floaters.push(g);
}
for(let i=0;i<12;i++){
  const tower=box(0.55+Math.random()*1.2,2+Math.random()*6,0.5, i%2?dark:metal, (Math.random()-0.5)*22, 1,-20-Math.random()*25);
  tower.position.y=tower.geometry.parameters.height/2-0.05;
}

// Particle field.
const count = innerWidth < 700 ? 450 : 1000;
const positions = new Float32Array(count*3);
for(let i=0;i<count;i++){positions[i*3]=(Math.random()-0.5)*35;positions[i*3+1]=Math.random()*12;positions[i*3+2]=-Math.random()*45;}
const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const pMat=new THREE.PointsMaterial({color:0x62dfff,size:0.035,transparent:true,opacity:0.7});
const particles=new THREE.Points(pGeo,pMat);scene.add(particles);

// Camera journey: each content section occupies a distinct camera waypoint.
const cameraPath = [
  {x:0,y:2.8,z:13, rx:0, ry:0},
  {x:0,y:2.5,z:1, rx:0, ry:0},
  {x:-3,y:2.4,z:-7, rx:0, ry:-0.12},
  {x:2.5,y:2.8,z:-14, rx:0, ry:0.12},
  {x:0,y:3,z:-23, rx:0, ry:0},
  {x:0,y:2.6,z:-32, rx:0, ry:0}
];
const cameraState={...cameraPath[0]};
const sections=[...document.querySelectorAll('.panel')];
const progressBar=document.querySelector('.progress i');
sections.forEach((section,index)=>{
  ScrollTrigger.create({
    trigger:section,start:'top top',end:'bottom top',scrub:1,
    onUpdate:self=>{
      const next=cameraPath[Math.min(index+1,cameraPath.length-1)];
      const prev=cameraPath[Math.min(index,cameraPath.length-1)];
      const t=self.progress;
      cameraState.x=gsap.utils.interpolate(prev.x,next.x,t);
      cameraState.y=gsap.utils.interpolate(prev.y,next.y,t);
      cameraState.z=gsap.utils.interpolate(prev.z,next.z,t);
      cameraState.ry=gsap.utils.interpolate(prev.ry,next.ry,t);
    }
  });
});
ScrollTrigger.create({trigger:'body',start:'top top',end:'bottom bottom',onUpdate:s=>progressBar.style.width=`${s.progress*100}%`});

const menu=document.querySelector('.menu-toggle');
menu.addEventListener('click',()=>document.querySelector('.topbar nav').classList.toggle('open'));
document.querySelectorAll('.topbar nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar nav').classList.remove('open')));
document.querySelector('#year').textContent=new Date().getFullYear();

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  camera.position.x += (cameraState.x-camera.position.x)*0.055;
  camera.position.y += (cameraState.y-camera.position.y)*0.055;
  camera.position.z += (cameraState.z-camera.position.z)*0.055;
  camera.rotation.y += (cameraState.ry-camera.rotation.y)*0.04;
  portal.rotation.y=Math.sin(t*0.35)*0.025;
  floaters.forEach((o,i)=>{o.position.y+=Math.sin(t*0.7+i)*0.0009;o.rotation.z=Math.sin(t*0.25+i)*0.025;});
  particles.rotation.y=t*0.008;
  renderer.render(scene,camera);
}
animate();

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
  ScrollTrigger.refresh();
});

window.addEventListener('load',()=>{
  gsap.to('#loader',{autoAlpha:0,duration:0.8,delay:0.35,onComplete:()=>document.querySelector('#loader').remove()});
  gsap.from('.hero h1',{y:55,opacity:0,duration:1.1,ease:'power4.out',delay:0.3});
  gsap.from('.hero-copy,.hero-actions,.eyebrow',{y:22,opacity:0,stagger:0.12,duration:0.8,delay:0.6});
  gsap.utils.toArray('.content-wrap').forEach(el=>{
    gsap.from(el,{y:65,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 78%'}});
  });
});
