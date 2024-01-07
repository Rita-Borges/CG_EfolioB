// terrainCustomization.js
import { generateTerrain } from './terrainGeneration.mjs';

export function initializeTerrain(scene, camera, renderer, material) {
    const terrainSize = 60;
    let noiseStrength = 5;

    const { terrain, geometry, perlin } = generateTerrain(terrainSize, noiseStrength, material);
    scene.add(terrain);

    // Original terrain vertices
    const originalTerrainVertices = geometry.vertices.map(v => v.clone());
    let isPaused = false; // Initial pause state
    material.wireframe = false;
    updateTerrain(); // Initial render

    // Position the camera
    camera.position.z = 30;

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

    // Expose necessary functions or variables
    return {
        terrain,
        updateTerrain,
        isPaused,
    };
}
