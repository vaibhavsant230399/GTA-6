import * as THREE from './vendor/three.module.min.js';

// A real, beveled 3D typographic emblem. Rendering is driven by interaction,
// rather than a permanent animation loop, so a stationary page can stay idle.
export function createEmblem(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 30);
  camera.position.z = 4.8;

  // A studio-light environment gives the beveled edges broad reflections.
  const lighting = document.createElement('canvas');
  lighting.width = 1024; lighting.height = 512;
  const ctx = lighting.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#fce8f3'); gradient.addColorStop(.35, '#513a62');
  gradient.addColorStop(.55, '#0d0814'); gradient.addColorStop(1, '#ec90b6');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,1024,512);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(130,25,150,190); ctx.fillRect(780,100,65,300);
  ctx.fillStyle = '#98bdff'; ctx.fillRect(390,200,100,190);
  const environment = new THREE.CanvasTexture(lighting);
  environment.mapping = THREE.EquirectangularReflectionMapping;
  environment.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromEquirectangular(environment);
  scene.environment = envTarget.texture;
  environment.dispose(); pmrem.dispose();

  const material = new THREE.MeshPhysicalMaterial({color:0xf5afce,metalness:.86,roughness:.23,clearcoat:1,clearcoatRoughness:.2,envMapIntensity:1.6});
  const group = new THREE.Group();
  const polygons = [
    [[-1.65,1.15],[-1.03,1.15],[-.49,-.58],[.04,1.15],[.66,1.15],[-.18,-1.15],[-.8,-1.15]],
    [[.89,1.15],[1.48,1.15],[1.48,-1.15],[.89,-1.15]]
  ];
  for (const points of polygons) {
    const shape = new THREE.Shape();
    shape.moveTo(...points[0]);
    for (const point of points.slice(1)) shape.lineTo(...point);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:true,bevelThickness:.055,bevelSize:.05,bevelSegments:4,steps:1,curveSegments:1});
    geometry.translate(.08,0,-.14);
    group.add(new THREE.Mesh(geometry,material));
  }
  scene.add(group);
  const key = new THREE.DirectionalLight(0xffe9f4,4); key.position.set(-3,5,5);scene.add(key);
  const rim = new THREE.DirectionalLight(0x939dff,3);rim.position.set(4,1,-2);scene.add(rim);
  scene.add(new THREE.AmbientLight(0xc9a5c9,.6));
  let width=0,height=0,lost=false;
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;canvas.parentElement.classList.remove('webgl-ready');});
  function render({progress=0,pointerX=0,pointerY=0}={}) {
    if (lost) return;
    const rect = { width: canvas.parentElement.clientWidth, height: canvas.parentElement.clientHeight };
    if (!rect.width || !rect.height) return;
    if (width !== rect.width || height !== rect.height) {
      width=rect.width;height=rect.height;renderer.setSize(width,height,false);
      camera.aspect=width/height;camera.updateProjectionMatrix();
    }
    group.rotation.set(.09 + pointerY*.11 - progress*.16,-.18 + pointerX*.23 + progress*1.75,-.035 + progress*.13);
    group.position.set(0,progress*.1,0);
    group.scale.setScalar(1 + progress*.18);
    renderer.render(scene,camera);
    canvas.parentElement.classList.add('webgl-ready');
  }
  render();
  return {render,dispose(){renderer.dispose();envTarget.dispose();material.dispose();group.children.forEach(mesh=>mesh.geometry.dispose());}};
}
