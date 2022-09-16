# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Pets
![Screenshot of Pets app](https://puu.sh/Jlyaj/56759d0851.png)

This is a tablet app for the [Overte](https://overte.org/) social VR platform that allows you to create a 3D pet that follows and accompanies you. Each pet is animated, and its colors are randomly generated upon creation.

If you don't like your pet's randomly selected colors, simply create a new pet until you get one you like.

###### INSTALLATION
1) Look for the latest release and download it from the [Releases](https://github.com/theanine3D/overte-addons/release) section.
2) Download the ZIP.
3) 4n Overte, go into the Edit-> Running Scripts menu, and press the "Reveal Scripts Folder" button
4) Go into the communityScripts folder in the new window that pops up. Create a folder called "pets"
5) Unzip the zip file you downloaded into this new folder.
6) in Overte's Running Scripts menu, press "From Disk" and navigate to the new folder you just created. Pick the pets.js file.
7) In the bottom of the screen you should now see a Pets button in your main toolbar. Press that to start the app.

This will load the script directly from GitHub, with all of the latest updates, and no other manual download needed.

###### KNOWN BUGS:
- The tablet window will sometimes not load the data in time, leading to inaccurate stats/info being shown on the screen. Just reopen the Pets app until it shows your pet's stats properly. If repeated re-opening still doesn't fix it, you can as a last resort **reset** your pet save data by using Abandon button. Note that this can't be undone.
- The Nametag button is supposed to toggle the pet's nametag visibility, but for some reason, it will only hide (not show) the nametag. To bring the nametag back, press the Respawn button instead for now.
