# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Pets
![Screenshot of Pets app](https://puu.sh/Jlyaj/56759d0851.png)

This is a tablet app for the [Overte](https://overte.org/) social VR platform that allows you to create a 3D pet that follows and accompanies you. Each pet is animated, and its colors are randomly generated upon creation.

If you don't like your pet's randomly selected colors, simply create a new pet until you get one you like.

###### INSTALLATION
1) Look for the latest release and download it from the [Releases](https://github.com/theanine3D/overte-addons/releases) section.
2) Download the ZIP.
3) In Overte, go into the Edit-> Running Scripts menu, and press the "Reveal Scripts Folder" button
4) Go into the communityScripts folder in the new window that pops up. Create a folder called "pets"
5) Unzip the zip file you downloaded into this new folder.
6) In Overte's Running Scripts menu, press "From Disk" and navigate to the new folder you just created. Pick the pets.js file.
7) In the bottom of the screen you should now see a Pets button in your main toolbar. Press that to start the app.

###### KNOWN BUGS:
- The tablet window will sometimes not load the data in time, leading to inaccurate stats/info being shown on the screen. Just reopen the Pets app until it shows your pet's stats properly. If repeated re-opening still doesn't fix it, you can as a last resort **reset** your pet save data by using Abandon button. Note that this can't be undone.
- The Nametag button is supposed to toggle the pet's nametag visibility, but for some reason, it will only hide (not show) the nametag. To bring the nametag back, press the Respawn button instead for now.

###### CREATE YOUR OWN PET SPECIES:
In order to add your own custom pets to the app, you will need to create the following for each new species:
- 10 thumbnails (for the 10 different colors) in the assets/pets/thumbnails folder, with the following name format: SPECIES#.png
  -  Replace SPECIES with your new pet's species, ie. Dog
- A rigged 3D model in FBX format, without an animation, but should contain the armature/skeleton. Place this FBX in assets/pets/ and name it SPECIES.fbx (again, replace SPECIES with your new pet's species name)
- 4 animations, one for each different mood (Neutral, Happy, Sad, Angry). Name them each "SPECIES anim idleMOOD.fbx" with the SPECIES keyword replaced with your new species name, and the MOOD keyword replaced with the corresponding mood. These are ALL case sensitive, so if in doubt, try to emulate the naming scheme of the existing pets I already included.
- To use randomized colors, make sure your pet has at least 1 material called **colors**. The pet can have other materials too, but only the one named **colors** will actually be affected by the script. You can apply the colors.png texture in /assets/pets/ to help you UVmap the texture correctly in Blender or other 3D app. 
- Lastly, Modify the species array in the pets.js script, at (around) line 69, where the LIST_SPECIES variable is set. Add your new species to the array as an additional entry. As long as you named the PNG and FBX files above using the correct filename, the script will find them and use them appropriately.
