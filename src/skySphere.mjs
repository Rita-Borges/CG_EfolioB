// sun.mjs
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';

export function createSun(scene, sunDistance) {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(0, sunDistance, 0);
    sunLight.castShadow = false;
    scene.add(sunLight);

    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;

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

    sun.position.set(0, sunDistance, 0);

    return { sun, sunLight, sunDistance };  // Include sunDistance in the return object
}

export function rotateSun(sun, sunLight, sunDistance, isPaused, clock, sunRotationSpeed) {
    if (!isPaused) {
        const delta = clock.getDelta();
        sun.rotation.y += sunRotationSpeed * delta;
        sun.position.x = sunLight.position.x = sunDistance * Math.cos(sun.rotation.y);
        sun.position.z = sunLight.position.z = sunDistance * Math.sin(sun.rotation.y);
    }
}
