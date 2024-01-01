import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import * as dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js';
import { ImprovedNoise } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/math/ImprovedNoise.js";

// Set up scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB); // Light blue background color
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// Initialize OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or autorotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Generate terrain using Perlin noise
const terrainSize = 60;
const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, 100, 100);

// Initial color for the mountain
let mountainColor = 0x8B4513;

const material = new THREE.MeshPhongMaterial({
    color: mountainColor,
    flatShading: true,
    side: THREE.DoubleSide
});
material.shininess = 0; // Set shininess to 0 to make it look less glossy

const terrain = new THREE.Mesh(geometry, material);
terrain.castShadow = true; // Enable shadow casting for the terrain
terrain.receiveShadow = true; // Enable shadow receiving for the terrain
scene.add(terrain);

// Remove the existing material
terrain.material.dispose();

// Set the new material
terrain.material = material;

// Apply Perlin noise to the terrain
const perlin = new ImprovedNoise();
let originalTerrainVertices = geometry.vertices.map(v => v.clone()); // Store original vertices
let noiseStrength = 5; // Initial value for noise strength
let isPaused = false; // Initial pause state
material.wireframe = false;

function updateTerrain() {
    for (let i = 0; i < geometry.vertices.length; i++) {
        const vertex = geometry.vertices[i];
        const originalVertex = originalTerrainVertices[i];
        const value = perlin.noise(originalVertex.x / noiseStrength, originalVertex.y / noiseStrength, 1);
        vertex.z = value * noiseStrength;
    }
    geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
}


updateTerrain(); // Initial render

// Position the camera
camera.position.z = 30;

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light (simulating the sun)
const sunDistance = 12;
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(0, sunDistance, 0); // Adjust the position of the "sun"
sunLight.castShadow = false; // Enable shadow casting for the light
scene.add(sunLight);

// Set up shadow properties for the sunlight
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;

// Add rotation to the terrain
terrain.rotation.x = -Math.PI / 2; // Rotate the terrain to be horizontal

// Center the terrain
terrain.position.set(0, -10, -10);

// Slider for noise strength
const noiseStrengthSlider = document.getElementById('noiseStrengthSlider');
noiseStrengthSlider.addEventListener('input', function () {
    noiseStrength = parseFloat(noiseStrengthSlider.value);
    updateTerrain();
});

// Color picker for mountain color
const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', function () {
    mountainColor = colorPicker.value;
    material.color.set(mountainColor);
    renderer.render(scene, camera);
});

// Add the sun
const sunGeometry = new THREE.SphereGeometry(2.2, 32, 32);
const sunTextureLoader = new THREE.TextureLoader();
const sunTexture = sunTextureLoader.load('asset/sun.jpeg');

const sunMaterial = new THREE.MeshStandardMaterial({
    map: sunTexture,
    transparent: false,
    opacity: 0.8,
    emissive: 0xfae500,
    emissiveIntensity: 0.8,
    side: THREE.DoubleSide,
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Move the sun away from the center
sun.position.set(0, sunDistance, 0); // Adjust the position to be in the sky

// Rotate the sun around the center
const clock = new THREE.Clock();
const sunRotationSpeed = 0.8;

function rotateSun() {
    if (!isPaused) {
        const delta = clock.getDelta();
        sun.rotation.y += sunRotationSpeed * delta;
        sun.position.x = sunDistance * Math.cos(sun.rotation.y);
        sun.position.z = sunDistance * Math.sin(sun.rotation.y);

        // Update the sunlight position based on the sun's position
        sunLight.position.copy(sun.position);
    }
}

// Handle window resize
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateTerrain();
});

// Handle key events
window.addEventListener('keydown', function (event) {
    if (event.key === 's' || event.key === 'S') {
        isPaused = !isPaused;
    } else if (event.key === 'r' || event.key === 'R') {
        resetTerrain();
    } else if (event.key === 'a' || event.key === 'A') {
        randomizeTerrain();
    }
});

function resetTerrain() {
    geometry.vertices = originalTerrainVertices.map(v => v.clone());
    updateTerrain();
}

function randomizeTerrain() {
    for (let i = 0; i < geometry.vertices.length; i++) {
        const vertex = geometry.vertices[i];
        vertex.z = Math.random() * noiseStrength;
    }
    geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
}
// Create clouds using a particle system with a texture
const cloudGeometry = new THREE.BufferGeometry();
const cloudMaterial = new THREE.PointsMaterial({
    size: 5,
    map: new THREE.TextureLoader().load('asset/cloud.png'), // Replace with the path to your cloud texture
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending, // Additive blending for a more realistic look
    depthWrite: false // Ensure clouds are rendered behind other objects
});

const cloudVertices = [];
const cloudCount = 100;

for (let i = 0; i < cloudCount; i++) {
    const x = Math.random() * terrainSize - terrainSize / 2;
    const y = Math.random() * 10; // Adjust the height of clouds above the terrain
    const z = Math.random() * terrainSize - terrainSize / 2;

    cloudVertices.push(x, y, z);
}

cloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cloudVertices, 3));
const clouds = new THREE.Points(cloudGeometry, cloudMaterial);
scene.add(clouds);

// dat.GUI controls
const gui = new dat.GUI();
const transformTerrainFolder = gui.addFolder('Geometric Transformations (Terrain)');
const transformSunFolder = gui.addFolder('Geometric Transformations (Sun)');
const transformCloudsFolder = gui.addFolder('Geometric Transformations (Clouds)');
const transformParametersTerrain = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    scale: 1
};
const transformParametersSun = {
    translateX: 0,
    translateY: sunDistance,
    rotate: 0,
    scale: 1
};
const transformParametersClouds = {
    translateX: 0,
    translateY: 0,
    translateZ: 0, // Add translateZ property
    rotate: 0,
    scale: 1
};
//wind
const wind = gui.addFolder('Clouds wind');
const windSpeedController = wind.add({ windSpeed: 0.02 }, 'windSpeed', 0, 0.1).name('Wind Speed');

const terrainTranslateXController = transformTerrainFolder.add(transformParametersTerrain, 'translateX', -50, 50);
const terrainTranslateYController = transformTerrainFolder.add(transformParametersTerrain, 'translateY', -50, 50);
const terrainRotateController = transformTerrainFolder.add(transformParametersTerrain, 'rotate', 0, Math.PI * 2);
const terrainScaleController = transformTerrainFolder.add(transformParametersTerrain, 'scale', 0.5, 2);

terrainTranslateXController.onChange(updateTransformTerrain);
terrainTranslateYController.onChange(updateTransformTerrain);
terrainRotateController.onChange(updateTransformTerrain);
terrainScaleController.onChange(updateTransformTerrain);


const sunTranslateXController = transformSunFolder.add(transformParametersSun, 'translateX', -50, 50);
const sunTranslateYController = transformSunFolder.add(transformParametersSun, 'translateY', sunDistance - 50, sunDistance + 50);
const sunRotateController = transformSunFolder.add(transformParametersSun, 'rotate', 0, Math.PI * 2);
const sunScaleController = transformSunFolder.add(transformParametersSun, 'scale', 0.5, 2);

sunTranslateXController.onChange(updateTransformSun);
sunTranslateYController.onChange(updateTransformSun);
sunRotateController.onChange(updateTransformSun);
sunScaleController.onChange(updateTransformSun);

const cloudsTranslateXController = transformCloudsFolder.add(transformParametersClouds, 'translateX', -50, 50);
const cloudsTranslateYController = transformCloudsFolder.add(transformParametersClouds, 'translateY', -50, 50);
const cloudsTranslateZController = transformCloudsFolder.add(transformParametersClouds, 'translateZ', -50, 50); // Add translateZ controller
const cloudsRotateController = transformCloudsFolder.add(transformParametersClouds, 'rotate', 0, Math.PI * 2);
const cloudsScaleController = transformCloudsFolder.add(transformParametersClouds, 'scale', 0.5, 2);

cloudsTranslateXController.onChange(updateTransformClouds);
cloudsTranslateYController.onChange(updateTransformClouds);
cloudsTranslateZController.onChange(updateTransformClouds); // Add onChange for translateZ
cloudsRotateController.onChange(updateTransformClouds);
cloudsScaleController.onChange(updateTransformClouds);

function updateTransformClouds() {
    clouds.position.x = transformParametersClouds.translateX;
    clouds.position.y = transformParametersClouds.translateY;
    clouds.position.z = transformParametersClouds.translateZ; // Add this line for the cloud's Z translation
    clouds.rotation.z = transformParametersClouds.rotate;
    clouds.scale.set(transformParametersClouds.scale, transformParametersClouds.scale, transformParametersClouds.scale);
}
function updateTransformTerrain() {
    terrain.position.x = transformParametersTerrain.translateX;
    terrain.position.y = transformParametersTerrain.translateY;
    terrain.rotation.z = transformParametersTerrain.rotate;
    terrain.scale.set(transformParametersTerrain.scale, transformParametersTerrain.scale, transformParametersTerrain.scale);
}

function updateTransformSun() {
    sun.position.x = transformParametersSun.translateX;
    sun.position.y = transformParametersSun.translateY;
    sun.rotation.z = transformParametersSun.rotate;
    sun.scale.set(transformParametersSun.scale, transformParametersSun.scale, transformParametersSun.scale);
}

function animateClouds() {
    clouds.position.x += windSpeedController.getValue(); // Adjust the clouds' X position based on wind speed

    // Reset clouds' X position when they go beyond a certain limit
    if (clouds.position.x > terrainSize / 2) {
        clouds.position.x = -terrainSize / 2;
    }

    // Update the cloud geometry to reflect the new position
    const positions = cloudGeometry.getAttribute('position');
    for (let i = 0; i < positions.array.length; i += 3) {
        positions.array[i] += windSpeedController.getValue();
    }

    positions.needsUpdate = true; // Ensure the changes are reflected in the geometry
}

function animate() {
    requestAnimationFrame(animate);
    rotateSun();
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    animateClouds(); // Call the function to animate the clouds
    renderer.render(scene, camera);
}

animate();