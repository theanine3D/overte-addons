//
//  skyDayNight.js
//
//  Created by Pedro Valencia / Theanine3D, September 17, 2022.
//  youtube.com/c/theanine3D
//  twitter.com/theanine3D
//  www.theanine3d.com
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  See accompanying README.md for usage instructions.
// 
// TODO: zone entity

(function () {

    var skydomeID = Entities.getEntityProperties(this).entityID;
    var shapesBoneIndex = Entities.getJointIndex(skydomeID, "shapes");

    function cleanupMats() {
        var unclearedMatEntities = Entities.getChildrenIDs(skydomeID);
        for (var i = 0; i < unclearedMatEntities.length; i++) {
            if (Entities.getEntityProperties(unclearedMatEntities[i]).name.indexOf("sky_DayNight_Mat") !== -1) {
                Entities.deleteEntity(unclearedMatEntities[i]);
            }
        }
    }

    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    this.preload = function (entityID) {
        this.entityID = entityID;
        skydomeID = this.entityID;
        // Window.alert("Entity ID: " + this.entityID);
        cleanupMats();
    };

    // SETUP VARIABLES
    var currentTime = new Date();

    const secondsInADay = 86400;
    var seconds = ((currentTime.getMinutes() + (currentTime.getHours() * 60)) * 60) + currentTime.getSeconds();
    var timeProgress = (seconds / secondsInADay) % 1;

    var nightAlpha = 0;

    // CUSTOMIZATION - modify the variables below to tweak how the day/night transition works
    const cloudSpeed = 1;       // increase to make the clouds move faster
    var cycleSpeed = 1;   // 1 = a single day/night transition for every real-world 24 hours. Increase it if you want faster transitions than the real world
    var useClouds = true;   // set to false if you don't want clouds during daytime
    // END CUSTOMIZATION

    var gradientsURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/skyGradients.png";
    var cloudsURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/skyClouds.png";
    var starsURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/skyStars.png";
    var sunURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/skySun.png";
    var moonURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/skyMoon.png";
    var roughnessURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/r_100.png";
    var metallicURL = "file:///G:/Documents/Programming/Overte/Day and Night System/textures/r_0.png";

    var animURL = "file:///G:/Documents/Programming/Overte/Day and Night System/export/sky_DayNight_skydome_idle.fbx";

    Entities.editEntity(skydomeID, {
        "animation": {
            url: animURL,
            firstFrame: 1,
            lastFrame: 11501,
            loop: true,
            fps: 24 * cloudSpeed,
            running: true
        }
    });

    // ADD GRADIENT MATERIAL ENTITY
    var gradientMatID = Entities.addEntity(
        {
            "type": "Material",
            "parentID": skydomeID,
            "materialURL": "materialData",
            "priority": 1,
            "grab": {
                "grabbable": false,
                "equippableLeftRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                },
                "equippableRightRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                }
            },
            "name": "sky_DayNight_Mat_Gradients",
            "parentMaterialName": "mat::skyGradients",
            "materialMappingPos": {
                "x": 0.0,
                "y": 0.0
            }
        }, "domain");


    // ADD CLOUDS MATERIAL ENTITY
    var cloudsMatID = Entities.addEntity(
        {
            "type": "Material",
            "parentID": skydomeID,
            "materialURL": "materialData",
            "priority": 1,
            "grab": {
                "grabbable": false,
                "equippableLeftRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                },
                "equippableRightRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                }
            },
            "name": "sky_DayNight_Mat_Clouds",
            "parentMaterialName": "mat::skyClouds",
            "materialMappingPos": {
                "x": 0.0,
                "y": 0.0
            },
        }, "domain");

    // ADD STARS MATERIAL ENTITY
    var starsMatID = Entities.addEntity(
        {
            "type": "Material",
            "parentID": skydomeID,
            "materialURL": "materialData",
            "priority": 1,
            "grab": {
                "grabbable": false,
                "equippableLeftRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                },
                "equippableRightRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                }
            },
            "name": "sky_DayNight_Mat_Stars",
            "parentMaterialName": "mat::skyStars",
            "materialMappingPos": {
                "x": 0.0,
                "y": 0.0
            },
        }, "domain");


    // ADD SUN MATERIAL ENTITY
    var sunMatID = Entities.addEntity(
        {
            "type": "Material",
            "parentID": skydomeID,
            "materialURL": "materialData",
            "priority": 1,
            "grab": {
                "grabbable": false,
                "equippableLeftRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                },
                "equippableRightRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                }
            },
            "name": "sky_DayNight_Mat_Sun",
            "parentMaterialName": "mat::skySun",
            "materialMappingPos": {
                "x": 0.0,
                "y": 0.0
            },
            "materialData": JSON.stringify({
                "materialVersion": 1,
                "materials": [
                    {
                        "name": "skySun",
                        "model": "hifi_pbr",
                        "albedoMap": sunURL,
                        "opacityMap": sunURL,
                        "roughnessMap": roughnessURL,
                        "metallicMap": metallicURL,
                        "unlit": true,
                        "opacityMapMode": "OPACITY_MAP_BLEND",
                        "opacity": 1 - nightAlpha
                    }
                ]
            })
        }, "domain");

    // ADD MOON MATERIAL ENTITY
    var moonMatID = Entities.addEntity(
        {
            "type": "Material",
            "parentID": skydomeID,
            "materialURL": "materialData",
            "priority": 1,
            "grab": {
                "grabbable": false,
                "equippableLeftRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                },
                "equippableRightRotation": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0,
                    "w": 1
                }
            },
            "name": "sky_DayNight_Mat_Moon",
            "parentMaterialName": "mat::skyMoon",
            "materialMappingPos": {
                "x": 0.0,
                "y": 0.0
            },
            "materialData": JSON.stringify({
                "materialVersion": 1,
                "materials": [
                    {
                        "name": "skyMoon",
                        "model": "hifi_pbr",
                        "albedoMap": moonURL,
                        "opacityMap": moonURL,
                        "roughnessMap": roughnessURL,
                        "metallicMap": metallicURL,
                        "unlit": true,
                        "opacityMapMode": "OPACITY_MAP_BLEND",
                        "opacity": nightAlpha
                    }
                ]
            })
        }, "domain");

    function updateDayNight() {
        currentTime = new Date();
        seconds = ((currentTime.getMinutes() + (currentTime.getHours() * 60)) * 60) + currentTime.getSeconds();
        timeProgress = (seconds / secondsInADay) % 1;

        // calculate if it's nighttime - the result affects the opacity of clouds/stars. If nightAlpha = 1, it is fully night time, while 0 is daytime
        if ((timeProgress % 1) <= 0.2075) {
            nightAlpha = map_range(timeProgress, 0, 0.2075, 1, 0);
        }
        if ((timeProgress % 1) >= 0.7925) {
            nightAlpha = map_range(timeProgress, 0.7925, 1, 0, 1);
        }
        // if ((timeProgress % 1) > 0.2075 && (timeProgress % 1) < 0.7925) {
        else {
            nightAlpha = 0;
        }

        // update the gradient, based on current time of day
        Entities.editEntity(gradientMatID,
            {
                "type": "Material",
                "parentID": skydomeID,
                "materialURL": "materialData",
                "priority": 1,
                "name": "sky_DayNight_Mat_Gradients",
                "parentMaterialName": "mat::skyGradients",
                "materialMappingPos": {
                    "x": timeProgress,
                    "y": 0.0
                },
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "skyGradients",
                            "model": "hifi_pbr",
                            "albedoMap": gradientsURL,
                            "roughnessMap": roughnessURL,
                            "metallicMap": metallicURL,
                            "unlit": true
                        }
                    ]
                })
            });

        // update the clouds, based on current time of day
        Entities.editEntity(cloudsMatID,
            {
                "type": "Material",
                "parentID": skydomeID,
                "materialURL": "materialData",
                "priority": 1,
                "name": "sky_DayNight_Mat_Clouds",
                "parentMaterialName": "mat::skyClouds",
                "materialMappingPos": {
                    "x": 0.0,
                    "y": 0.0
                },
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "skyClouds",
                            "model": "hifi_pbr",
                            "albedoMap": cloudsURL,
                            "opacityMap": cloudsURL,
                            "roughnessMap": roughnessURL,
                            "metallicMap": metallicURL,
                            "opacity": 1 - nightAlpha,
                            "unlit": true
                        }
                    ]
                })
            });
        if (useClouds === false) {
            Entities.editEntity(cloudsMatID,
                {
                    "materialData": JSON.stringify({
                        "materialVersion": 1,
                        "materials": [
                            {
                                "name": "skyClouds",
                                "model": "hifi_pbr",
                                "albedoMap": cloudsURL,
                                "opacityMap": cloudsURL,
                                "roughnessMap": roughnessURL,
                                "metallicMap": metallicURL,
                                "opacity": 0,
                                "unlit": true
                            }
                        ]
                    })
                });
        }

        // update the stars, based on current time of day
        Entities.editEntity(starsMatID,
            {
                "type": "Material",
                "parentID": skydomeID,
                "materialURL": "materialData",
                "priority": 1,
                "name": "sky_DayNight_Mat_Stars",
                "parentMaterialName": "mat::skyStars",
                "materialMappingPos": {
                    "x": 0.0,
                    "y": 0.0
                },
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "skyStars",
                            "model": "hifi_pbr",
                            "albedoMap": starsURL,
                            "opacityMap": starsURL,
                            "roughnessMap": roughnessURL,
                            "metallicMap": metallicURL,
                            "unlit": true,
                            "opacity": nightAlpha
                        }
                    ]
                })
            });

        // update the sun and moon, based on current time of day
        Entities.editEntity(moonMatID,
            {
                "type": "Material",
                "parentID": skydomeID,
                "materialURL": "materialData",
                "priority": 1,
                "name": "sky_DayNight_Mat_Moon",
                "parentMaterialName": "mat::skyMoon",
                "materialMappingPos": {
                    "x": 0.0,
                    "y": 0.0
                },
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "skyMoon",
                            "model": "hifi_pbr",
                            "albedoMap": moonURL,
                            "opacityMap": moonURL,
                            "roughnessMap": roughnessURL,
                            "metallicMap": metallicURL,
                            "unlit": true,
                            "opacityMapMode": "OPACITY_MAP_BLEND",
                            "opacity": nightAlpha
                        }
                    ]
                })
            });
        Entities.editEntity(sunMatID,
            {
                "type": "Material",
                "parentID": skydomeID,
                "materialURL": "materialData",
                "priority": 1,
                "name": "sky_DayNight_Mat_Sun",
                "parentMaterialName": "mat::skySun",
                "materialMappingPos": {
                    "x": 0.0,
                    "y": 0.0
                },
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "skySun",
                            "model": "hifi_pbr",
                            "albedoMap": sunURL,
                            "opacityMap": sunURL,
                            "roughnessMap": roughnessURL,
                            "metallicMap": metallicURL,
                            "unlit": true,
                            "opacityMapMode": "OPACITY_MAP_BLEND",
                            "opacity": 1 - nightAlpha
                        }
                    ]
                })
            });

        // update the sun/moon rotation via bone manipulation
        shapesBoneIndex = Entities.getJointIndex(skydomeID, "shapes")
        Entities.setLocalJointRotation(skydomeID, shapesBoneIndex, Quat.fromVec3Degrees({ x: 0, y: (360 * timeProgress), z: 0 }));
    }

    // Start constant loop that updates the appearance continuously
    Script.update.connect(constantLoop);

    function constantLoop(deltaTime) {
        updateDayNight();
    }

    function endScript() {
        Script.update.disconnect(constantLoop);
    }

    Script.scriptEnding.connect(endScript);

});
