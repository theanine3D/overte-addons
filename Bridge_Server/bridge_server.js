//
// Overte Bridge Server - v0.1
//
//      Before use, please customize the security settings near the top.
//
//      Created by Theanine3D / Pedro Valencia
//      github.com/theanine3D
//

// CUSTOMIZEABLE SETTINGS BELOW

// SECURITY SETTINGS
const ENCRYPTED = false;                            // If true, all *networked* messages sent by server will be encrypted, & server will only accept msgs encrypted with key below
const KEY = "3EA66EC1AF586A3FEDE84D7324221";        // Used only if 'encrypted' variable above is set to "true" - for maximum security, use at least a 256-bit key.
const ADMIN_PASSWORD = "S0r4jq6owj";
const USER_PASSWORD = "3dpUcn6C1H";

// GENERAL SETTINGS
var listening = true;                               // If set to false, the bridge server will go offline.
var verbose = true;                                 // If true, the bridge server will repeatedly send out messages on the messaging server of its current status, which entities in-world can receive
var local_only = false;                             // If true, only localhost can connect to bridge. Recommended if only connecting with Blender on same machine as bridge server

const STATUS_CHANNEL = "bridge.status";  // Status messages about the bridge server, available to in-world entities
const CHAT_CHANNEL = "bridge.chat";      // Channel for chat messages exchanged between server/client(s)
const AI_CHANNEL = "bridge.ai";          // AI bot messages. In-world NPC bots can be scripted to listen on this channel

const PORT = 59999;                                 // If set to 0, the port will be randomized every time the script begins running (not recommended))
const DOMAIN_NAME = "Overte World";                 // A name for your server - can be anything. Primarily used in the server's greeting message when a new client connects.

const EDIT_ENABLED = true;                          // If enabled, editing operations will be available to authenticated clients with user or admin permissions
const CHAT_ENABLED = true;                          // If enabled, chat operations will be available to clients with the chat permission (by default, all of them)
const VISIT_ENABLED = true;                         // If enabled, visitors from other platforms or third-party clients will be able to connect and have an in-world presence.

//
// CLIENT TYPES
//      This section affects what kinds of clients can connect to the bridge server.
//      It serves as both a whitelist and as a blacklist. Clients must provide at least one of these during the handshake step.
//      If a client of an unrecognized type tries to connect, its connection will be blocked by default.
//      NOTE: Keep in mind that the client type is easy for clients to spoof, as *everything* is open-source.
//      
const CLIENT_TYPES = {
    "CLI": true,            // Clients connecting via a command line interface, such as a Python or Node.js script 
    "AI": true,             // AI-powered chat bots that can be used to create dialogue for in-world NPCs 
    "Blender": true,        // 3D modeling suite that can connect, read, and edit in-world entities
    "Overte": true,         // Overte scripts running within Interface or a domain server
    "Vircadia": true,       // Same as above, but for Vircadia
    "V-Sekai": true,        // Open-source virtual world platform created in Godot Engine
    "Hubs": true,           // Entirely web-based social VR platform created by Mozilla 
    "OpenSim": true,        // OpenSimulator-compatible viewer such as Firestorm
}

//
// ROLES:
//      ANONYMOUS = Only very limited read permissions. Can only retrieve basic server stats and exchange chat messages. No editing ability
//      VISITOR = Visitors from alternative metaverse platforms, with a very basic in-world avatar presence. No editing ability (TODO: needs implementing!)
//      USER = Can read and write entities on the server, including via the Blender bridge
//      ADMIN = Same as user, but can also change the bridge server's settings, shutdown and restart the bridge server, and run direct Overte API commands (use with caution)
//
//      Note: all roles have chat permissions
//
// PERMISSIONS:
//      R = read
//      W = write/edit
//      C = chat
//      V = visit
//      A = admin
//
//      The "A" and "W" permissions will require that the client provide the correct (admin or user) password.
//
//      In each nested array in the "ROLES" array below:
//          Index 0 is the name of the role.
//          Index 1 is the permissions for that role
//          Index 2 is the password for that role
//

const ROLES = [
    ["anonymous", "rc", ""],
    ["visitor", "rcv", ""],
    ["user", "rcvw", USER_PASSWORD],
    ["admin", "rcvwa", ADMIN_PASSWORD]
];

const STATUSES = {
    "starting": "Launching bridge server",
    "off": "Bridge closed and offline",
    "on": "Bridge open and listening",
    "closing": "Shutting down bridge",
    "connected": "Connected to new client",
    "disconnected": "Disconnected from client",
    "wrongPass": "Failed login attempt",
    "rightPass": "Successful login",
    "gotBlend": "Data received from Blender",
    "sentBlend": "Data sent to Blender",
    "newMesh": "New 3D mesh created",
    "newModel": "New 3D model created",
    "updatedModel": "Updated 3D model",
    "gotChat": "Chat message received from client",
    "sentChat": "Chat message sent to clients",
    "invalid": "Invalid request",
    "shakeFail": "Handshake failed",
    "shakeOK": "Handshake OK",
    "wrongPerm": "Insufficient permissions"
}

//
// OPERATIONS:
//      When shown to the client, the list is filtered based on the client's permissions.
//      The OPERATIONS constant is a JS object containing 4 nested "category" objects, to keep the operations organized by category.
//      Each nested category contains a nested 'command' object for each command. The format of each nested command object is as follows:
//            KEY = Command string - this is what the client must send in their WebSockets message
//            VALUE = An array containing the following details about the command
//                  INDEX 0 = Short description of the operation (visible to the client)
//                  INDEX 1 = JavaScript code for the operation (never shown directly to the client)
//                  INDEX 2 = Parameters for the operation, if any. Separated by commas, if more than one
//                  INDEX 3 = Permission required for the operation
//

const OPERATIONS = {
    "Query":
    {
        "countTotalAvatars":
            ["Get total avatar count",
                "identity.socket.send(AvatarList.getAvatarIdentifiers().length)",
                "",
                "r"],
        "countTotalClients":
            ["Get bridge client count",
                "identity.socket.send(connectedClients.length)",
                "",
                "r"],
        "disconnect":
            ["Disconnect from the bridge server",
                "identity.socket.send('Connection closed.'); identity.socket.close()",
                "",
                "r"]
    },
    "Chat":
    {
        "sendChat":
            ["Send chat message to bridge",
                "chat(msg_string, identity, 'server')",
                "msg_string",
                "c"
            ]
    },
    "Visit":
    {
        "getEntIDsByType":
            ["Get all IDs of entities with specific TYPE, within distance of a specific position",
                "identity.socket.send(Entities.findEntitiesByType(type_string,position_vec3,distance_int))",
                "type_string, position_vec3,distance_int",
                "v"]
        ,
        "getEntIDsByName":
            ["Get all IDs of entities with specific NAME, within distance of a specific position",
                "identity.socket.send(Entities.findEntitiesByName('Model',position_vec3,distance_int))",
                "type_string, position_vec3,distance_int",
                "v"
            ],
        "getEntDataByID":
            ["Get specific entity's data via UUID",
                "getEntityInfo(UUID_string, identity)",
                "UUID_string",
                "v"
            ],
        "getAvatarIDs":
            ["Get all avatar IDs",
                "identity.socket.send(AvatarList.getAvatarIdentifiers())",
                "",
                "v"
            ],
        "getAvatarDataByID":
            ["Get specific avatar's info",
                "getAvatarInfo(UUID_string, identity)",
                "UUID_string",
                "v"
            ],
        "getAvatarsNearPosition":
            ["Get avatars within specific distance of a position",
                "identity.socket.send(Avatar.getAvatarsInRange({x:x_int, y:y_int, z:z_int}, distance_int))",
                "x_int,y_int,z_int,distance_int",
                "v"
            ],
        "isAvatarNearPosition":
            ["Check if specific avatar within specific distance",
                "identity.socket.send(Avatar.isAvatarInRange({x:x_int, y:y_int, z:z_int}, distance_int))",
                "x_int,y_int,z_int,distance_int",
                "v"
            ],
        "getModel":
            ["Get 3D model data via UUID",
                "identity.socket.send(getModel(UUID_string))",
                "UUID_string",
                "v"
            ],
        "getTempMeshByName":
            ["Get 3D mesh data via name",
                "identity.socket.send(getTempModel(meshname_string))",
                "modelname_string",
                "v"
            ],
        "getTempModelByName":
            ["Get 3D model data via name",
                "identity.socket.send(getTempModel(modelname_string))",
                "modelname_string",
                "v"
            ]
    },
    "Edit": {
        "addEnt":
            ["Add new entity to world",
                "identity.socket.send(Entities.addEntity(properties_json))",
                "properties_json",
                "w"
            ],
        "editEnt":
            ["Edit existing entity",
                "identity.socket.send(Entities.editEntity(UUID, properties_json))",
                "UUID,properties_json",
                "w"
            ],
        "delEnt":
            ["Delete existing entity",
                "identity.socket.send(Entities.deleteEntity(UUID))",
                "UUID_string",
                "w"
            ],
        "createMesh":
            ["Create 3D mesh from raw geometry data",
                "identity.socket.send(createMesh(meshname_string,vert_indices_num_array,vert_positions_vec3_array,vert_normals_vec3_array,vert_colors_vec3_array,texcoords0_vec2_array,identity))",
                "meshname_string,vert_indices_num_array,vert_positions_vec3_array,vert_normals_vec3_array,vert_colors_vec3_array,texcoords0_vec2_array",
                "w"
            ],
        "createModel":
            ["Create 3D model from an array of meshes",
                "identity.socket.send(createModel(meshname_string_array,modelname_string,identity))",
                "meshnames_string_array,modelname_string",
                "w"
            ],
        "setModel":
            ["Set the 3D model of an existing entity",
                "identity.socket.send(setModel(UUID_string,modelname_string,role,identity))",
                "UUID_string,modelname_string",
                "w"
            ],
        "getModelAsOBJ":
            ["Get 3D model data in OBJ format",
                "identity.socket.send(Graphics.exportModelToOBJ(modelname_string))",
                "modelname_string",
                "w"
            ],
        "getATPText":
            ["Download text data from ATP",
                "handleAsset(data_string, false, path_string, identity, 'download')",
                "data_string, path_string",
                "w"
            ],
        "getATPBinary":
            ["Download binary data from ATP",
                "handleAsset(data_base64encoded_string, true, path_string, identity, 'download')",
                "data_base64encoded_string, path_string",
                "w"
            ],
        "putATPText":
            ["Upload text data to ATP",
                "handleAsset(data_string, false, path_string, identity,'upload')",
                "data_string, path_string",
                "w"
            ],
        "putATPBinary":
            ["Upload binary data to ATP",
                "handleAsset(data_base64encoded_string, true, path_string, identity, 'upload')",
                "data_base64encoded_string, path_string",
                "w"
            ]
    },
    "Admin": {
        "shutdown":
            ["Shutdown the bridge server",
                "webSocketServer.close(); connectedClients = []; tempModels = []; tempMeshes = []",
                "",
                "a"],
        "toggleVerbose":
            ["Toggle the verbose setting",
                "identity.socket.send(toggleVerbosity(identity))",
                "",
                "a"
            ],
        "toggleListen":
            ["Toggle the listening setting",
                "identity.socket.send(toggleListening(identity))",
                "",
                "a"
            ],
        "toggleLocalOnly":
            ["Toggle the Local Only setting",
                "identity.socket.send(toggleLocalOnly(identity))",
                "",
                "a"
            ]
    }
};

// These operations are never shown to CLI clients. They're intended for editing tools like Blender, as well as AI-powered scripts
//       Format:
//              KEY = name of the function
//              
const OPERATONS_HIDDEN = {
    "Blender":
    {
        "jsonToBlender": "range,position,type",
        "jsonToBridge": "range,position,type",
        "syncUUID": "entities_array"

    },
    "AI":
    {
        "botSpeak": "uuid,msg",
        "botListen": "uuid.msg",
        "botRespond": "uuid,msg"
    }
}

//
// SERVER GREETING
//
//       You can customize the appearance of the welcome greeting for anyone connecting via a command line client.
//      If you'd like to disable these, just set them equal to an empty string ("").
//

const welcome_art = `
@@@@@@@@@@@@@@@@@@@@@@@@@@%%(((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((
@@@@@@@     @@@@@@@     @@@@@((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((
@@@@        @@@@@@@        @@@&((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((
@@.         @@@@@@@          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         @@@@@@@@@@@         @@@    @@@@@@@@    *@              @@              @@               @@              @
@       @@@@@@@@@@@@@@@       @@@@    %@@@@@    &@@   @@@@@@@@@@@@@   @@@@@@@@    @@@@@@@   &@@@@@@@   @@@@@@@@@@@@
        @@@@@@@@@@@@@@@       ,@@@@.   ,@@@    @@@@              @@              @@@@@@@@   &@@@@@@@              @
@       @@@@@@@@@@@@@@@       @@@@@@&    @    @@@@@   @@@@@@@@@@@@@   @@@@@@@@    @@@@@@@   &@@@@@@@   @@@@@@@@@@@@
@         @@@@@@@@@@@         @@@@@@@@       @@@@@@              @@   @@@@@@@@    @@@@@@@   &@@@@@@@              @
@@,            ,            ,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@                       @@@(((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((
@@@@@@@                 @@@@(((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((
`;
const welcome_msg =
    ("Welcome to the Overte bridge server for " + DOMAIN_NAME + "\n"
        + "Waiting for handshake...");

//
// END OF CUSTOMIZEABLE SETTINGS
//

var connectedClients = [];
var tempMeshes = {};
var tempModels = {};
var SERVER_URL = "";

const crypt = (salt, text) => {
    if (ENCRYPTED) {
        const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
        const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

        return text
            .split("")
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join("");
    }
    else {
        return text;
    }
};

const decrypt = (salt, encoded) => {
    if (ENCRYPTED) {
        const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
        const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
        return encoded
            .match(/.{1,2}/g)
            .map((hex) => parseInt(hex, 16))
            .map(applySaltToChar)
            .map((charCode) => String.fromCharCode(charCode))
            .join("");
    }
    else {
        return encoded;
    }
};

function sanitizeString(str) {
    return text.replace(/[^a-zA-Z0-9 ]/g, '');
}
function isValidIP(str) {

    // Localhost is always valid
    if (str.indexOf("localhost") > -1) {
        return true;
    }

    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    result = regex.test(str);

    // If Local Only is enabled, check if it's the same IP as the server itself
    if (local_only) {
        if ((SERVER_URL.indexOf(result) === -1)) {
            return false;
        }
    }
    return result;
}

function toggleVerbosity(identity) {
    verbose = !(verbose);
    var status = "Verbose mode now " + ((verbose === true) ? "ON" : "OFF");
    updateStatus(status, identity);
    return status;
}

function toggleListening(identity) {
    listening = !(listening);
    var status = "Listening is now " + ((listening === true) ? "ENABLED" : "DISABLED");
    updateStatus(status, identity);
    return status;
}

function toggleLocalonly(identity) {
    local_only = !(local_only);
    var status = "Bridge is now open " + ((local_only === true) ? "only to the localhost" : "to everyone");
    updateStatus(status, identity);
    return status;
}

function handshake(json, socket) {

    // Validate the initial handshake message structure
    if ("userName" in json && "ipAddress" in json && "clientType" in json) {

        // Check for supported client type
        if (json.clientType in CLIENT_TYPES) {
            if (CLIENT_TYPES[json.clientType] == true) {

                // Remove all special characters (except spaces) from the username first.
                // Admins can optionally add a word filter here to filter out offensive words
                var sanitized_name = sanitizeString(json.userName);

                // Validate the IP address
                if (isValidIP(json.ipAddress)) {

                    var identity = {
                        "userName": sanitized_name,
                        "ipAddress": json.ipAddress,
                        "clientType": json.clientType,
                        "socket": socket
                    };

                    // Handshake successful, so add the client to connected users list
                    connectedClients.push(identity);
                    socket.send(STATUSES["shakeOK"]);
                    return [true, identity];
                }
            }
        }
    }

    // Handshake failed
    return [false, ""];
}

function handleAsset(data, binaryOn, path, identity, mode) {
    var data_info = {
        data: ((binaryOn) ? btoa(data_string) : data_string)``,
        path: path
    }
    function status_callback(error, result) {
        if (error) {
            var errmsg = 'ERROR: Data not ' + mode + 'ed or mapping not set';
            updateStatus(errmsg);
            identity.socket.send(errmsg);
        } else {
            updateStatus('Successfully ' + mode + 'ed \n' +
                'URL: ' + result.url + "\n" +
                "Size:" + result.byteContent + "bytes\n" +
                "Content Type: " + result.contentType) + "\n" +
                "Client: " + identity.userName + " via " + identity.clientType;
            identity.socket.send(((mode === 'download') ? result.response : result.url));
        }
    }

    if (mode === "upload") {
        Assets.putAsset(data_info, status_callback(error, result));
    }
    else {
        Assets.getAsset(data_info, status_callback(error, result));
    }
}

function createMesh(meshname_string, vert_indices_num_array, vert_positions_vec3_array, vert_normals_vec3_array, vert_colors_vec3_array, texcoords0_vec2_array, identity) {
    if (meshname_string in tempMeshes) {
        var last_char = meshname_string.slice(-1);
        if (isNaN(last_char)) {
            meshname_string += "2";
        }
        else {
            meshname_string = meshname_string.slice(0, -1) + (parseInt(last_char) + 1);
        }
    }

    var ifsMeshData = {
        name: meshname_string,
        topology: "triangles",  // Triangles are the only option currently supported by Overte
        indices: vert_indices_num_array,
        positions: vert_positions_vec3_array,
        normals: vert_normals_vec3_array,
        colors: vert_colors_vec3_array,
        texCoords0: texcoords0_vec2_array
    }
    var tempMesh = Graphics.newMesh(ifsMeshData);
    tempMeshes[meshname_string] = tempMesh;

    var status = STATUSES["newMesh"] + " with name " + ifsMeshData.name;

    updateStatus(status, identity);
    return status;
}

function createModel(meshname_string_array, modelname_string, identity) {
    if (modelname_string in tempModels) {
        var last_char = modelname_string.slice(-1);
        if (isNaN(last_char)) {
            modelname_string += "2";
        }
        else {
            modelname_string = modelname_string.slice(0, -1) + (parseInt(last_char) + 1);
        }
    }

    var tempModel = Graphics.newModel(meshname_string_array);
    tempModels[modelname_string] = tempModel;

    var status = STATUSES["newModel"] + " with name " + modelname_string;

    updateStatus(status, identity);
    return status;
}

function setModel(UUID_string, modelname_string, role, identity) {
    // Check permissions. Only those with admin permissions should be able to change avatar models
    if (Entities.getEntityProperties(UUID_string, ["entityHostType"]) === "avatar") {
        if (ROLES[role][1].indexOf("a") === -1) {
            return STATUSES['wrongPerm'];
        }
    }

    Graphics.updateModel(UUID_string, modelname_string);

    var status = STATUSES["updatedModel"] + " of entity named '" + Entities.getEntityProperties(UUID_string, ["name"]) + "'";
    updateStatus(status, identity);
    return status;
}

// TODO: Implement Blender bridge functions
function jsonToBlender(identity) {
    var socket = identity.socket;
}

function jsonToBridge(identity) {
    var socket = identity.socket;
}

function syncUUID(identity) {
    var socket = identity.socket;
}

function updateStatus(status, identity = undefined) {

    if (verbose) {
        var timestamp = new Date();

        // Check if client identity was provided, and if so, append it to the status message
        if (identity !== undefined) {
            status += " (" + identity.userName + " via " + identity.clientType + ")";
        }

        // Send status via status channel
        Messages.sendMessage(STATUS_CHANNEL, "[ " + timestamp.toLocaleString() + " ] " + status);
        print(status);
    }
}

function chat(msg, identity, recipient) {

    // Reformat the client's chat message
    msg = "[CHAT] [" + identity.userName + " (via " + identity.clientType + "] " + msg;

    // Send chat message to all currently connected clients
    for (client of connectedClients) {
        if (!(client.clientType === "Blender")) {
            client.socket.send(msg)
        }
    }

    Messages.sendMessage(CHAT_CHANNEL, msg, false);

    var status = ((recipient === "clients") ? STATUSES["sentChat"] : STATUSES["gotChat"]);
    updateStatus(status, identity);

}

function parseJSON(message, socket) {
    json = "";

    if (ENCRYPTED === true) {
        json = decrypt(KEY, message.data);
    }

    // Try parsing JSON - and if it fails, print the error and quit
    try {
        json = JSON.parse(message.data);
    }
    catch (e) {
        updateStatus("Message Parsing ERROR:" + e);
        closeSocket({ "socket": socket }, STATUSES["invalid"]);
        return "";
    }

    updateStatus("Successfully parsed message");
    return json;
}


function incorrectCmd(socket) {
    var error = "ERROR: Incorrect input received.";
    socket.send(error);
    print(error);
}

function closeSocket(identity, reason = "") {
    var socket = identity.socket;
    socket.send(reason);
    print(reason);
    updateStatus("Connection closed because: " + reason);
    socket.close();
    return true;
}

// USER PROMPT MENUS

function pick_role(json, identity) {
    var socket = identity.socket;
    var role = -1;

    // Check if this is a command line client
    if (identity.clientType === "CLI") {
        json = { "role": json };
    }

    // Check if a valid role was selected
    if ("role" in json) {
        json.role = parseInt(json.role);
        if (!isNaN(json.role)) {
            // User-provided role is verified to be a number. Now check if it's within the correct range
            if (json.role >= 0 && json.role < Object.keys(ROLES).length) {
                role = json.role
                socket.send("You selected the " + ROLES[role][0] + " role.");
                updateStatus("Client selected the " + ROLES[role][0] + " role.");
            }
            else {
                socket.send("ERROR: You selected a non-existent role.\n");
                updateStatus("Client selected a non-existent role.");
            }
        }
    }
    if (role === -1) {
        identity.socket.send("Please select a role below.")
        for (r of ROLES) {
            var role_description = ROLES.indexOf(r) + " - " + r[0];
            identity.socket.send(role_description);
        }
    }
    return role;
}

function authenticate(json, role, identity, attempts) {
    var socket = identity.socket;

    // If client has already attempted to login more than 3 times, notify the client and close the connection
    if (attempts > 3) { closeSocket(identity, "Too many incorrect login attempts."); return false; }

    // Check if we're in CLI mode, and reformat the input to JSON format if so
    if (identity.clientType === "CLI") {
        json = { "password": json };
        socket.send("This role requires a password.");
        socket.send("Please enter the password.");
    }

    var password = json.password;

    // Wrong password
    if (!(password === ROLES[role][2])) {
        attempts += 1;
        updateStatus(STATUSES["wrongPass"], identity);
        socket.send("Incorrect password. Attempts remaining: " + (4 - attempts));
        return [false, attempts];
    }
    // Correct password
    else {
        updateStatus(STATUSES["rightPass"], identity);
        socket.send("Thank you! Valid credentials received.");
        return [true, 0];
    }
}

function pick_operation(json, role, identity) {
    var operation = undefined;
    var command = undefined;
    var params = [];
    var socket = identity.socket;
    var cli_mode = identity.clientType === "CLI";
    var hidden_ops_enabled = (identity.clientType in OPERATIONS_HIDDEN);
    var valid_operations = [];
    var prompt = "Please pick a command from the list below.\n\n";

    if (cli_mode) {
        json = { "operation": json };
    }

    // Generate list of available operations
    for (category of Object.keys(OPERATIONS)) {
        prompt += "* " + category.toUpperCase() + "*\n";
        for (op of Object.keys(OPERATIONS[category])) {
            // Check if client's role has permission to perform this operation, and if so, add it to the list
            if (ROLES[role][1].indexOf(OPERATIONS[category][op][3])) {
                prompt += op + "\t-\t" + OPERATIONS[category][op][0] + "\t-\tParameters: " + OPERATIONS[category][op][2] + "\n";
                valid_operations.push(op);
            }
        }
    }
    if (hidden_ops_enabled) {
        for (op in Object.keys(OPERATIONS_HIDDEN[identity.clientType])) {
            valid_operations.push(op);
        }
    }

    // Extra information for CLI clients
    if (cli_mode) {
        prompt += "You must provide the command and parameters as an array. Each item separated by commas.\n";
        prompt += 'Wrap each item of the array with double quotation marks ("), NOT single marks(\').\n';
        prompt += "Follow the example below, with the command in the first index of the array, and parameter(s) following it: \n";
        prompt += 'EXAMPLE: ["sendChat","Hi, how are you?"]';
    }

    function getOpData() {
        // Operation is valid, so store it
        operation = json.operation;
        command = json.operation[0];

        // Check for params
        if (json.operation.length > 1) {
            params = json.operation.slice(1, json.operation.length);
        }
    }

    // Validate operation if one was already provided
    if ("operation" in json) {
        if (hidden_ops_enabled) {
            if (json.operation in OPERATONS_HIDDEN[clientType]) {
                getOpData();
            }
        }
        // Same as above, but for non-hidden operations
        if (operation === undefined) {
            if (valid_operations.indexOf(json.operation) > -1) {
                getOpData();
            }
        }
    }

    // Prepare to run the operation
    if (!(operation === undefined)) {
        // Construct the command
        var cmd = command + "(";
        for (p of params) {
            cmd += p;
            if (params.indexOf(p) !== (params.length - 1)) {
                cmd += ",";
            }
        }
        cmd += ")";
        const run = new Function(cmd);
        // Try running the constructed command and catch any errors
        try {
            run();
        }
        catch (err) {
            updateStatus(STATUSES["cmdErr"] + ": " + err.message, identity);
            socket.send(STATUSES["cmdErr"] + ": " + err.message);
        }
    }

    // Valid operation request wasn't received.
    else {
        // Resend the prompt to CLI client again.
        if (cli_mode) {
            socket.send(prompt);
        }
        // For non-CLI clients, send the 'invalid' error message
        else {
            updateStatus(STATUSES["invalid"], identity);
            socket.send(STATUSES["invalid"], identity);
        }
    }

    return undefined;
}

if (!listening) { return; }     // If "listening" is set to false, exit instead of proceeding

updateStatus(STATUSES["starting"]);
var webSocketServer = ((PORT > 0) ? new WebSocketServer(PORT) : new WebSocketServer());       // If PORT is 0, just randomize it.
SERVER_URL = webSocketServer.url;
print("Server URL:", SERVER_URL);
print("Server Port:", webSocketServer.port);
updateStatus(STATUSES["on"] + " on port " + webSocketServer.port);

function onNewConnection(webSocket) {

    if (!listening) {
        // If "listening" is set to false, exit instead of proceeding
        closeSocket({ "socket": webSocket }, STATUSES["off"]);
    }
    // Setup variables for this client
    var identity = undefined;
    var handshake_valid = undefined;
    var role = -1;
    var authenticated = false;
    var auth_attempts = 0;
    var cli_mode = undefined;
    var authenticate_result = undefined;
    var operation = undefined;

    updateStatus(STATUSES["connected"]);

    webSocket.onopen = function (message) {
        identity.socket.send(welcome_art);
        identity.socket.send(welcome_msg);
    }
    webSocket.onclose = function (message) {
        updateStatus("Connection closed.");
    }

    webSocket.onmessage = function (message) {

        var msg_json = "";
        msg_json = parseJSON(message, webSocket);

        // Check if handshake has happened yet, and if not, check the message for one
        if (handshake_valid === undefined) {
            handshake_result = handshake(msg_json, webSocket);
            handshake_valid = handshake_result[0];
            identity = handshake_result[1];
        }
        // If handshake invalid, close the connection
        if (handshake_valid === false) {
            closeSocket({ "socket": webSocket }, STATUSES["shakeFail"]);
            return;
        }
        // Handshake valid, so check for CLI client
        else {
            cli_mode = (identity.clientType === "CLI" ? true : false);
        }

        // Check if client sent an empty or invalid message
        if (msg_json === "") {
            // If we're not in CLI mode, then valid JSON was expected, so error and exit
            if (!cli_mode) {
                incorrectCmd();
                closeSocket(identity, STATUSES["invalid"]);
                return;
            }
            // If CLI mode is enabled, then assume the message was just a string
            else {
                msg_json = message;
                return;
            }
        }

        // If role hasn't been set, prompt the client to select a role first
        if (role === -1 && handshake_valid === true) {
            role = pick_role(msg_json, identity);
        }

        // Authenticate if needed
        if (authenticated === false && role > -1 && handshake_valid === true) {

            // Check permission requirements for the selected role
            if (ROLES[role][1].indexOf("a") > -1 || ROLES[role[1]].indexOf("w") > -1) {
                // Check for correct password
                authenticate_result = authenticate(msg_json, role, identity, auth_attempts);
            }
            else {
                // Selected role doesn't require write or admin privileges, so authenticate automatically without a password
                authenticate_result = [true, 0];
            }

            authenticated = authenticate_result[0];
            attempts = authenticate_result[1];

        }

        // Provide a list to the user of possible actions
        if (operation === undefined && authenticated === true && role > -1 && handshake_valid === true) {
            // Check if this is a special client type, such as Blender or AI
            operation = pick_operation(msg_json, role, identity);
        }
    }

}


webSocketServer.newConnection.connect(onNewConnection);
