# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Bridge Server
A work-in-progress WebSockets server script that runs within an existing Overte domain server (via assignment client). The bridge server provides a friendly WebSockets API for other software, engines, and platforms to connect to the Overte domain server and interact with it. For now, instructions to set it up are primarily found in the script itself, but you can add it to your domain server via the server's web-based settings panel ("Content" -> Scripts). I recommend uploading it to your server's ATP asset server and using the URL from there. Note: extremely alpha and in need of more testing, so do not use in a production environment yet.

Currently, Overte randomizes the port of every WebSocketsServer, making this script less useful. However, [an issue](https://github.com/overte-org/overte/issues/396) has been created for this limitation in Overte to be addressed. 

Roadmap:
- Implement Blender bridge functions to enable use of Blender as the sole scene editing tool for Overte 
- Implement Agent API commands for creating an in-world bot, to allow visitors from other virtual worlds
- Implement GPT4All integration, allowing in-world bots to listen and respond to messages from users

## Pets
![image](https://user-images.githubusercontent.com/88953117/232934794-178226a0-a672-4331-b185-b22624331f37.png)

This is a tablet app for the [Overte](https://overte.org/) social VR platform that allows you to create a 3D pet that follows and accompanies you. Each pet is animated, and its colors are randomly generated upon creation.

See the [readme](https://github.com/theanine3D/overte-addons/tree/main/pets) for more information.

## Day/Night System 
![image](https://user-images.githubusercontent.com/88953117/192127729-305ca563-9ff8-4f4c-a45f-c06d2737f8cd.png)

This is a scripted day/night system for  [Overte](https://overte.org/).

See the [readme](https://github.com/theanine3D/overte-addons/tree/main/DayNight_System) for more information.
