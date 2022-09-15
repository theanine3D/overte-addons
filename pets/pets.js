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

    // CREATE PET VARIABLES

    var petOwner = { uuid: MyAvatar.sessionUUID, name: MyAvatar.displayName, velocity: MyAvatar.velocity };

    // Create backup/fallback pet settings just in case
    var petDefault = {
        petName: "Egg",
        petFeedCount: 0,
        petBirthDay: new Date(),
        lastFeedDate: new Date(),
        petSpecies: 0,
        petColor: Math.floor(Math.random() * 10) * .1
    };

    var pet = {
        petName: "Egg",
        petFeedCount: 0,
        petBirthDay: new Date(),
        lastFeedDate: new Date(),
        petSpecies: 0,
        petColor: 0
    };

    // Check if there's saved data, and if so, load it
    if (Settings.getValue("pet") !== 0 || Settings.getValue("pet").petName !== undefined) {
        pet = Settings.getValue("pet");
    }
    else { Settings.setValue("pet", petDefault); }

    var currentDate = new Date();

    var petColorTexture = Script.resolvePath(".") + "assets/pets/colors.png";
    var petRoughnessTexture = Script.resolvePath(".") + "assets/pets/r_50.png";
    var petMetallicTexture = Script.resolvePath(".") + "assets/pets/r_0.png";

    // YOU CAN ADD/REMOVE PET SPECIES BY EDITING THIS SECTION.
    var LIST_SPECIES = ['Fairy', 'Bird', 'Dragon'];
    var SPECIES = Array();

    var LIST_MOODS = ["Neutral", "Happy", "Sad", "Angry"];

    var LIST_ANIMATIONS = ['idle'];
    var ANIMATIONS = Array();

    // THIS IS USED TO PREFETCH/CACHE ALL PET ANIMATIONS FOR FASTER LOADING LATER
    for (var j = 0; j < LIST_SPECIES.length; j++) {
        ANIMATIONS[j] = Array();
        for (var k = 0; k < LIST_MOODS.length; k++) {
            ANIMATIONS[j][k] = Array();
            for (var i = 0; i < LIST_ANIMATIONS.length; i++) {
                var animationURL = Script.resolvePath(".") + "assets/pets/anims/" + LIST_SPECIES[j] + " anim " + LIST_ANIMATIONS[i] + LIST_MOODS[k] + ".fbx";
                var resourceAnim = AnimationCache.prefetch(animationURL);
                var animation = AnimationCache.getAnimation(animationURL);
                ANIMATIONS[j][k] = { name: LIST_ANIMATIONS[i], url: animationURL, resource: resourceAnim, animation: animation };
            }
        }
    }

    LIST_SPECIES.forEach(function (name) {
        for (i = 0; i < 10; i++) {
            var speciesURL = Script.resolvePath("assets/pets/") + name + ".fbx";
            var thumbnailURL = Script.resolvePath("assets/pets/thumbnails/" + name + i + ".png");
            var thumbnailCached = TextureCache.prefetch(thumbnailURL);
            SPECIES[name] = { name: name, url: speciesURL };
        }
    });


    // Pet Cleanup - remove any unparented pets that may have been left since last run


    function cleanupPets() {

        var unclearedPetEntities = Entities.getChildrenIDs(MyAvatar.sessionUUID);
        for (var i = 0; i < unclearedPetEntities.length; i++) {
            if (Entities.getEntityProperties(unclearedPetEntities[i]).name.indexOf("pet_" + MyAvatar.displayName) !== -1) {
                Entities.editEntity(unclearedPetEntities[i], {
                    "materials": null,
                    "parentID": null,
                    "visible": false
                });

                Entities.editEntity(unclearedPetEntities[i], {
                    "lifetime": .1
                });

            }
        }
    }

    cleanupPets();

    // CREATE PET ENTITY VARIABLES
    var petEntityID = null;
    var petMatEntityID = null
    var petNametagEntityID = null;


    // DEFINE PET FUNCTIONS

    function updatePetMat() {
        Entities.editEntity(petMatEntityID,
            {
                "type": "Material",
                "parentID": petEntityID,
                "materialURL": "materialData",
                "visible": true,
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

    function updateNameTag(toggleHide) {

        Entities.editEntity(petNametagEntityID, {
            "name": "petNametag" + "_" + petOwner.name + "_" + pet.petName,
            "parentID": petEntityID,
            "visible": true,
            "text": pet.petName,
            "dimensions": {
                "x": 1.0246875286102295,
                "y": 0.08865754306316376,
                "z": 0.009999999776482582
            },
            "rotation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 0
            },
            "queryAACube": {
                "x": -0.5142822265625,
                "y": -0.5142822265625,
                "z": -0.5142822265625,
                "scale": 1.028564453125
            },
        });
        Entities.editEntity(petNametagEntityID, {
            "localPosition": {
                "x": 0,
                "y": 0,
                "z": 0.816,
            },
            "localRotation": { "x": 0, "y": 0, "z": 0, w: 1 },
            "parentJointIndex": 0
        });

        if (toggleHide === true) {
            var nametagIsVisible = Entities.getEntityProperties(petNametagEntityID).visible;
            if (nametagIsVisible) {
                Entities.editEntity(petNametagEntityID, {
                    "visible": false
                });
            }
            else {
                Entities.editEntity(petNametagEntityID, {
                    "visible": true
                });
            }
        }

    }

    function updatePetPresets() {
        var petPresetList = {
            "speciesList": LIST_SPECIES
        };
        tablet.emitScriptEvent(JSON.stringify(petPresetList));
    }

    function updatePetMood() {
        // update mood
        var tempFeedDate = new Date(pet.lastFeedDate);
        var petMood = Math.floor(Math.abs((currentDate.getTime() - tempFeedDate.getTime()) / (1000 * 3600 * 24)));
        if (petMood >= 2) {
            // if more than 2 days have passed since last feed date
            Entities.editEntity(petEntityID, {
                "animation": {
                    url: ANIMATIONS[pet.petSpecies][3].url,
                    firstFrame: 1,
                    lastFrame: ANIMATIONS[pet.petSpecies][3].animation.frames.length - 1,
                    loop: true,
                    running: true
                }
            });
        }
        else if (petMood < 2 && petMood >= 1) {
            // if pet has been fed in the previous day
            Entities.editEntity(petEntityID, {
                "animation": {
                    url: ANIMATIONS[pet.petSpecies][2].url,
                    firstFrame: 1,
                    lastFrame: ANIMATIONS[pet.petSpecies][2].animation.frames.length - 1,
                    loop: true,
                    running: true
                }
            });
        }
        else if (petMood < 1) {
            // if pet has been fed within the last 24 hours
            Entities.editEntity(petEntityID, {
                "animation": {
                    url: ANIMATIONS[pet.petSpecies][0].url,
                    firstFrame: 1,
                    lastFrame: ANIMATIONS[pet.petSpecies][0].animation.frames.length - 1,
                    loop: true,
                    running: true
                }
            });
        }
    }

    function modifyBySpecies() {

        // This function is used to make species-specific modifications to the pet, nametag, and/or material entity.
        // Note that the "materials" property needs to be set in full. You can't just change one subproperty inside "materials." All subproperties of "materials" need to be set.

        // FAIRY SPECIFIC MODIFICATIONS
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

            Entities.editEntity(petNametagEntityID, {
                "localPosition": {
                    "x": 0,
                    "y": 0,
                    "z": 0.6
                }
            });
        }

    }


    function setupPet(respawning) {

        cleanupPets();

        petOwner = { uuid: MyAvatar.sessionUUID, name: MyAvatar.displayName };

        if (respawning === false) {
            pet = {
                petName: "Egg",
                petFeedCount: 0,
                petBirthDay: new Date(),
                lastFeedDate: new Date(),
                petSpecies: 0,
                petColor: Math.floor(Math.random() * 10) * .1
            };
        }

        // TEST AREA, USED FOR TESTING LEVEL/MOOD EFFECTS. Press Respawn button to trigger the test values. Comment out the lines when not debugging
        // pet = {
        //     petName: "Test Subject",
        //     petFeedCount: 88,
        //     petBirthDay: new Date("September 4, 2022 03:24:00"),
        //     lastFeedDate: new Date("September 1, 2022 00:00:00"),
        //     petSpecies: 2,
        //     petColor: .3
        // };

        Entities.deleteEntity(petNametagEntityID);
        Entities.deleteEntity(petMatEntityID);
        Entities.deleteEntity(petEntityID);

        petEntityID = Entities.addEntity(Script.require("./assets/pets/pet.json"), "avatar");

        if (respawning === false) {
            Entities.editEntity(petEntityID, {
                "modelURL": Script.resolvePath(".") + "assets/pets/Egg.fbx",
                "rotation": { x: 0, y: 0, z: 0 },
            });
            Entities.editEntity(petEntityID, {
                "parentID": petOwner.uuid,
                "visible": true,
                "name": "pet_" + petOwner.name + "_" + "Egg",
            });
        }

        else {
            Entities.editEntity(petEntityID, {
                "modelURL": Script.resolvePath(".") + "assets/pets/" + LIST_SPECIES[pet.petSpecies] + ".fbx",
                "rotation": { x: 0, y: 0, z: 0 }
            });
            Entities.editEntity(petEntityID, {
                "parentID": petOwner.uuid,
                "name": "pet_" + petOwner.name + "_" + pet.petName,
                "visible": false
            });
        }

        Entities.editEntity(petEntityID, {
            "localPosition": {
                "x": -0.5526,
                "y": 0.8132,
                "z": 0.2594,
            },
            "localRotation": Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
            "visible": true,
            "animation": {
                url: ANIMATIONS[pet.petSpecies][0].url,
                firstFrame: 1,
                lastFrame: ANIMATIONS[pet.petSpecies][0].animation.frames.length - 1,
                loop: true,
                running: true
            }
        });

        while (Entities.isLoaded(petEntityID) === false) {
            Entities.editEntity(petEntityID, {
                "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
                "visible": false
            });
        }

        Entities.editEntity(petEntityID, {
            "dimensions": Entities.getEntityProperties(petEntityID).naturalDimensions,
            "visible": true
        });

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

        updatePetMood();

        // ADD NEW NAMETAG ENTITY
        petNametagEntityID = Entities.addEntity(Script.require("./assets/pets/nametag.json"), "avatar");
        updateNameTag(false);
    }

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

    function updatePet() {

        if (pet.petName === 'Egg' || pet.petName === "") {

            // No pet data found, so prompt the user to create one
            tablet.emitScriptEvent("lock buttons");

            setupPet(false);

            var newPetName = "";

            while (newPetName === "" || newPetName === null) { // check if user actually entered any name
                var newPetName = Window.prompt("No pet data was found. Please enter the name of your new pet:", "");
            }

            // Calculate current date
            currentDate = new Date();

            pet = {
                petName: newPetName,
                petFeedCount: 0,
                petBirthDay: new Date(),
                lastFeedDate: new Date(),
                petSpecies: (Math.floor(Math.random() * ((LIST_SPECIES.length - 1) - 0 + 1) + 0)),
                petColor: Math.floor(Math.random() * 10) * .1
            };

            setupPet(true);

            tablet.emitScriptEvent("unlock buttons");
        }

        else {
            // Check if there's saved data, and if so, respawn the entity based on the existing pet data
            if (Settings.getValue("pet") !== 0 || Settings.getValue("pet").petName !== undefined) {
                setupPet(true);
            }
        }

        // update these stats, no matter what
        Entities.editEntity(petEntityID, {
            "name": "pet_" + petOwner.name + "_" + pet.petName,
        });
        Entities.editEntity(petMatEntityID, {
            "name": "petColors_" + petOwner.name + "_" + pet.petName,
        });

        // Save data permanently to software settings
        Settings.setValue("pet", pet);

        // PERFORM SPECIES-SPECIFIC EDITS
        modifyBySpecies();


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
            updatePet();
        }

        // make pet smile briefly
        Entities.editEntity(petEntityID, {
            "animation": {
                url: ANIMATIONS[pet.petSpecies][1].url,
                firstFrame: 1,
                lastFrame: ANIMATIONS[pet.petSpecies][1].animation.frames.length - 1,
                loop: true,
                running: true
            }
        });
        Script.setTimeout(function () {
            updatePetMood();
        }, 2000);
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

                updatePet();


            }

            // if FEED button was pressed....
            if (message === "feed") {
                feedPet();
            }
            // END FEED

            // if SHOW/HIDE button was pressed....
            if (message === "hide") {

                Entities.editEntity(petEntityID, {
                    "visible": !Entities.getEntityProperties(petEntityID).visible
                });
                Entities.editEntity(petNametagEntityID, {
                    "visible": Entities.getEntityProperties(petEntityID).visible
                });


            }
            // END HIDE

            // if RENAME button was pressed....
            if (message === "rename") {
                var newPetName = "";
                while (newPetName === "" || newPetName === null) { // check if user actually entered any name
                    newPetName = Window.prompt("Please enter the name of your new pet:", pet.petName);
                }
                pet.petName = newPetName;
                Entities.editEntity(petEntityID, {
                    "name": "pet_" + petOwner.name + "_" + pet.petName
                });
                Entities.editEntity(petMatEntityID, {
                    "name": "petColors_" + petOwner.name + "_" + pet.petName,
                });
                Entities.editEntity(petNametagEntityID, {
                    "name": "petNametag_" + petOwner.name + "_" + pet.petName,
                    "text": pet.petName
                });

                updatePet();
            }
            // END RENAME


            // if RESPAWN button was pressed....
            if (message === "respawn") {
                setupPet(true);
                updatePet();

            }
            // END RESPAWN

            // if ABANDON button was pressed....
            if (message === "abandon") {

                var confirmAbandon = Window.confirm("Are you SURE you want to abandon your pet? If you say yes, your pet will disappear, never to be seen again...");

                if (confirmAbandon === true) {
                    Settings.setValue("pet", petDefault);
                    setupPet(false);
                }
                else {
                    Window.alert("Your pet is grateful.");
                }
                updatePet();
            }
            // END ABANDON

            // if NAMETAG button was pressed
            if (message === "nametag") {
                updateNameTag(true);
            }


        }


    }

    function onScreenChanged(type, url) {
        if (type === "Web" && url.indexOf(APP_URL) !== -1) {
            appStatus = true;
            //Here we know that the HTML UI is loaded.
            //We could communicate to it here as we know it is loaded. Using:
            //tablet.emitScriptEvent(JSON.stringify(anyJSONObject));

            updatePetMat();
            modifyBySpecies();

        } else {
            appStatus = false;

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

        cleanupPets();

        tablet.removeButton(button);
        tablet.closeDialog();
    }

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(cleanup);
}());
