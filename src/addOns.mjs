// addOns.js
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';

export function createClouds(terrainSize) {
    const cloudGeometry = new THREE.BufferGeometry();
    //wind
    const cloudMaterial = new THREE.PointsMaterial({
        size: 5,
        map: new THREE.TextureLoader().load('asset/cloud.png'),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
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
    return new THREE.Points(cloudGeometry, cloudMaterial);
}

export function animateClouds(clouds, terrainSize, windSpeedController) {
    clouds.position.x += windSpeedController.getValue();

    if (clouds.position.x > terrainSize / 2) {
        clouds.position.x = -terrainSize / 2;
    }

    const positions = clouds.geometry.getAttribute('position');
    for (let i = 0; i < positions.array.length; i += 3) {
        positions.array[i] += windSpeedController.getValue();
    }

    positions.needsUpdate = true;
}


