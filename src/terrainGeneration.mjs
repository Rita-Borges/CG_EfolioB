// terrainGeneration.mjs
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { ImprovedNoise } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/math/ImprovedNoise.js";

export function generateTerrain(terrainSize, noiseStrength) {
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, 100, 100);

    const material = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // Default mountain color
        flatShading: true,
        side: THREE.DoubleSide
    });
    material.shininess = 0;

    const terrain = new THREE.Mesh(geometry, material);
    terrain.castShadow = true;
    terrain.receiveShadow = true;

    // Remove the existing material
    terrain.material.dispose();

    // Set the new material
    terrain.material = material;

    // Apply Perlin noise to the terrain
    const perlin = new ImprovedNoise();
    const originalTerrainVertices = geometry.vertices.map(v => v.clone());

    function updateTerrain() {
        for (let i = 0; i < geometry.vertices.length; i++) {
            const vertex = geometry.vertices[i];
            const originalVertex = originalTerrainVertices[i];
            const value = perlin.noise(originalVertex.x / noiseStrength, originalVertex.y / noiseStrength, 1);
            vertex.z = value * noiseStrength;
        }
        geometry.verticesNeedUpdate = true;
    }

    updateTerrain(); // Initial render

    return { terrain, geometry, perlin };
}
