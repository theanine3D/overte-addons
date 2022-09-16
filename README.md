# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Pets
![Screenshot of Pets app](https://puu.sh/Jlyaj/56759d0851.png)
This is a tablet app for the [Overte](https://overte.org/) social VR platform that allows you to create a 3D pet that follows and accompanies you. Each pet is animated, and its colors are randomly generated upon creation.

If you don't like your pet's randomly selected colors, simply create a new pet until you get one you like.

###### INSTALLATION
In Overte, go into the Edit-> Running Scripts menu, and press the "From URL" button. Then enter the following URL:
https://github.com/theanine3D/overte-addons/raw/main/pets/pets.js

This will load the script directly from GitHub, with all of the latest updates, and no other manual download needed.

###### KNOWN BUGS:
- The tablet window will sometimes not load the data in time, leading to inaccurate stats/info being shown on the screen. Just reopen the Pets app until it shows your pet's stats properly. If for some reason this doesn't fix it, recreate your pet using the Abandon button. That'll reset your pet data.
- The Nametag button is supposed to toggle the pet's nametag visibility, but for some reason, it will only hide (not show) the nametag. To bring the nametag back, press the Respawn button instead for now.
