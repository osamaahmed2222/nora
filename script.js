console.clear();

/* SETUP */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CONTROLS */
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);

/* PARTICLES */
// Create a global gsap timeline that contains all tweens
const tl = gsap.timeline({
  repeat: -1,
  yoyo: true
});

const textCanvas = document.createElement("canvas");
textCanvas.width = 600;
textCanvas.height = 552;
const textContext = textCanvas.getContext("2d");
if (!textContext) {
  throw new Error("Unable to create a canvas context for the particle text.");
}
textContext.font = "bold 200px Arial";
textContext.textAlign = "center";
textContext.textBaseline = "middle";
textContext.fillStyle = "#000";
textContext.fillText("Nora", textCanvas.width / 2, textCanvas.height / 2);

const imageData = textContext.getImageData(0, 0, textCanvas.width, textCanvas.height);
const vertices = [];
for (let y = 0; y < textCanvas.height; y += 3) {
  for (let x = 0; x < textCanvas.width; x += 3) {
    const alpha = imageData.data[(y * textCanvas.width + x) * 4 + 3];
    if (alpha < 128) continue;

    const vector = new THREE.Vector3(x, -y, 0);
    vector.x += (Math.random() - 0.5) * 2;
    vector.y += (Math.random() - 0.5) * 2;
    vector.z += (Math.random() - 0.5) * 70;
    vertices.push(vector);
    tl.from(vector, {
      x: textCanvas.width / 2,
      y: -textCanvas.height / 2,
      z: 0, // Center of the scene
      ease: "power2.inOut",
      duration: "random(2, 5)" // Random duration
    }, vertices.length * 0.002
    );
  }
}
const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
const material = new THREE.PointsMaterial( { color: 0xee5283, blending: THREE.AdditiveBlending, size: 3 } );
const particles = new THREE.Points(geometry, material);
// Offset the particles in the scene based on the viewbox values
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

gsap.fromTo(scene.rotation, {
  y: -0.2
}, {
  y: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut',
  duration: 3
});

/* RENDERING */
function render() {
  requestAnimationFrame(render);
  // Update the geometry from the animated vertices
  geometry.setFromPoints(vertices);
  renderer.render(scene, camera);
}

/* EVENTS */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

requestAnimationFrame(render);