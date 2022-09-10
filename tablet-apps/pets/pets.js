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

    var petOwner = { uuid: MyAvatar.sessionUUID, name: MyAvatar.displayName };
    var pet = {
        petName: "",
        petFeedCount: 0,
        petBirthDay: new Date(),
        lastFeedDate: new Date(),
        petSpecies: 0,
        petColor: 0
    };
    var currentDate = new Date();
    var followState = true;

    // CREATE BASIC 3D PET ENTITY
    var petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");
    Entities.editEntity(petEntityID, {
        "modelURL": Script.resolvePath(".") + "assets/pets/Egg.fbx",
        "animation": {
            "url": "https://puu.sh/JjS5i/e6b62c5ed8.glb",
            "allowTranslation": false,
            "fps": 24,
            "currentFrame": 8.702019691467285,
            "running": true,
            "firstFrame": 1,
            "lastFrame": 23
        },
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

    // YOU CAN ADD/REMOVE PET SPECIES BY EDITING THIS SECTION.
    var LIST_SPECIES = ['Rice Ball', 'Fairy'];
    var SPECIES = Array();

    var LIST_ANIMATIONS =
        ['Neutral', 'Happy', 'Sad'];
    var ANIMATIONS = Array();

    LIST_ANIMATIONS.forEach(function (name) {
        var animationURL = Script.resolvePath(".") + "assets/pets/" + name + ".fbx";
        var resourceAnim = AnimationCache.prefetch(animationURL);
        var animation = AnimationCache.getAnimation(animationURL);
        ANIMATIONS[name] = { name: name, url: animationURL, resource: resourceAnim, animation: animation };
    });

    LIST_SPECIES.forEach(function (name) {
        var speciesURL = Script.resolvePath("assets/pets/") + name + ".fbx";
        var thumbnailURL = Script.resolvePath("assets/pets/" + name + ".png");
        // var resourceSpecies = ModelCache.prefetch(speciesURL);
        // var resourceSpeciesTextures = TextureCache.prefetch(speciesURL);
        // var resourceSpeciesThumb = TextureCache.prefetch(thumbnailURL);
        SPECIES[name] = { name: name, url: speciesURL, thumbnailURL: thumbnailURL };
        // SPECIES[name] = { name: name, url: speciesURL, thumbnailURL: thumbnailURL, resourceSpecies: resourceSpecies, resourceSpeciesThumb: resourceSpeciesThumb };
    });


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
        // print("Sent pet presets to tablet.")
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
                petColor: Math.random()
            };

            Entities.editEntity(petEntityID, {
                "name": "pet_" + petOwner.name + "_" + pet.petName
            });

            Entities.editEntity(petEntityID, {
                "modelURL": Script.resolvePath(".") + "assets/pets/" + LIST_SPECIES[pet.petSpecies] + ".fbx",
                "animation": {
                    "url": "https://puu.sh/JjS5i/e6b62c5ed8.glb",
                    "allowTranslation": false,
                    "fps": 24,
                    "currentFrame": 8.702019691467285,
                    "running": true,
                    "firstFrame": 1,
                    "lastFrame": 23
                },
                "visible": false,
                "localRotation": Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 })
            });

            Script.setTimeout(function () {
                Entities.editEntity(petEntityID, {
                    "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
                    "visible": true
                });
            }, 200);

            tablet.emitScriptEvent("unlock buttons");

        }

        // update some stats


        Entities.editEntity(petEntityID, {
            "name": "pet_" + petOwner.name + "_" + pet.petName,
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

                updatePetPresets();

                updatePets();

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

                updatePets();
            }
            // END RENAME

            // if RESPAWN button was pressed....
            if (message === "respawn") {

                // check if pet model entity doesn't exist. if it doesn't, recreate it
                if (Entities.isAddedEntity(petEntityID) === false) {
                    petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");
                    Entities.editEntity(petEntityID, {
                        "modelURL": Script.resolvePath(".") + "assets/pets/" + LIST_SPECIES[pet.petSpecies] + ".fbx",
                        "animation": {
                            "url": "https://puu.sh/JjS5i/e6b62c5ed8.glb",
                            "allowTranslation": false,
                            "fps": 24,
                            "currentFrame": 8.702019691467285,
                            "running": true,
                            "firstFrame": 1,
                            "lastFrame": 23
                        },
                        "rotation": { x: 0, y: 0, z: 0 },
                        "visible": false
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
                }

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
                        petColor: 0
                    };

                    Entities.deleteEntity(petEntityID);

                    petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");
                    Entities.editEntity(petEntityID, {
                        "modelURL": Script.resolvePath(".") + "assets/pets/Egg.fbx",
                        "animation": {
                            "url": "https://puu.sh/JjS5i/e6b62c5ed8.glb",
                            "allowTranslation": false,
                            "fps": 24,
                            "currentFrame": 8.702019691467285,
                            "running": true,
                            "firstFrame": 1,
                            "lastFrame": 23
                        },
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

                    updatePets();
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
        Entities.deleteEntity(petEntityID);
        tablet.removeButton(button);
        tablet.closeDialog();
    }

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(cleanup);
}());
