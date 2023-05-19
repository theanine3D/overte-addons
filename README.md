# overte-addons
My personal collection of scripts, shaders, and addons for the open source social VR platform, [Overte](https://overte.org/).

## Bridge Server
A WebSockets server script that runs within an existing Overte domain server. The bridge server provides a friendly WebSockets API for other software, engines, and platforms to connect to the Overte domain server and interact with it. A simple CLI client is provided that can be used to interface with the bridge server via command line promps. Blender bridge and AI functions are on the roadmap.
#### Setup
- Download the [bridge_server.js](https://github.com/theanine3D/overte-addons/blob/main/Bridge_Server/bridge_server.js) and [empty.js](https://github.com/theanine3D/overte-addons/blob/main/Bridge_Server/empty.js) files and customize the settings in the upper part of of the bridge_server.js script. Especially the user and admin passwords.
- Upload both of those two .js files to the root of your ATP / asset server. This is in the Edit menu in Interface.
- Import the [bridge3D.json](https://github.com/theanine3D/overte-addons/blob/main/Bridge_Server/bridge3D.json) file into your Overte scene. You'll see a 3D spinnning globe appear with a status message above it.
- The bridge server should begin running automatically as soon as you import the JSON file. Sometimes you might need to restart the domain server though.
- Using Python, you can run the [test client](https://github.com/theanine3D/overte-addons/blob/main/Bridge_Server/test_client.py) via a command line to interact with your new bridge server.

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
