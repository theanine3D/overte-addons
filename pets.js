"use strict";
//
//  Pets.js
//
//  Created by Pedro Valencia / Theanine3D, September 4, 2022.
//  youtube.com/c/theanine3D
//  twitter.com/theanine3D
//  www.theanine3d.com
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function () {
    var jsMainFileName = "pets.js"; // <=== REPLACE VALUE (File name of this current .js file)
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

    var APP_NAME = "PETS"; // <=== REPLACE VALUE (Caption of the Tablet button.)
    var APP_URL = ROOT + "PetsApp.html"; // <=== REPLACE VALUE (html page that will be your UI)
    var APP_ICON_INACTIVE = ROOT + "pets-i.svg"; // <=== REPLACE VALUE (Provide a 50 X 50 pixels, .png or .svg file, WHITE on transparent background)
    var APP_ICON_ACTIVE = ROOT + "pets-a.svg"; // <=== REPLACE VALUE  (Provide a 50 X 50 pixels, .png or .svg file, BLACK on transparent background)
    var appStatus = false;


    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var button = tablet.addButton({
        text: APP_NAME,
        icon: APP_ICON_INACTIVE,
        activeIcon: APP_ICON_ACTIVE
    });

    // PET VARIABLES

    var petOwner = { uuid: MyAvatar.sessionUUID, name: MyAvatar.displayName, velocity: MyAvatar.velocity };



    var pet = {
        petName: "",
        petFeedCount: 0,
        petBirthDay: new Date(),
        lastFeedDate: new Date(),
        petSpecies: 0,
        petColor: 0
    };
    var currentDate = new Date();

    var petColorTexture = Script.resolvePath(".") + "assets/pets/colors.png";
    var petRoughnessTexture = Script.resolvePath(".") + "assets/pets/r_50.png";
    var petMetallicTexture = Script.resolvePath(".") + "assets/pets/r_0.png";

    // Pet Cleanup - remove any unparented pets that may have been left since last run
    function cleanupPets() {
        var unclearedPetList = Entities.findEntitiesByName("pet_" + petOwner.name + "_" + pet.petName, MyAvatar.position, 1000, false);
        for (var i = 0; i <= (unclearedPetList.length - 1); i++) {
            // if (Entities.isChildOfParent(i, petOwner)) {
            Entities.deleteEntity(i);
            // }
        }

        var unclearedPetMatList = Entities.findEntitiesByName("petColors_" + petOwner.name + "_" + pet.petName, MyAvatar.position, 1000, false);
        for (var i = 0; i <= (unclearedPetList.length - 1); i++) {
            // if (Entities.isChildOfParent(i, petOwner)) {
            Entities.deleteEntity(i);
            // }
        }
    }
    cleanupPets();


    // CREATE PET MODEL ENTITY
    var petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");
    Entities.editEntity(petEntityID, {
        "modelURL": Script.resolvePath(".") + "assets/pets/Egg.fbx",
        "rotation": { x: 0, y: 0, z: 0 }
    });

    Entities.editEntity(petEntityID, {
        "parentID": petOwner.uuid,
        "name": "pet_" + petOwner.name + "_" + "Egg",
    });
    Entities.editEntity(petEntityID, {
        "localPosition": {
            "x": -0.5526,
            "y": 0.8132,
            "z": 0.2594,
        },
        "localRotation": Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
        "visible": false
    });
    Script.setTimeout(function () {
        Entities.editEntity(petEntityID, {
            "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
            "visible": true
        });
    }, 200);

    Entities.editEntity(petEntityID, {
        "rotation": { x: 0, y: 0, z: 0 }
    });

    // ADD PET MATERIAL ENTITY
    var petMatEntityID = Entities.addEntity(
        {
            "type": "Material",
            "materialURL": "materialData",
            "priority": 1,
            "name": "petColors_" + petOwner.name + "_Egg",
        }, "avatar");

    function updatePetMat() {
        Entities.editEntity(petMatEntityID,
            {
                "type": "Material",
                "parentID": petEntityID,
                "materialURL": "materialData",
                "priority": 1,
                "name": "petColors_" + petOwner.name + "_" + pet.petName,
                "parentMaterialName": "mat::colors",
                "materialMappingPos": {
                    "x": pet.petColor,
                    "y": 0.0
                },
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "colors",
                            "model": "hifi_pbr",
                            "albedoMap": petColorTexture,
                            "roughnessMap": petRoughnessTexture,
                            "metallicMap": petMetallicTexture,
                            "unlit": false
                        }
                    ]
                })
            });

        // FAIRY SPECIFIC
        if (pet.petSpecies === 0) {
            Entities.editEntity(petMatEntityID, {
                "materialData": JSON.stringify({
                    "materialVersion": 1,
                    "materials": [
                        {
                            "name": "colors",
                            "model": "hifi_pbr",
                            "albedoMap": petColorTexture,
                            "roughnessMap": petRoughnessTexture,
                            "metallicMap": petMetallicTexture,
                            "unlit": true
                        }
                    ]
                })
            });
        }

        // BIRD SPECIFIC
        // DRAGON SPECIFIC
        // BAT SPECIFIC
        // CHAO SPECIFIC
        // MAG SPECIFIC

    }

    updatePetMat();


    // YOU CAN ADD/REMOVE PET SPECIES BY EDITING THIS SECTION.
    var LIST_SPECIES = ['Fairy', 'Bird'];
    var SPECIES = Array();

    var LIST_ANIMATIONS =
        ['idle'];
    var ANIMATIONS = Array();

    // THIS IS USED TO PREFETCH/CACHE ALL PET ANIMATIONS FOR FASTER LOADING LATER
    for (var i = 0; i <= (LIST_ANIMATIONS.length - 1); i++) {

        for (var j = 0; j < LIST_SPECIES.length; j++) {
            var animationURL = Script.resolvePath(".") + "assets/pets/anims/" + LIST_SPECIES[j] + " anim " + LIST_ANIMATIONS[i] + ".fbx";
            var resourceAnim = AnimationCache.prefetch(animationURL);
            var animation = AnimationCache.getAnimation(animationURL);
            ANIMATIONS[j] = { name: LIST_ANIMATIONS[i], url: animationURL, resource: resourceAnim, animation: animation };
        }
    }

    LIST_SPECIES.forEach(function (name) {
        var speciesURL = Script.resolvePath("assets/pets/") + name + ".fbx";
        var thumbnailURL = Script.resolvePath("assets/pets/" + name + ".png");
        var thumbnailCached = TextureCache.prefetch(thumbnailURL);
        SPECIES[name] = { name: name, url: speciesURL, thumbnailURL: thumbnailURL };
    });


    // Start listener for player's speed, for adjusting pet animation speed
    Script.update.connect(constantLoop);

    function constantLoop(deltaTime) {
        petOwner.velocity = MyAvatar.velocity;
        if (petOwner.velocity.x > 0 || petOwner.velocity.y > 0 || petOwner.velocity.z > 0) {
            Entities.editEntity(petEntityID, {
                "animation": {
                    fps: 60
                }
            });
        }
        else {
            Entities.editEntity(petEntityID, {
                "animation": {
                    fps: 30
                }
            });
        }
    }


    function onClicked() {
        if (appStatus === true) {
            tablet.gotoHomeScreen();
            appStatus = false;
        } else {
            //Launching the Application UI. 

            //Data can be transmitted using GET methode, through paramater in the URL.
            tablet.gotoWebScreen(APP_URL);
            appStatus = true;
        }

        button.editProperties({
            isActive: appStatus
        });
    }

    function updatePetPresets() {
        var petPresetList = {
            "speciesList": LIST_SPECIES
        };
        tablet.emitScriptEvent(JSON.stringify(petPresetList));
    }

    function updatePetMood() {
        // update mood
        var petMood = Math.floor(Math.abs((currentDate.getTime() - pet.lastFeedDate.getTime()) / (1000 * 3600 * 24)));
        if (petMood >= 2) {
            // if more than 2 days have passed since last feed date
            Entities.editEntity(petEntityID, {
                "blendshapeCoefficients": "{happy:0, angry:1, sad:0}"
            });
        }
        else if (petMood < 2 && petMood > 1) {
            // if pet has been fed in the previous day
            Entities.editEntity(petEntityID, {
                "blendshapeCoefficients": "{happy:0, angry:0, sad:1}"
            });
        }
        else if (petMood <= 1) {
            // if pet has been fed within the last 24 hours
            Entities.editEntity(petEntityID, {
                "blendshapeCoefficients": "{happy:0, angry:0, sad:0}"
            });
        }
    }

    function updatePets() {

        if (pet['petName'] === '') {

            // No pet data found, so prompt the user to create one
            tablet.emitScriptEvent("lock buttons");

            var newPetName = "";

            while (newPetName === "" || newPetName === null) { // check if user actually entered any name
                var newPetName = Window.prompt("No pet data was found. Please enter the name of your new pet:", "PET NAME");
            }

            // Calculate current date
            currentDate = new Date();

            pet = {
                petName: newPetName,
                petFeedCount: 0,
                petBirthDay: currentDate,
                lastFeedDate: currentDate,
                petSpecies: (Math.floor(Math.random() * ((LIST_SPECIES.length - 1) - 0 + 1) + 0)),
                petColor: Math.floor(Math.random() * 10) * .1
            };

            Entities.editEntity(petEntityID, {
                "name": "pet_" + petOwner.name + "_" + pet.petName
            });

            Entities.editEntity(petEntityID, {
                "modelURL": Script.resolvePath(".") + "assets/pets/" + LIST_SPECIES[pet.petSpecies] + ".fbx",
                "visible": false,
                "localRotation": Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                "animation": {
                    url: ANIMATIONS[pet.petSpecies].url,
                    firstFrame: 1,
                    lastFrame: ANIMATIONS[pet.petSpecies].animation.frames.length - 1,
                    loop: true,
                    running: true
                }
            });

            Script.setTimeout(function () {
                Entities.editEntity(petEntityID, {
                    "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
                    "visible": true
                });
            }, 200);

            // update pet material
            Entities.editEntity(petMatEntityID, {
                "materialMappingPos": { x: pet.petColor, y: 0 },
                "parentMaterialName": "mat::colors",
                "parentID": petEntityID
            });
            updatePetMat();
            updatePetMood();


            tablet.emitScriptEvent("unlock buttons");

        }

        // update these stats, no matter what
        Entities.editEntity(petEntityID, {
            "name": "pet_" + petOwner.name + "_" + pet.petName,
        });
        Entities.editEntity(petMatEntityID, {
            "name": "petColors_" + petOwner.name + "_" + pet.petName,
        });

        tablet.emitScriptEvent(JSON.stringify(pet));
        // print("Sent pet data to tablet.")

    }

    // Feed button
    function feedPet() {
        // check if pet was already fed today
        if (pet.lastFeedDate.getMonth() === currentDate.getMonth() && pet.lastFeedDate.getFullYear() === currentDate.getFullYear() && pet.lastFeedDate.getDate() === currentDate.getDate()) {
            // if pet was already fed today, notify the pet owner
            Window.alert("Your pet is full. Try again later.");
        }
        else {
            pet.lastFeedDate = new Date();
            pet.petFeedCount += 1;

            updatePetMood();

            Window.alert("Yummy! ${pet.petName} appreciates you!");
            updatePets();
        }
    }


    function onWebEventReceived(message) {
        //Here you can react to the different attributes of the object recieved from the HTML UI
        /*
        if(eventObj.attribute === "installScript"){
     
            //We could reply using: 
            //tablet.emitScriptEvent(JSON.stringify(anyJSONObject));
        }
        */

        if (typeof message === "string") {

            // if web page reports being ready... update the pet data.
            if (message === "ready") {
                print("Pets app is ready.");

                updatePets();

                updatePetPresets();


            }

            // if FEED button was pressed....
            if (message === "feed") {
                feedPet();
            }
            // END FEED

            // if HIDE button was pressed....
            if (message === "hide") {
                print("HIDE button was pressed. *******************");

                Entities.editEntity(petEntityID, {
                    "visible": !Entities.getEntityProperties(petEntityID).visible
                });
            }
            // END HIDE

            // if RENAME button was pressed....
            if (message === "rename") {
                var newPetName = "";
                while (newPetName === "" || newPetName === null) { // check if user actually entered any name
                    newPetName = Window.prompt("Please enter the name of your new pet:", "PET NAME");
                }
                pet.petName = newPetName;
                Entities.editEntity(petEntityID, {
                    "name": "pet_" + petOwner.name + "_" + pet.petName
                });
                Entities.editEntity(petMatEntityID, {
                    "name": "petColors_" + petOwner.name + "_" + pet.petName,
                });

                updatePets();
            }
            // END RENAME


            // if RESPAWN button was pressed....
            if (message === "respawn") {

                cleanupPets();
                Entities.deleteEntity(petEntityID);
                Entities.deleteEntity(petMatEntityID);

                petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");
                Entities.editEntity(petEntityID, {
                    "modelURL": Script.resolvePath(".") + "assets/pets/" + LIST_SPECIES[pet.petSpecies] + ".fbx",
                    "rotation": { x: 0, y: 0, z: 0 },
                    "visible": false,
                    "animation": {
                        url: ANIMATIONS[pet.petSpecies].url,
                        firstFrame: 1,
                        lastFrame: ANIMATIONS[pet.petSpecies].animation.frames.length - 1,
                        loop: true,
                        running: true
                    }
                });

                Entities.editEntity(petEntityID, {
                    "parentID": petOwner.uuid,
                    "name": "pet_" + petOwner.name + "_" + pet.petName,
                    "visible": false
                });

                Script.setTimeout(function () {
                    Entities.editEntity(petEntityID, {
                        "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
                        "visible": true
                    });
                }, 200);

                petMatEntityID = Entities.addEntity(
                    {
                        "type": "Material",
                        "parentID": petEntityID,
                        "materialURL": "materialData",
                        "priority": 1,
                        "name": "petColors_" + petOwner.name + "_" + pet.petName,
                        "parentMaterialName": "mat::colors",
                        "materialMappingPos": {
                            "x": pet.petColor,
                            "y": 0.0
                        }
                    }, "avatar");

                updatePetMat();

                Entities.editEntity(petEntityID, {
                    "localPosition": {
                        "x": -0.5526,
                        "y": 0.8132,
                        "z": 0.2594,
                    },
                    "localRotation": Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                });

                Script.setTimeout(function () {
                    Entities.editEntity(petEntityID, {
                        "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
                        "visible": true
                    });
                }, 200);

                updatePets();
            }
            // END RESPAWN

            // if ABANDON button was pressed....
            if (message === "abandon") {

                var confirmAbandon = Window.confirm("Are you SURE you want to abandon your pet? If you say yes, your pet will disappear, never to be seen again...");

                if (confirmAbandon === true) {
                    petOwner = { uuid: MyAvatar.sessionUUID, name: MyAvatar.displayName };
                    pet = {
                        petName: "",
                        petFeedCount: 0,
                        petBirthDay: new Date(),
                        lastFeedDate: new Date(),
                        petSpecies: 0,
                        petColor: Math.floor(Math.random() * 10) * .1
                    };

                    Entities.deleteEntity(petMatEntityID);
                    Entities.deleteEntity(petEntityID);

                    petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");
                    Entities.editEntity(petEntityID, {
                        "modelURL": Script.resolvePath(".") + "assets/pets/Egg.fbx",
                        "rotation": { x: 0, y: 0, z: 0 }
                    });

                    Entities.editEntity(petEntityID, {
                        "parentID": petOwner.uuid,
                        "name": "pet_" + petOwner.name + "_" + "Egg",
                    });
                    Entities.editEntity(petEntityID, {
                        "localPosition": {
                            "x": -0.5526,
                            "y": 0.8132,
                            "z": 0.2594,
                        },
                        "localRotation": Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                        "visible": false
                    });
                    Script.setTimeout(function () {
                        Entities.editEntity(petEntityID, {
                            "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
                            "visible": true
                        });
                    }, 200);

                    // ADD PET MATERIAL ENTITY
                    petMatEntityID = Entities.addEntity(
                        {
                            "type": "Material",
                            "parentID": petEntityID,
                            "materialURL": "materialData",
                            "priority": 1,
                            "name": "petColors_" + petOwner.name + "_" + pet.petName,
                            "parentMaterialName": "mat::colors",
                            "materialMappingPos": {
                                "x": pet.petColor,
                                "y": 0.0
                            },
                        }, "avatar");
                    updatePetMat();
                }
                else {
                    Window.alert("Your pet is grateful.");
                }
                updatePets();
            }
            // END ABANDON

        }


    }

    function onScreenChanged(type, url) {
        if (type === "Web" && url.indexOf(APP_URL) !== -1) {
            appStatus = true;
            //Here we know that the HTML UI is loaded.
            //We could communicate to it here as we know it is loaded. Using:
            //tablet.emitScriptEvent(JSON.stringify(anyJSONObject));

        } else {
            appStatus = false;
            updatePets();
            updatePetMat();
            tablet.closeDialog();
        }

        button.editProperties({
            isActive: appStatus
        });
    }

    function cleanup() {

        if (appStatus) {
            tablet.gotoHomeScreen();
            tablet.onWebEventReceived.disconnect(onWebEventReceived);
        }

        tablet.screenChanged.disconnect(onScreenChanged);
        Script.update.disconnect(constantLoop);

        tablet.removeButton(button);
        tablet.closeDialog();
    }

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(cleanup);
}());