// uiControls.js
import * as dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js';

const gui = new dat.GUI();
const wind = gui.addFolder('Clouds wind');
export const windSpeedController = wind.add({ windSpeed: 0.02 }, 'windSpeed', 0, 0.1).name('Wind Speed')
export function setupUIControls(sunDistance ) {
    // dat.GUI controls

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

}
function updateTransformClouds(clouds, transformParametersClouds) {
    clouds.position.x = transformParametersClouds.translateX;
    clouds.position.y = transformParametersClouds.translateY;
    clouds.position.z = transformParametersClouds.translateZ; // Add this line for the cloud's Z translation
    clouds.rotation.z = transformParametersClouds.rotate;
    clouds.scale.set(transformParametersClouds.scale, transformParametersClouds.scale, transformParametersClouds.scale);
}
function updateTransformTerrain(terrain, transformParametersTerrain) {
    terrain.position.x = transformParametersTerrain.translateX;
    terrain.position.y = transformParametersTerrain.translateY;
    terrain.rotation.z = transformParametersTerrain.rotate;
    terrain.scale.set(transformParametersTerrain.scale, transformParametersTerrain.scale, transformParametersTerrain.scale);
}

function updateTransformSun(sun, transformParametersSun) {
    sun.position.x = transformParametersSun.translateX;
    sun.position.y = transformParametersSun.translateY;
    sun.rotation.z = transformParametersSun.rotate;
    sun.scale.set(transformParametersSun.scale, transformParametersSun.scale, transformParametersSun.scale);
}