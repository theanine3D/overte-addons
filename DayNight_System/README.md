
## Day/Night System 
![image](https://user-images.githubusercontent.com/88953117/192127729-305ca563-9ff8-4f4c-a45f-c06d2737f8cd.png)

This is a scripted day/night system for  [Overte](https://overte.org/). Setup is designed to be as simple as possible, easy enough even for people who aren't programmers. Once setup in the scene, the script will automatically modify the sky/lighting throughout the scene, based on your local time of day. Unlike other day/night systems, this one doesn't use any custom shaders, instead making use of a combination of UV offsetting, skeletal animation, and code to pull off the effect.

Note: currently, the script only supports local client time, so the appearance of the scene will differ based on the time zone of every individual connecting to the domain. (ie. a visitor from Asia might see nighttime, but someone in N. America will see daytime). This may change in the future.

###### INSTALLATION:
To add this day/night system to your scene: 
- You should delete any existing zone entities in your scene, as they'll override the one created by this script.
  - (Note: this step can skipped if you customized the script and set variable "useCustomZone" to false, as described below in the Customization section. However, most people should follow this step.)
- In Overte, go into Edit -> Import Entities (.json) From a URL
- Copy/paste [this link](https://theanine3d.github.io/DayNight_System/skyDayNight_Dome.json) into the text box that pops up, and press OK.
- An animated skydome will appear in your scene. Go into the Create app and type "sky_" in the search filter to find it.
- You will see two Model Entities that have "sky_DayNight" in their name. One is a model for the sun/moon, and the other is for everything else. Highlight **both** model entities. This is very important! 
- Once both models are highlighted, move them both so that they are as close to the **visual** center of your scene as possible. This does not necessarily mean coordinate 0,0,0!
- In the Create app, go into the third tab on the left (the Spatial tab, with a blue icon), and in the "Scale" box, type in a very large number - 100000 is often enough. This may vary depending on your specific scene. Feel free to tinker.
-  Press the blue "RESCALE" button. 
-  The scripted skydome will now engulf your scene, with a custom zone entity built-in and created automatically with the same dimensions as the dome.

###### CUSTOMIZATION
The script offers some customization options, for those who don't like the default settings. However, you will need to download the .js script and host it yourself somewhere if you want to tweak the settings. Find the "CUSTOMIZATION" section in the .js file to find these settings:
- cloudSpeed - increase this to make the clouds scroll faster. Default is "1"
- cycleSpeed - Increase this value if you want faster day/night transitions than the real world, instead of every 24 hours. Default is "1"
- useClouds - set to false if you don't want clouds. Default is "true"
- useCustomZone - set this to false if you don't want scene lighting to actually be modified based on night/day. Default is "true"
