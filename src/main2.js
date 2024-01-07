// main.js
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { createSun, rotateSun } from './SkySphere.mjs';
import { createClouds, animateClouds } from './addOns.mjs';
import { initializeTerrain } from './terrainCustomization.mjs';
import { initRenderer } from './rendering.mjs';
import { windSpeedController, setupUIControls } from "./uiControls.mjs";

const { scene, camera, renderer, controls } = initRenderer();

const terrainSize = 60;
let noiseStrength = 5;
let mountainColor = 0x8B4513;

const material = new THREE.MeshPhongMaterial({
    color: mountainColor,
    flatShading: true,
    side: THREE.DoubleSide
});
material.shininess = 0;

let { terrain, updateTerrain, isPaused, originalTerrainVertices } = initializeTerrain(scene, camera, renderer, material);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const sunDistance = 12;
const { sun, sunLight } = createSun(scene, sunDistance);

terrain.rotation.x = -Math.PI / 2;
terrain.position.set(0, -10, -10);

const noiseStrengthSlider = document.getElementById('noiseStrengthSlider');
noiseStrengthSlider.addEventListener('input', function () {
    noiseStrength = parseFloat(noiseStrengthSlider.value);
    updateTerrain();
});

const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', function () {
    mountainColor = colorPicker.value;
    material.color.set(mountainColor);
    renderer.render(scene, camera);
});

const clock = new THREE.Clock();
const sunRotationSpeed = 0.8;

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateTerrain();
});

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
    terrain.geometry.vertices = originalTerrainVertices.map(v => v.clone());
    updateTerrain();
}

function randomizeTerrain() {
    for (let i = 0; i < terrain.geometry.vertices.length; i++) {
        const vertex = terrain.geometry.vertices[i];
        vertex.z = Math.random() * noiseStrength;
    }
    terrain.geometry.verticesNeedUpdate = true;
    renderer.render(scene, camera);
}

const clouds = createClouds(terrainSize);
scene.add(clouds);


function animate() {
    requestAnimationFrame(animate);
    rotateSun(sun, sunLight, isPaused, clock, sunRotationSpeed);
    animateClouds(clouds, terrainSize, windSpeedController );
    renderer.render(scene, camera);
    controls.update();
}

setupUIControls(sunDistance);
animate();
