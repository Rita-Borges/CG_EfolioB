// main.js
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import * as dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js';
import { createSun, rotateSun } from './SkySphere.mjs';
import { createClouds, animateClouds } from './addOns.mjs';
import { initializeTerrain } from './terrainCustomization.mjs';
import { initRenderer } from './rendering.mjs';


const { scene, camera, renderer, controls } = initRenderer();

const terrainSize = 60;
let noiseStrength = 5; // Initial value for noise strength

// Initial color for the mountain
let mountainColor = 0x8B4513;

const material = new THREE.MeshPhongMaterial({
    color: mountainColor,
    flatShading: true,
    side: THREE.DoubleSide
});
material.shininess = 0; // Set shininess to 0 to make it look less glossy

// Call the initializeTerrain function
let { terrain, updateTerrain, isPaused } = initializeTerrain(scene, camera, renderer, material);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light (simulating the sun)
const sunDistance = 12;
const { sun, sunLight } = createSun(scene, sunDistance);

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

// Rotate the sun around the center
const clock = new THREE.Clock();
const sunRotationSpeed = 0.8;

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
    // Assuming you have access to the originalTerrainVertices from initializeTerrain
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


const clouds = createClouds(terrainSize);
scene.add(clouds);

function animate() {
    requestAnimationFrame(animate);
    rotateSun(sun, sunLight, isPaused, clock, sunRotationSpeed);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    animateClouds(clouds, terrainSize, windSpeedController); // Use the imported animateClouds function
    renderer.render(scene, camera);
}

animate();