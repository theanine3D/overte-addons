# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Pets
![Screenshot of Pets app](https://puu.sh/Jlyaj/56759d0851.png)

This is a tablet app for the [Overte](https://overte.org/) social VR platform that allows you to create a 3D pet that follows and accompanies you. Each pet is animated, and its colors are randomly generated upon creation.

If you don't like your pet's randomly selected colors, simply create a new pet until you get one you like.

###### INSTALLATION
1) In Overte, go into the Edit-> Running Scripts menu, and press the "From URL" button
2) A window will pop up, asking you for a URL. Right click [this link](https://theanine3d.github.io/pets/pets.js) and copy the URL. Then paste into the window in Overte.
3) In the bottom of the screen you should now see a Pets button in your main toolbar. Press that to start the app.

###### KNOWN BUGS:
- The tablet window will sometimes not load the data in time, leading to inaccurate stats/info being shown on the screen. Just reopen the Pets app until it shows your pet's stats properly. If repeated re-opening still doesn't fix it, you can as a last resort **reset** your pet save data by using Abandon button. Note that this can't be undone.
- The Nametag button is supposed to toggle the pet's nametag visibility, but for some reason, it will only hide (not show) the nametag. To bring the nametag back, press the Respawn button instead for now.

###### CREATE YOUR OWN PET SPECIES:
In order to add your own custom pet species to the app, you will need to create the following for each new species:
- 10 thumbnails, 1 for each of the 10 different colors, in 256x256 PNG format, in the assets/pets/thumbnails folder, with the following name format (replacing # with 0-9): SPECIES#.png
  -  Replace SPECIES with your new pet's species, ie. Dog
- A rigged 3D model in FBX format, without an animation, but should contain the armature/skeleton. Place this FBX in assets/pets/ and name it SPECIES.fbx (again, replace SPECIES with your new pet's species name). To get the dimensions/scaling right, import one of the default species' FBX into BLender and stick to the same dimensions.
- 4 animations, one for each different mood (Neutral, Happy, Sad, Angry). Name them each "SPECIES anim idleMOOD.fbx" with the SPECIES keyword replaced with your new species name, and the MOOD keyword replaced with the corresponding mood. These filenames are ALL case sensitive, so if in doubt, try to emulate the naming scheme of the existing pets I already included.
- To use randomized colors, make sure your pet's FBX model has at least 1 material called **colors**. The pet can have other materials too, but only the one named **colors** will actually be affected by the script. You can apply the colors.png texture in /assets/pets/ to help you UVmap the texture correctly in Blender or other 3D app. Note that color 0 is the default color, without any modifications. Colors 1-9 are hue-shifted (by .1) versions of color 0
- Lastly, modify the species list in the pets.js script, at (around) line 69, where the LIST_SPECIES variable is set. Add your new species to the array as an additional entry. As long as you named the PNG and FBX files above using the correct filename, the script will find them and use them appropriately.

## Day/Night System 
![Animated GIF of cloudy night sky](https://puu.sh/JmXAk/f76f74bd4a.gif)

This is a scripted day/night system for  [Overte](https://overte.org/). Once placed in the scene, it will automatically modify the sky/zone/lighting throughout the scene, based on your local time of day. Currently, it only supports local client time, so the appearance of the scene will differ based on the time zone of every individual connecting to the domain. (ie. a visitor from Asia might see nighttime, but someone in N. America will see daytime).

###### INSTALLATION:
To add this day/night system to your scene: 
- You should delete* any existing zone entities in your scene, as they'll override the one created by this script.
  - (Note: this step can skipped if you customized the script and set variable "useCustomZone" to false, as described below in the Customization section. However, most people should follow this step.)
- In Overte, go into Edit -> Import Entities (.json) From a URL
- Copy/paste [this link](https://theanine3d.github.io/DayNight_System/skyDayNight_Dome.json) into the text box that pops up, and press OK.
- An animated skydome will appear in your scene. Go into the Create app and type "sky_" in the search filter to find it.
- You will see two Model Entities that have "sky_DayNight" in their name. One is a model for the sun/moon, and the other is for everything else. Highlight **both** model entities. This is very important! 
- Once both models are highlighted, move them both so that they are as close to the **visual** center of your scene as possible. This does not necessarily mean coordinate 0,0,0!
- In the Create app, go into the third tab on the left (the Spatial tab, with a blue icon), and in the "Scale" box, type in a very large number - 100000 is often enough. This may very depending on your specific scene. Feel free to tinker.
-  Press the blue "RESCALE" button. 
-  The scripted skydome will now engulf your scene, with a custom zone entity built-in and created automatically with the same dimensions as the dome.

###### CUSTOMIZATION
The script offers some customization options, for those who don't like the default settings. However, you will need to download the .js script and host it yourself somewhere if you want to tweak the settings. Find the "CUSTOMIZATION" section in the .js file to find these settings:
- cloudSpeed - increase this to make the clouds scroll faster
- cycleSpeed - Increase this value if you want faster day/night transitions than the real world, instead of every 24 hours
- useClouds - set to false if you don't want clouds during daytime
- useCustomZone - set this to false if you don't want scene lighting to actually be modified based on night/day. Set to true by default.
