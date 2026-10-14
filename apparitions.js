import * as T from './vendor/three.module.js';

// Shared geometry; each character owns its materials and animation rig.
const sphere = new T.SphereGeometry(1, 28, 20);
const cylinder = new T.CylinderGeometry(.72, 1, 1, 12);
const box = new T.BoxGeometry(1, 1, 1);
const up = new T.Vector3(0, 1, 0);
const clock = { value: 0 };
let fabricTexture, wingTexture, mistTexture;
function random(seed) {
  return () => { seed = Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5 | 0; return (seed >>> 0) / 4294967296; };
}
function prepareTextures() {
  if (fabricTexture) return;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d'), rand = random(5673);
  c.fillStyle = '#798b84'; c.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    c.strokeStyle = y % 4 ? '#a7b1a650' : '#283d3860'; c.lineWidth = .6;
    c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke();
  }
  for (let x = 0; x < 256; x += 3) {
    c.strokeStyle = '#ced4c438'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 256); c.stroke();
  }
  for (let i = 0; i < 500; i++) { c.fillStyle = '#152c2435'; c.fillRect(rand() * 256, rand() * 256, 1, 3 + rand() * 22); }
  fabricTexture = new T.CanvasTexture(canvas); fabricTexture.colorSpace = T.SRGBColorSpace;
  fabricTexture.wrapS = fabricTexture.wrapT = T.RepeatWrapping;
  const w = document.createElement('canvas'); w.width = w.height = 512; const g = w.getContext('2d');
  g.fillStyle = '#77958b'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = ['#b8cbb180', '#23393255', '#d6d4b53a'][i % 3];
    g.fillRect(rand() * 512, rand() * 512, 2 + rand() * 9, 1 + rand() * 4);
  }
  for (let i = 0; i < 13; i++) {
    g.strokeStyle = '#20393290'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(15, 420); g.quadraticCurveTo(150, 350 - i * 20, 470, 35 + i * 31); g.stroke();
  }
  for (const [x, y, r] of [[320, 180, 64], [290, 355, 38]]) {
    for (const [scale, color] of [[1.2, '#d7cba5'], [1, '#314840'], [.75, '#a3c0a7'], [.48, '#142422'], [.18, '#d4e4bd']]) {
      g.fillStyle = color; g.beginPath(); g.ellipse(x, y, r * scale, r * .8 * scale, -.3, 0, Math.PI * 2); g.fill();
    }
  }
  wingTexture = new T.CanvasTexture(w); wingTexture.colorSpace = T.SRGBColorSpace;
  const m = document.createElement('canvas'); m.width = m.height = 128; const mc = m.getContext('2d');
  const gradient = mc.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#dcf8e8'); gradient.addColorStop(.25, '#bddfc68a'); gradient.addColorStop(1, '#7fb7a000');
  mc.fillStyle = gradient; mc.fillRect(0, 0, 128, 128); mistTexture = new T.CanvasTexture(m);
}

export function createApparition(location, environment) {
  prepareTextures();
  const id = location.id, rand = random(831 + id * 113), root = new T.Group();
  root.name = `haunting-${id}`;
  const rig = { joints: [], veils: [], orbits: [], tendrils: [], wings: [], head: null, materials: [], baseYaw: 0, float: .05 };
  root.userData.rig = rig;
  function material(options = {}, spectral = false) {
    const m = new T.MeshStandardMaterial({ roughness: .88, transparent: true, opacity: 1, ...options });
    m.userData.baseOpacity = m.opacity; rig.materials.push(m);
    if (spectral) {
      m.onBeforeCompile = shader => {
        shader.uniforms.apparitionTime = clock;
        shader.vertexShader = 'uniform float apparitionTime; varying vec3 spectralPosition;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          spectralPosition = position;
          transformed.x += sin(position.y*3.0 + apparitionTime*.7 + ${id.toFixed(1)})*.018;
        `);
        shader.fragmentShader = 'uniform float apparitionTime; varying vec3 spectralPosition;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `#include <opaque_fragment>
          float edge = pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.4);
          gl_FragColor.rgb += vec3(.11,.24,.21)*edge;
          gl_FragColor.a *= .78 + .16*sin(spectralPosition.y*6.0+apparitionTime*.65);
        `);
      };
      m.customProgramCacheKey = () => `apparition-${id}`;
    }
    return m;
  }
  const spectral = material({ color: 0xb5c8bd, emissive: 0x4c746a, emissiveIntensity: .33, opacity: .68, depthWrite: false }, true);
  const cloth = material({ map: fabricTexture, bumpMap: fabricTexture, bumpScale: .024, color: id === 4 ? 0x78888a : 0x94aaa2, opacity: .77, side: T.DoubleSide, depthWrite: false }, true);
  const dark = material({ color: 0x091511, opacity: .85 });
  const eye = material({ color: 0xa3d5bc, emissive: 0xa3d5bc, emissiveIntensity: 1.7, opacity: .85, depthWrite: false });
  const bronze = material({ color: 0x9b9370, metalness: .55, roughness: .56, opacity: .9 });
  const bark = material({ map: environment.bark.map, normalMap: environment.bark.normalMap, color: 0x788276, opacity: .96 });
  function mesh(geometry, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, parent = root) {
    const object = new T.Mesh(geometry, mat); object.position.set(x, y, z); object.scale.set(sx, sy, sz);
    object.castShadow = false; object.receiveShadow = false; parent.add(object); return object;
  }
  function ellipsoid(mat, position, scale, parent = root) { return mesh(sphere, mat, ...position, ...scale, parent); }
  function tube(points, radius, mat, parent = root, taper = false) {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    const geometry = new T.TubeGeometry(curve, Math.max(12, points.length * 7), radius, 8, false);
    if (taper) {
      const p = geometry.attributes.position, segments = geometry.parameters.tubularSegments;
      for (let i = 0; i <= segments; i++) {
        const center = curve.getPointAt(i / segments), scale = 1 - i / segments * .9;
        for (let j = 0; j <= 8; j++) { const k = i * 9 + j; p.setXYZ(k, center.x + (p.getX(k) - center.x) * scale, center.y + (p.getY(k) - center.y) * scale, center.z + (p.getZ(k) - center.z) * scale); }
      }
      geometry.computeVertexNormals();
    }
    return mesh(geometry, mat, 0, 0, 0, 1, 1, 1, parent);
  }
  function bone(a, b, radius, mat = spectral, parent = root) {
    const av = new T.Vector3(...a), bv = new T.Vector3(...b), mid = av.clone().add(bv).multiplyScalar(.5);
    const o = mesh(cylinder, mat, ...mid.toArray(), radius, av.distanceTo(bv), radius, parent);
    o.quaternion.setFromUnitVectors(up, bv.sub(av).normalize()); return o;
  }
  function raggedSkirt(parent, height = 1.9, width = .7, mat = cloth) {
    const vertices = [], uv = [], indices = [], rings = 30, slices = 64;
    for (let j = 0; j <= rings; j++) {
      const f = j / rings;
      for (let i = 0; i <= slices; i++) {
        const a = i / slices * Math.PI * 2, fold = Math.sin(a * 13 + f * .5) * .04 + Math.sin(a * 23) * .012;
        const radius = width * (1 - f * .58) + fold * (1 - f * .3);
        const hem = (Math.sin(a * 7) * .10 + Math.sin(a * 17) * .035) * Math.pow(1 - f, 10);
        vertices.push(Math.sin(a) * radius, f * height + hem, Math.cos(a) * radius * .7);
        uv.push(i / slices * 3, f * 2);
        if (j < rings && i < slices) { let k = j * (slices + 1) + i; indices.push(k, k + 1, k + slices + 1, k + 1, k + slices + 2, k + slices + 1); }
      }
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(vertices, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(indices); geo.computeVertexNormals();
    return mesh(geo, mat, 0, 0, 0, 1, 1, 1, parent);
  }
  function ribbon(parent, x, y, z, width, length, mat = cloth, phase = 0) {
    const geometry = new T.PlaneGeometry(width, length, 4, 20); geometry.translate(0, -length / 2, 0);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { const f = -p.getY(i) / length; p.setZ(i, Math.sin(f * 8 + phase) * .05 + f * f * .16); p.setX(i, p.getX(i) * (1 - f * .4)); }
    geometry.computeVertexNormals(); const o = mesh(geometry, mat, x, y, z, 1, 1, 1, parent);
    rig.veils.push({ object: o, phase, base: o.rotation.z }); return o;
  }
  function hand(parent, x, y, z, side, mat = spectral, raised = false) {
    const h = new T.Group(); h.position.set(x, y, z); parent.add(h);
    ellipsoid(mat, [0, 0, 0], [.06, .10, .035], h);
    for (let j = 0; j < 4; j++) {
      const xx = (j - 1.5) * .029, length = .18 + (j === 1 ? .055 : 0), tip = raised && j === 1 ? .29 : -length;
      tube([[xx, -.05, .005], [xx * 1.16, tip * .55, .028], [xx * 1.3, tip, .065]], .012, mat, h, true);
      ellipsoid(mat, [xx, -.09, .018], [.015, .02, .017], h);
    }
    tube([[side * .046, .01, 0], [side * .092, -.045, .015], [side * .11, -.1, .045]], .018, mat, h, true);
    return h;
  }
  function face(parent, faceless = false) {
    const head = new T.Group(); head.position.set(0, 2.28, .035); parent.add(head);
    const skin = spectral;
    ellipsoid(skin, [0, 0, 0], [.18, .285, .17], head);
    ellipsoid(skin, [0, -.14, .035], [.12, .16, .125], head);
    if (!faceless) {
      for (const side of [-1, 1]) {
        ellipsoid(dark, [side * .073, .045, .143], [.052, .035, .025], head);
        ellipsoid(eye, [side * .073, .05, .164], [.012, .009, .008], head);
        ellipsoid(skin, [side * .11, -.055, .13], [.065, .07, .045], head);
        const brow = ellipsoid(skin, [side * .068, .097, .144], [.072, .02, .024], head); brow.rotation.z = side * -.17;
      }
      ellipsoid(skin, [0, -.005, .171], [.026, .086, .031], head);
      ellipsoid(skin, [0, -.055, .19], [.035, .025, .028], head);
      tube([[-.047, -.127, .137], [0, -.135, .158], [.047, -.127, .137]], .006, dark, head);
    }
    // Strands have separate curved silhouettes, instead of a solid helmet of hair.
    for (let i = 0; i < 20; i++) {
      const a = .25 + i / 19 * 5.75, xx = Math.sin(a) * .18, zz = Math.cos(a) * .16;
      if (zz > .08 && Math.abs(xx) < .14) continue;
      tube([[xx * .65, .23, zz * .7], [xx * 1.05, .03, zz], [xx * 1.2, -.27, zz - .03], [xx * 1.45, -.5 - rand() * .2, zz - .07]], .008 + rand() * .01, cloth, head, true);
    }
    return head;
  }
  function human(parent = root, options = {}) {
    raggedSkirt(parent, 1.9, options.width || .65);
    ellipsoid(cloth, [0, 1.82, 0], [.34, .34, .22], parent);
    const head = face(parent, options.faceless); rig.head = head;
    mesh(new T.TorusGeometry(.17, .035, 8, 32), cloth, 0, 2.05, 0, 1, 1, .7, parent).rotation.x = Math.PI / 2;
    for (let j = 0; j < 7; j++) ellipsoid(bronze, [0, 1.9 - j * .125, .237], [.016, .016, .008], parent);
    for (const side of [-1, 1]) {
      const arm = new T.Group(); arm.position.set(side * .3, 1.95, 0); parent.add(arm);
      bone([0, 0, 0], [side * .16, -.43, .03], .11, cloth, arm);
      ellipsoid(cloth, [side * .16, -.43, .03], [.085, .10, .085], arm);
      const forearm = new T.Group(); forearm.position.set(side * .16, -.43, .03); arm.add(forearm);
      bone([0, 0, 0], [side * .07, -.40, .075], .066, cloth, forearm);
      const h = hand(forearm, side * .07, -.43, .075, side);
      ribbon(arm, side * .10, -.26, -.02, .15, .6, cloth, side);
      rig.joints.push({ object: arm, axis: 'z', base: side * -.09, amplitude: .06, phase: side });
      rig.joints.push({ object: forearm, axis: 'x', base: -.10, amplitude: .11, phase: side + .7 });
      if (options.cradle) { arm.rotation.z = side * .5; forearm.rotation.x = -1.5; rig.joints[rig.joints.length - 2].base = side * .5; rig.joints[rig.joints.length - 1].base = -1.5; }
      if (options.faceless && side === 1) { arm.rotation.z = -.6; forearm.rotation.x = -2.3; rig.joints[rig.joints.length - 2].base = -.6; rig.joints[rig.joints.length - 1].base = -2.3; h.rotation.z = .3; }
    }
    for (let j = 0; j < 10; j++) { const a = j / 10 * 6.28; ribbon(parent, Math.sin(a) * .44, 1.36, Math.cos(a) * .3, .12, 1.4 + rand() * .3, cloth, j).rotation.y = a; }
    return head;
  }
  function lantern(parent, x, y, z, scale = 1) {
    const l = new T.Group(); l.position.set(x, y, z); l.scale.setScalar(scale); parent.add(l);
    ellipsoid(eye, [0, 0, 0], [.07, .12, .07], l);
    for (let i = 0; i < 4; i++) bone([Math.cos(i * 1.57) * .10, -.17, Math.sin(i * 1.57) * .10], [Math.cos(i * 1.57) * .10, .17, Math.sin(i * 1.57) * .10], .012, bronze, l);
    for (const yy of [-.18, .18]) mesh(new T.CylinderGeometry(.14, .14, .025, 16), bronze, 0, yy, 0, 1, 1, 1, l);
    mesh(new T.TorusGeometry(.08, .009, 6, 20, Math.PI), bronze, 0, .21, 0, 1, 1, 1, l);
    const halo = new T.Sprite(new T.SpriteMaterial({map: mistTexture, color: 0x9ddfc6, transparent: true, opacity: .22, depthWrite: false, blending: T.AdditiveBlending})); halo.scale.set(.75, .75, 1); l.add(halo);
    return l;
  }
  function atmosphere() {
    const points = [], phases = [];
    for (let i = 0; i < 55; i++) { const a = rand() * 6.28, r = .4 + rand() * 1.1; points.push(Math.sin(a) * r, rand() * 3.1, Math.cos(a) * r); phases.push(rand() * 6.28); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(points, 3));
    const motes = new T.Points(geo, new T.PointsMaterial({ map: mistTexture, color: 0x9fcfc4, size: .055, transparent: true, opacity: .4, depthWrite: false, blending: T.AdditiveBlending }));
    root.add(motes); rig.motes = motes;
    for (let i = 0; i < 5; i++) {
      const sprite = new T.Sprite(new T.SpriteMaterial({map: mistTexture, color: 0x9ecac1, transparent: true, opacity: .07, depthWrite: false}));
      sprite.position.set((rand() - .5) * .8, .1 + i * .12, (rand() - .5) * .8); sprite.scale.set(2 + i * .2, .4, 1); root.add(sprite);
      rig.orbits.push({ object: sprite, radius: .3, height: sprite.position.y, phase: i, speed: .15 });
    }
  }

  if ([1, 2, 3, 8, 9].includes(id)) {
    // Anatomical branches, a carved face, multiple antler tines, roots and hanging lichen.
    ellipsoid(bark, [0, 2.55, 0], [.36, .93, .24]);
    const head = new T.Group(); head.position.set(0, 3.65, 0); root.add(head); rig.head = head;
    ellipsoid(bark, [0, 0, .02], [.22, .42, .20], head);
    ellipsoid(bark, [0, -.20, .12], [.12, .27, .16], head);
    for (const side of [-1, 1]) {
      ellipsoid(dark, [side * .10, .06, .19], [.071, .083, .025], head);
      ellipsoid(eye, [side * .10, .07, .215], [.016, .024, .009], head);
      tube([[side * .05, .18, .20], [side * .18, .22, .15], [side * .25, .05, .10]], .035, bark, head);
      tube([[side * .12, .30, 0], [side * .43, .8, -.08], [side * .72, 1.1, -.12], [side * 1.05, 1.5, -.16]], .075, bark, head, true);
      for (let j = 0; j < 6; j++) {
        const bx = side * (.26 + j * .115), by = .55 + j * .13;
        tube([[bx, by, -.06], [bx + side * .11, by + .22, -.1], [bx + side * (.16 + rand() * .16), by + .38, -.2]], .034, bark, head, true);
      }
      tube([[side * .19, 2.14, 0], [side * .36, 1.14, -.1], [side * .30, .08, .16]], .15, bark, root, true);
      for (let j = 0; j < 5; j++) tube([[side * .3, .12, .16], [side * (.4 + j * .07), .06, .26 + j * .08], [side * (.6 + j * .08), .02, .4 + j * .1]], .035, bark, root, true);
      const arm = new T.Group(); arm.position.set(side * .31, 3.18, 0); root.add(arm);
      tube([[0, 0, 0], [side * .36, -.84, -.1], [side * .54, -1.70, .13]], .13, bark, arm, true);
      hand(arm, side * .54, -1.75, .13, side, bark).scale.setScalar(1.6);
      rig.joints.push({object: arm, axis: 'z', base: 0, amplitude: .025, phase: side});
      for (let j = 0; j < 8; j++) tube([[0, 2.1 + j * .14, .23], [side * .3, 2.15 + j * .14, .19], [side * .37, 2.3 + j * .14, -.03]], .035, bark);
    }
    for (let i = 0; i < 22; i++) {
      const xx = (rand() - .5) * .65, yy = 2 + rand() * 1.4;
      tube([[xx, yy, .25], [xx + .07, yy - .2, .30], [xx - .035, yy - .45 - rand() * .3, .31]], .008, cloth);
    }
    if (id === 8) for (let i = 0; i < 28; i++) ribbon(root, (rand() - .5) * .9, 2 + rand() * 1.1, -.2, .11, .5 + rand() * .5, dark, i).rotation.z = (rand() - .5) * 1.6;
    root.scale.setScalar(id === 9 ? 1.5 : 1.1);
  } else if (id === 6) {
    for (let i = 0; i < 3; i++) {
      const figure = new T.Group(); root.add(figure); human(figure); figure.scale.setScalar(.28);
      rig.orbits.push({object: figure, radius: 1.8, height: .6 + i * .35, phase: i * 2.094, speed: .18});
      const halo = new T.Sprite(new T.SpriteMaterial({map: mistTexture, color: 0x92efd1, opacity: .55, transparent: true, depthWrite: false, blending: T.AdditiveBlending})); halo.scale.set(2.5, 3.5, 1); halo.position.y = 1.2; figure.add(halo);
    }
    rig.float = .12;
  } else if ([5, 14, 18].includes(id)) {
    const wet = material({map: environment.stone.map, normalMap: environment.stone.normalMap, color: 0x516c62, roughness: .32, metalness: .12, opacity: .86});
    ellipsoid(wet, [0, .9, 0], [.66, .83, .50]);
    for (const side of [-1, 1]) {
      ellipsoid(wet, [side * .32, 1.3, .34], [.23, .4, .18]);
      ellipsoid(dark, [side * .24, 1.43, .49], [.13, .10, .035]);
      ellipsoid(eye, [side * .24, 1.45, .53], [.055, .014, .008]);
      tube([[side * .13, 1.25, .5], [side * .22, 1.0, .53], [side * .08, .87, .51]], .02, dark);
    }
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 6.28, tentacle = new T.Group(); tentacle.rotation.y = a; root.add(tentacle);
      tube([[0, .25, 0], [0, .5, 1.2], [0, 1.4, 2], [0, 1.8, 2.6], [0, 1.5, 2.9]], .16, wet, tentacle, true);
      for (let j = 0; j < 8; j++) ellipsoid(spectral, [.10, .5 + j * .14, 1.1 + j * .2], [.035, .05, .035], tentacle);
      rig.tendrils.push({object: tentacle, phase: i, base: a});
    }
    for (let j = 0; j < 10; j++) ribbon(root, (rand() - .5) * .8, 1.5 + rand() * .3, .1, .05, 1.3, cloth, j);
    if (id === 5) lantern(root, 1.1, 1.7, .8);
    if (id === 18) root.scale.set(1.5, .65, 1.5);
  } else if (id === 20) {
    ellipsoid(spectral, [0, 1.1, 0], [.34, .47, .9]);
    ellipsoid(spectral, [0, 1.45, .63], [.29, .5, .4]);
    const head = new T.Group(); head.position.set(0, 1.8, .9); root.add(head); rig.head = head;
    ellipsoid(spectral, [0, 0, 0], [.25, .29, .33], head);
    ellipsoid(spectral, [0, -.08, .37], [.14, .13, .29], head);
    ellipsoid(dark, [0, -.04, .60], [.1, .065, .06], head);
    for (const side of [-1, 1]) {
      const ear = mesh(new T.ConeGeometry(.13, .43, 12), spectral, side * .19, .34, -.10, 1, 1, .6, head); ear.rotation.z = side * -.15;
      ellipsoid(dark, [side * .195, .05, .21], [.075, .06, .025], head);
      ellipsoid(eye, [side * .195, .058, .235], [.034, .014, .016], head);
      for (const z of [-.64, .59]) {
        const leg = new T.Group(); leg.position.set(side * .24, 1.0, z); root.add(leg);
        tube([[0, 0, 0], [side * .03, -.44, -.14], [side * .02, -.86, .08]], .075, spectral, leg);
        ellipsoid(spectral, [0, -.9, .18], [.09, .055, .15], leg);
        for (let j = 0; j < 3; j++) ellipsoid(dark, [(j - 1) * .038, -.91, .3], [.009, .012, .03], leg);
        rig.joints.push({object: leg, axis:'x', base:0, amplitude:.045, phase:z+side});
      }
    }
    const tail = tube([[0, 1.2, -.7], [.1, 1.25, -1.25], [.18, .85, -1.8], [.22, .6, -2]], .17, spectral, root, true);
    rig.joints.push({object:tail,axis:'y',base:0,amplitude:.09,phase:1});
    for (let j = 0; j < 65; j++) {
      const a = rand() * 6.28, zz = (rand() - .5) * 1.5;
      tube([[Math.sin(a)*.3,1.15+Math.cos(a)*.4,zz], [Math.sin(a)*.39,1.1+Math.cos(a)*.5,zz-.14]], .017, cloth, root, true);
    }
  } else {
    const head = human(root, { faceless: id === 0, cradle: id === 4, width: id === 4 ? .82 : .62 });
    if ([0, 4, 10, 23].includes(id)) {
      // A fitted hood and overlapping veil strips leave a deep opening around the face.
      for (let i = 0; i < 17; i++) {
        const a = (i / 16 - .5) * Math.PI * 1.6;
        const xx = Math.sin(a) * .27, yy = Math.cos(a) * .28;
        ribbon(head, xx, yy + .1, -.06, .10, .75 + rand() * .35, cloth, i).rotation.z = -a * .18;
      }
    }
    if (id === 4) {
      const bundle = ellipsoid(cloth, [0, 1.37, .39], [.43, .16, .16]); bundle.rotation.z = .18;
      for (let j = 0; j < 6; j++) tube([[-.35+j*.12,1.25,.40],[-.35+j*.12,1.42,.54],[-.35+j*.12,1.52,.4]], .009, spectral);
    }
    if (id === 12) {
      cloth.color.setHex(0x8d8565); cloth.opacity = cloth.userData.baseOpacity = .96;
      const sack = material({map:fabricTexture,bumpMap:fabricTexture,bumpScale:.06,color:0xafa180,opacity:.94});
      head.traverse(o=>{if(o.isMesh&&o.material===spectral)o.material=sack;});
      const hat = mesh(new T.ConeGeometry(.34,.38,20), dark, 0, 2.76, 0); hat.rotation.z=-.1;
      mesh(new T.CylinderGeometry(.4,.43,.035,24),dark,0,2.57,0);
      for(let j=0;j<7;j++)bone([-.075+j*.025,2.13,.20],[-.061+j*.025,2.18,.21],.005,dark);
      for(let side of [-1,1])for(let j=0;j<13;j++)tube([[side*.55,1.2,.07],[side*(.61+rand()*.13),.95-rand()*.12,.12]],.006,bronze);
      mesh(box, bark, 0, 1.8, -.1, 2.6, .07, .08);
    }
    if ([11, 13, 17].includes(id)) {
      ribbon(root, 0, 1.72, .255, .48, .96, cloth, .4);
      for (let side of [-1,1]) tube([[side*.22,2,.1],[side*.22,1.7,.25],[side*.22,1.35,.26]],.023,bronze);
      if(id===17){mesh(new T.SphereGeometry(.235,24,14,0,6.28,0,Math.PI/2),bronze,0,2.46,.02);lantern(root,-.62,.81,.15);mesh(box,cloth,.32,1.1,-.12,.25,.32,.16);}
      if(id===13)mesh(new T.CylinderGeometry(.23,.25,.14,20),cloth,0,2.53,0);
      if(id===11){const basket=mesh(new T.CylinderGeometry(.27,.2,.32,20,1,true),bronze,-.64,.75,.18);for(let j=0;j<8;j++)mesh(new T.TorusGeometry(.24,.009,5,24),dark,-.64,.6+j*.04,.18).rotation.x=Math.PI/2;lantern(root,.64,.81,.15);}
    }
    if (id === 19) {
      const membrane = material({map:wingTexture,color:0xd0d4be,side:T.DoubleSide,opacity:.79,emissive:0x365547,emissiveIntensity:.2,depthWrite:false},true);
      for(const side of [-1,1]){
        const wing = new T.Group();wing.position.set(side*.15,1.9,-.14);root.add(wing);
        const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(side*.7,1.7,side*2.1,1.9,side*1.85,.4);shape.bezierCurveTo(side*1.7,-.2,side*1.1,-.6,side*.3,-.8);shape.bezierCurveTo(side*1.5,-1.6,side*.9,-2.0,0,-.7);shape.closePath();
        const geometry=new T.ShapeGeometry(shape,32),p=geometry.attributes.position,uv=geometry.attributes.uv;
        for(let i=0;i<p.count;i++)uv.setXY(i,Math.abs(p.getX(i))/2,(p.getY(i)+2)/4);
        mesh(geometry,membrane,0,0,0,1,1,1,wing);
        for(let j=0;j<9;j++)tube([[0,-.3,0],[side*.7,.2+j*.1,.035],[side*(1.1+j*.065),.2+j*.13,.02]],.008,bronze,wing);
        rig.wings.push({object:wing,side});
      }
      for(let side of [-1,1])tube([[side*.07,2.52,0],[side*.23,2.85,.08],[side*.37,2.93,.05]],.009,bronze);
    }
    if (id === 22) { root.scale.setScalar(.59); ribbon(root,0,2.0,.24,.35,.24,bronze); }
    if (id === 21 || id === 7) {
      // A whole company, with distinct heights and positions rather than a single stand-in.
      for(let i=0;i<3;i++){
        const figure=new T.Group();figure.position.set(Math.cos(i*2.094)*2.1,0,Math.sin(i*2.094)*2.1-1.1);figure.scale.setScalar(.82+i*.09);root.add(figure);human(figure);
      }
    }
    if (id === 16) { root.scale.set(1.15,1.4,1.05); spectral.color.setHex(0x344a46); for(let side of [-1,1])ellipsoid(eye,[side*.09,2.35,.20],[.026,.018,.025]); }
    if (id === 15) { root.scale.z=-1; rig.baseYaw=Math.PI; }
    if (id === 23 || id === 0) lantern(root,-.62,.75,.08);
  }
  atmosphere();
  root.userData.lookHeight = [1,2,3,8,9].includes(id) ? 3.2 * root.scale.y : id===20 ? 1.2 : 1.4 * root.scale.y;
  // Cloned aura materials are included in fading, too.
  root.traverse(o=>{if(o.material&&!rig.materials.includes(o.material)){o.material.userData.baseOpacity=o.material.opacity;rig.materials.push(o.material);}});
  return root;
}

export function animateApparition(root, time, camera, reduced, fade = 1) {
  const rig = root.userData.rig, t = reduced ? 0 : time;
  clock.value = t;
  root.position.y = root.userData.baseY + (reduced ? 0 : Math.sin(t * .8 + root.userData.id) * rig.float);
  // Bodies hold their place; only the neck follows a passerby, within human limits.
  root.rotation.y = rig.baseYaw + (reduced ? 0 : Math.sin(t*.16+root.userData.id)*.035);
  if(rig.head){const angle=Math.atan2(camera.position.x-root.position.x,camera.position.z-root.position.z)-rig.baseYaw;rig.head.rotation.y=T.MathUtils.clamp(Math.atan2(Math.sin(angle),Math.cos(angle)),-.5,.5)*.65;rig.head.rotation.z=reduced?0:Math.sin(t*.37+root.userData.id)*.06;}
  for(const joint of rig.joints)joint.object.rotation[joint.axis]=joint.base+(reduced?0:Math.sin(t*.8+joint.phase)*joint.amplitude);
  for(const v of rig.veils){v.object.rotation.z=v.base+(reduced?0:Math.sin(t*.7+v.phase)*.09);v.object.rotation.x=reduced?0:Math.sin(t*.53+v.phase)*.11;}
  for(const w of rig.wings)w.object.rotation.y=w.side*(.25+(reduced?0:Math.sin(t*1.15)*.42));
  for(const a of rig.tendrils){a.object.rotation.y=a.base+(reduced?0:Math.sin(t*.46+a.phase)*.1);a.object.rotation.x=reduced?0:Math.sin(t*.7+a.phase)*.06;}
  for(const a of rig.orbits){a.object.position.x=Math.cos(t*a.speed+a.phase)*a.radius;a.object.position.z=Math.sin(t*a.speed+a.phase)*a.radius;a.object.position.y=a.height+(reduced?0:Math.sin(t*.7+a.phase)*.09);}
  if(rig.motes)rig.motes.rotation.y=t*.12;
  for(const m of rig.materials)m.opacity=m.userData.baseOpacity*fade;
}
