// renderingModule.mjs
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { createSun, rotateSun } from './SkySphere.mjs';
import { initializeTerrain } from './terrainCustomization.mjs';


export function initRenderer() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB); // Light blue background color
    renderer.shadowMap.enabled = true; // Enable shadows
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    return { scene, camera, renderer, controls };
}

export function initTerrain(scene, camera, renderer, material) {
    const terrainSize = 60;
    let noiseStrength = 5;
    const { terrain, updateTerrain, isPaused } = initializeTerrain(scene, camera, renderer, material);

    // Add rotation to the terrain
    terrain.rotation.x = -Math.PI / 2; // Rotate the terrain to be horizontal

    // Center the terrain
    terrain.position.set(0, -10, -10);

    return { terrain, updateTerrain, isPaused };
}

export function initLights(scene, sunDistance) {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light (simulating the sun)
    const { sun, sunLight } = createSun(scene, sunDistance);

    return { sun, sunLight };
}

export function setupEventListeners(camera, renderer, updateTerrain, resetTerrain, randomizeTerrain) {
    // Handle window resize
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateTerrain();
    });


}

