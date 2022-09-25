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
    var sunmoonID;
    var unclearedEntities = [];

    // find the sun/moon model and store its ID
    function findSunMoon() {
        unclearedEntities = Entities.getChildrenIDs(skydomeID);
        for (var i = 0; i < unclearedEntities.length; i++) {
            if (Entities.getEntityProperties(unclearedEntities[i]).name.indexOf("sky_DayNight_SunMoon") !== -1) {
                sunmoonID = Entities.getEntityProperties(unclearedEntities[i]).id;
            }
        }
    }

    // delete dupe materials
    function cleanupEntities() {
        unclearedEntities = [];
        unclearedEntities = Entities.findEntitiesByType("Material", Entities.getEntityProperties(skydomeID).position, 10000);
        for (var i = 0; i < unclearedEntities.length; i++) {
            if (Entities.getEntityProperties(unclearedEntities[i]).name.indexOf("sky_DayNight_Mat") !== -1) {
                Entities.deleteEntity(unclearedEntities[i]);
            }
        }
        unclearedEntities = null;
        unclearedEntities = Entities.findEntitiesByType("Zone", Entities.getEntityProperties(skydomeID).position, 10000);
        for (var i = 0; i < unclearedEntities.length; i++) {
            if (Entities.getEntityProperties(unclearedEntities[i]).name.indexOf("sky_DayNight_Zone") !== -1) {
                Entities.deleteEntity(unclearedEntities[i]);
            }
        }
    }
    cleanupEntities()

    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    function lerp(i, a, b) {
        // i - your current value (between 0 - c)
        // a - beginning position
        // b - ending position
        // c - the maximum possible value
        if (a > b) {
            c = a;
        }
        else {
            c = b;
        }
        return b + ((i / c) * (e - b));
    }


    this.preload = function (entityID) {
        this.entityID = entityID;
        skydomeID = this.entityID;
        findSunMoon();
    };

    // CUSTOMIZATION - modify the variables below to tweak how the day/night transition works
    var cloudSpeed = 1;       // increase to make the clouds move faster
    var cycleSpeed = 1;   // 1 = a single day/night transition for every real-world 24 hours. Increase it if you want faster transitions than the real world
    var useClouds = true;   // set to false if you don't want clouds during daytime
    var useCustomZone = true; // set to false if you don't want scene lighting to actually be modified based on night/day. If set to true, you should delete existing zone entities in your scene

    // NIGHT TIME ZONE SETTINGS
    var zoneSettingsDay = {
        "keyLight": {
            "color": {
                "red": 252,
                "green": 175,
                "blue": 139
            },
            "intensity": 1.8,
            "direction": {
                "x": 0,
                "y": -1,
                "z": 0.0
            },
            "castShadows": true,
            "shadowBias": 0.25
        },
        "ambientLight": {
            "ambientIntensity": 0.2,
            "ambientURL": ambientURL
        },
        "haze": {
            "hazeRange": 200,
            "hazeColor": {
                "red": 31,
                "green": 31,
                "blue": 31
            },
            "hazeGlareColor": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "hazeEnableGlare": true,
            "hazeGlareAngle": 40,
            "hazeAltitudeEffect": true,
            "hazeCeiling": 90,
            "hazeBackgroundBlend": 0.55
        },
        "bloom": {
            "bloomIntensity": 0.1
        }
    };

    // DAY TIME ZONE SETTINGS
    var zoneSettingsNight = {
        "keyLight": {
            "color": {
                "red": 139,
                "green": 188,
                "blue": 252
            },
            "intensity": 1.8,
            "direction": {
                "x": 0,
                "y": -1,
                "z": 0
            },
            "castShadows": true,
            "shadowBias": 0.25
        },
        "ambientLight": {
            "ambientIntensity": 0.2,
            "ambientURL": ambientURL
        },
        "haze": {
            "hazeRange": 200,
            "hazeColor": {
                "red": 31,
                "green": 31,
                "blue": 31
            },
            "hazeGlareColor": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "hazeEnableGlare": true,
            "hazeGlareAngle": 40,
            "hazeAltitudeEffect": true,
            "hazeCeiling": 90,
            "hazeBackgroundBlend": 0.5500000
        },
        "bloom": {
            "bloomIntensity": 0.10000000
        }
    };


    // END CUSTOMIZATION

    // SETUP VARIABLES
    var currentTime = new Date();

    const secondsInADay = 86400;
    var seconds = ((currentTime.getMinutes() + (currentTime.getHours() * 60)) * 60) + currentTime.getSeconds();
    timeProgress = ((seconds / secondsInADay) % 1) * cycleSpeed;

    var nightAlpha = 0;


    var jsMainFileName = "skyDayNight.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var domeURL = ROOT + "models/sky_DayNight_Dome.fbx";
    var sunmoonURL = ROOT + "models/sky_DayNight_sunmoon.fbx";
    var animURL = ROOT + "models/sky_DayNight_skydome_idle.fbx";

    var gradientsURL = ROOT + "textures/skyGradients.png";
    var ambientURL = ROOT + "textures/skyAmbient.png";
    var cloudsURL = ROOT + "textures/skyClouds.png";
    var starsURL = ROOT + "textures/skyStars.png";
    var sunURL = ROOT + "textures/skySun.png";
    var moonURL = ROOT + "textures/skyMoon.png";
    var roughnessURL = ROOT + "textures/r_100.png";
    var metallicURL = ROOT + "textures/r_0.png";

    Entities.editEntity(skydomeID, {
        "modelURL": domeURL,
        "animation": {
            url: animURL,
            firstFrame: 1,
            lastFrame: 8626,
            loop: true,
            fps: 24 * cloudSpeed,
            running: true
        }
    });

    findSunMoon();

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
            }
        }, "domain");


    // ADD ZONE ENTITY
    if (useCustomZone) {
        var zoneID = Entities.addEntity(
            {
                "type": "Zone",
                "name": "sky_DayNight_Zone",
                "dimensions": Entities.getEntityProperties(skydomeID).dimensions,
                "parentID": skydomeID,
                "rotation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "localPosition": { x: 0, y: 0, z: 0 },
                "queryAACube": {
                    "x": -433,
                    "y": -433,
                    "z": -433,
                    "scale": 866
                },
                "grab": {
                    "grabbable": false,
                    "equippableLeftRotation": {
                        "x": 0,
                        "y": 0,
                        "z": 0,
                        "w": 1
                    },
                    "equippableRightRotation": {
                        "x": 0,
                        "y": 0,
                        "z": 0,
                        "w": 1
                    }
                },
                "shapeType": "sphere",
                "clientOnly": false,
                "avatarEntity": false,
                "localEntity": false,
                "faceCamera": false,
                "isFacingAvatar": false,
            }, "domain");

        Entities.editEntity(zoneID,
            {
                "parentID": skydomeID
            }
        )
    }


    // UPDATE SUN and MOON MODEL ENTITY
    Entities.editEntity(sunmoonID,
        {
            "type": "Model",
            "parentID": skydomeID,
            "damping": 0,
            "angularDamping": 0,
            "collisionless": true,
            "ignoreForCollisions": true,
            "useOriginalPivot": true,
            "clientOnly": false,
            "avatarEntity": false,
            "localEntity": false,
            "faceCamera": false,
            "isFacingAvatar": false,
            "modelURL": sunmoonURL,
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
            "name": "sky_DayNight_SunMoon",
        }, "domain");

    // ADD SUN MATERIAL ENTITY
    var sunMatID = Entities.addEntity(
        {
            "type": "Material",
            "parentID": sunmoonID,
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
            "parentID": sunmoonID,
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
        findSunMoon();
        currentTime = new Date();
        seconds = ((currentTime.getMinutes() + (currentTime.getHours() * 60)) * 60) + currentTime.getSeconds();
        timeProgress = ((seconds / secondsInADay) % 1) * cycleSpeed;

        // update the sun / moon rotation via bone manipulation
        Entities.editEntity(sunmoonID, {
            "localRotation": Quat.fromVec3Degrees({ x: 0, y: 0, z: (360 * timeProgress) })
        });

        // calculate if it's nighttime - the result affects the opacity of clouds/stars. If nightAlpha = 1, it is fully night time, while 0 is daytime
        if ((timeProgress % 1) >= 0.2 && (timeProgress % 1) <= 0.3) {
            nightAlpha = map_range((timeProgress % 1), 0.2, 0.3, 1, 0);
        }
        else if ((timeProgress % 1) >= 0.7 && (timeProgress % 1) <= 0.8) {
            nightAlpha = map_range((timeProgress % 1), 0.7, 0.8, 1, 0);
        }
        else if ((timeProgress % 1) < 0.2) {
            nightAlpha = 0;
        }
        else if ((timeProgress % 1) > 0.8) {
            nightAlpha = 1;
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
                            "opacity": 1 - (nightAlpha / 2),
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

        // update the MOON, based on current time of day
        Entities.editEntity(moonMatID,
            {
                "type": "Material",
                "parentID": sunmoonID,
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
                            "opacityMapMode": "OPACITY_MAP_MASK",
                            "opacity": nightAlpha
                        }
                    ]
                })
            });

        // update the SUN, based on current time of day
        Entities.editEntity(sunMatID,
            {
                "type": "Material",
                "parentID": sunmoonID,
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

        // Calculate sun angles
        var sunAngleVertical = 0;
        var sunAngleHorizontal = 0;
        // var sunAngleHorizontal = ((-0.8 - -1) * Math.sin(timeProgress) + -0.8 - 1) / 2;     // TODO
        if (timeProgress <= .25) {
            sunAngleVertical = map_range((timeProgress), 0, .25, -1, -.7);
            sunAngleHorizontal = map_range((timeProgress), 0, .25, 0, .7);
        }
        if (timeProgress > .25 && timeProgress < 0.5) {
            sunAngleVertical = map_range((timeProgress), 0.25, .5, -.7, -1)
            sunAngleHorizontal = map_range((timeProgress), 0.25, .5, .7, 0);
        }
        if (timeProgress > 0.5 && timeProgress < 0.75) {
            sunAngleVertical = map_range((timeProgress), 0.5, .75, -1, -.7);
            sunAngleHorizontal = map_range((timeProgress), 0.5, .75, 0, .7);

        }
        if (timeProgress > 0.75 && timeProgress < 1) {
            sunAngleVertical = map_range((timeProgress), 0.75, 1, -.7, -1);
            sunAngleHorizontal = map_range((timeProgress), 0.75, 1, .7, 0);
        }

        if (useCustomZone) {
            // update the ZONE ENTITY, based on current time of day
            Entities.editEntity(zoneID,
                {
                    "parentID": skydomeID,
                    "dimensions": Entities.getEntityProperties(skydomeID).dimensions,
                    "localPosition": { x: 0, y: 0, z: 0 },
                    "keyLight": {
                        "color": {
                            "red": ((zoneSettingsDay.keyLight.color.red * (1 - nightAlpha)) + (zoneSettingsNight.keyLight.color.red * (nightAlpha))),
                            "green": ((zoneSettingsDay.keyLight.color.green * (1 - nightAlpha)) + (zoneSettingsNight.keyLight.color.green * (nightAlpha))),
                            "blue": ((zoneSettingsDay.keyLight.color.blue * (1 - nightAlpha)) + (zoneSettingsNight.keyLight.color.blue * (nightAlpha))),
                        },
                        "intensity": 1.8,
                        "direction": {
                            "x": sunAngleVertical,
                            "y": sunAngleVertical,
                            "z": sunAngleHorizontal
                        },
                        "castShadows": true,
                        "shadowBias": 0.25
                    },
                    "ambientLight": {
                        "ambientIntensity": 0.2,
                        "ambientURL": ambientURL
                    },
                    "bloom": {
                        "bloomIntensity": 0.1
                    },
                    "keyLightMode": "enabled",
                    "ambientLightMode": "enabled",
                    "skyboxMode": "enabled",
                    "hazeMode": "disabled",
                    "bloomMode": "enabled",
                });
        }

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
