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

    tablet.screenChanged.connect(onScreenChanged);

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
        petSpecies: 0
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
    });

    Entities.editEntity(petEntityID, {
        "dimensions": {
            "x": (Entities.getEntityProperties(petEntityID).naturalDimensions.x * MyAvatar.scale),
            "y": (Entities.getEntityProperties(petEntityID).naturalDimensions.y * MyAvatar.scale),
            "z": (Entities.getEntityProperties(petEntityID).naturalDimensions.y * MyAvatar.scale)
        },
        "rotation":
            Quat.dot(MyAvatar.orientation, Quat.fromVec3Degrees({ "x": 0, "y": 180, "x": 0 }))
    });

    Entities.editEntity(petEntityID, {
        "parentID": petOwner.uuid,
        "name": "pet_" + petOwner.name + "_" + "Egg",
    });
    Entities.editEntity(petEntityID, {
        "localPosition": {
            "x": -0.5526,
            "y": 0.8132,
            "z": 0.2594
        },
    });


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
        var resourceSpecies = AnimationCache.prefetch(speciesURL);
        var resourceSpeciesThumb = AnimationCache.prefetch(thumbnailURL);
        SPECIES[name] = { name: name, url: speciesURL, thumbnailURL: thumbnailURL, resourceSpecies: resourceSpecies, resourceSpeciesThumb: resourceSpeciesThumb };
    });

    function clicked() {
        if (appStatus === true) {
            tablet.WebEventReceived.disconnect(onWebEventReceived);
            tablet.gotoHomeScreen();
            appStatus = false;
        } else {
            //Launching the Application UI. 

            //Data can be transmitted using GET methode, through paramater in the URL.
            tablet.gotoWebScreen(APP_URL);
            tablet.webEventReceived.connect(onWebEventReceived);
            appStatus = true;
        }

        button.editProperties({
            isActive: appStatus
        });
    }

    button.clicked.connect(clicked);

    function updatePetPresets() {
        var petPresetList = {
            "speciesList": LIST_SPECIES
        };
        tablet.emitScriptEvent(JSON.stringify(petPresetList));
        print("Sent pet presets to tablet.")
    }

    function updatePets() {
        if (pet['petName'] === '') {

            // No pet data found, so prompt the user to create one
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
                petSpecies: (Math.floor(Math.random() * ((LIST_SPECIES.length - 1) - 0 + 1) + 0))
            };

            Entities.editEntity(petEntityID, {
                "name": "pet_" + petOwner.name + "_" + pet.petName
            });

            Entities.editEntity(petEntityID, {
                "modelURL": ""
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
            });

        }
        tablet.emitScriptEvent(JSON.stringify(pet));
        print("Sent pet data to tablet.")

    }

    // Feed button
    function feedPet() {
        // check if pet was already fed today
        if (pet.lastFeedDate.getMonth() === currentDate.getMonth() && pet.lastFeedDate.getFullYear() === currentDate.getFullYear() && pet.lastFeedDate.getDate() === currentDate.getDate()) {
            // if pet was already fed today, notify the pet owner
            Window.alert("Your pet is full. Try again later.");
            print(JSON.stringify(pet.petFeedCount));
        }
        else {
            pet.lastFeedDate = new Date();
            pet.petFeedCount += 1;
            Window.alert("Yummy! ${pet.petName} appreciates you!");
            updatePets();
        }
        tablet.emitScriptEvent("unlock buttons");
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

            // if FOLLOW button was pressed....
            if (message === "follow") {
                print("Follow button was pressed.");
                if (followState) {
                    followState = false;
                }
                else {
                    followState = true;
                }
            }
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
    }

    Script.scriptEnding.connect(cleanup);
}());
