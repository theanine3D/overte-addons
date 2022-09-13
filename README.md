# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Pets
This is a tablet app for the [Overte](https://overte.org/) social VR platform that allows you to create a 3D pet that follows and accompanies you. Each pet is animated, and its colors are randomly generated upon creation.

If you don't like your pet's randomly selected colors, simply create a new pet until you get one you like.

###### INSTALLATION
In Overte, go into the Edit-> Running Scripts menu, and press the "From URL" button. Then enter the following URL:
https://github.com/theanine3D/overte-addons/raw/main/pets/pets.js

This will load the script directly from GitHub, with all of the latest updates, and no other manual download needed.

###### KNOWN BUGS:
- If you manually delete any of the model or materal entities created by this app, you may encounter glitches with duplicate "ghost" models. The ghost models usually disappear after a server restart, though.
- The Nametag button is supposed to toggle the pet's nametag visibility, but for some reason, it will only hide (not show) the nametag. To bring the nametag back, press the Respawn button instead.
