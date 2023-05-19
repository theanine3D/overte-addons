//
// Overte Bridge Server - v0.1.8
//
//      Before use, please customize the security settings near the top.
//
//      Created by Theanine3D / Pedro Valencia
//      github.com/theanine3D
//

// CUSTOMIZEABLE SETTINGS BELOW

// SECURITY SETTINGS
const ENCRYPTED = false;                            // If true, client passwords must be encrypted with the key in the line below, 
const KEY = "3EA66EC1AF586A3FEDE84D7324221";        // Used only if 'encrypted' variable above is set to "true" - for maximum security, use at least a 256-bit key.
const ADMIN_PASSWORD = "4jq6S0rowj";
const USER_PASSWORD = "n6C3dpUc1H";

// GENERAL SETTINGS
let listening = true;                               // If set to false, the bridge server will go offline.
let verbose = true;                                 // If true, the bridge server will repeatedly send out messages on the messaging server of its current status, which entities in-world can receive
let local_only = true;                              // If true, only localhost can connect to bridge. Recommended if only connecting with Blender on same machine as bridge server

const STATUS_CHANNEL = "bridge.status";             // Status messages about the bridge server, available to in-world entities
const CHAT_CHANNEL = "bridge.chat";                 // Channel for chat messages exchanged between server/client(s)
const AI_CHANNEL = "bridge.ai";                     // AI bot messages. In-world NPC bots can be scripted to listen on this channel

const PORT = 59999;                                 // If set to 0, the port will be randomized every time the script begins running (not recommended))
const DOMAIN_NAME = "Overte World";                 // A name for your server - can be anything. Primarily used in the server's greeting message when a new client connects.

const EDIT_ENABLED = true;                          // If enabled, editing operations will be available to authenticated clients with user or admin permissions
const CHAT_ENABLED = true;                          // If enabled, chat operations will be available to clients with the chat permission (by default, all of them)
const VISIT_ENABLED = true;                         // If enabled, visitors from other platforms or third-party clients will be able to connect and have an in-world presence.
const CHAT_LIMIT = 500;                             // If set to 0, clients will be able to send chat messages of any length (not recommended)

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
    "Other": true,          // Any other client that doesn't fit into the above pre-defined types
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
//      Q = query
//      C = chat
//      V = visit
//      E = edit
//      A = admin
//
//      The "A" and "E" permissions will require that the client provide the correct (admin or user) password.
//
//      In each nested array in the "ROLES" array below:
//          Index 0 is the name of the role.
//          Index 1 is the permissions for that role
//          Index 2 is the password for that role
//

const ROLES = [
    ["anonymous", "qc", ""],
    ["visitor", "qcv", ""],
    ["user", "qcve", USER_PASSWORD],
    ["admin", "qcvea", ADMIN_PASSWORD]
];

const STATUSES = {
    "starting": "Launching bridge server",
    "off": "Bridge offline and closed",
    "on": "Bridge online and listening",
    "closing": "Shutting down bridge",
    "connected": "Connected to new client",
    "disconnected": "Client disconnected",
    "sentRequest": "Sent request to client",
    "gotRequest": "Got request from client",
    "sentInfo": "Sent info to client",
    "gotInfo": "Got info from client",
    "sentData": "Sent data to client",
    "gotData": "Got data from client",
    "wrongPass": "Failed login attempt",
    "rightPass": "Successful login",
    "gotBlend": "Data received from Blender",
    "sentBlend": "Data sent to Blender",
    "gotChat": "Chat message received from client",
    "sentChat": "Chat message sent to clients",
    "chatToolong": "Blocked chat msg beyond limit",
    "invalid": "Invalid request",
    "shakeFail": "Handshake failed",
    "shakeOK": "Handshake OK",
    "wrongPerm": "Insufficient permissions",
    "cmdErr": "Command error",
    "cmdOk": "Command run successfully",
    "complete": "Completed one-time client operation"
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
        "commands":
            ["Show a list of the available commands",
                'identity.operation = "";',
                ""
            ],
        "getServerTime":
            ["Get current server time & date",
                'let servertime = new Date(); ' +
                'if (identity.clientType === "CLI") { servertime = servertime.toLocaleString(); }' +
                'sendToClient(servertime,"OUTPUT", identity) ',
                ""
            ],
        "countTotalAvatars":
            ["Get total avatar count",
                'sendToClient(AvatarList.getAvatarIdentifiers().length,"OUTPUT",identity)',
                ""
            ],
        "countTotalClients":
            ["Get bridge client count",
                'sendToClient(connectedClients.length,"OUTPUT",identity)',
                ""
            ],
        "quit":
            ["Disconnect from the bridge server",
                'closeSocket(STATUSES["disconnected"],identity)',
                ""
            ]
    },
    "Chat":
    {
        "sendChat":
            ["Send chat message to bridge",
                "chat('msg_string','server',identity)",
                "msg_string"
            ]
    },
    "Visit":
    {
        "getEntIDsByType":
            ["Get all IDs of entities of specific TYPE, within distance of a position",
                'sendToClient(JSON.stringify(Entities.findEntitiesByType(\"type_string\",{\"x\":x_int,\"y\":y_int,\"z\":z_int},distance_int)),"OUTPUT",identity)',
                "type_string,x_int,y_int,z_int,distance_int"
            ],
        "getEntIDsByName":
            ["Get all IDs of entities with specific NAME, within distance of a position",
                'sendToClient(JSON.stringify(Entities.findEntitiesByName(\"name_string\",{\"x\":x_int,\"y\":y_int,\"z\":z_int},distance_int)),"OUTPUT",identity)',
                "name_string,x_int,y_int,z_int,distance_int"
            ],
        "getEntDataByID":
            ["Get specific entity's data via UUID",
                'sendToClient(Entities.getEntityProperties(\"UUID_string\"),"OUTPUT",identity)',
                "UUID_string"
            ],
        "getAvatarIDs":
            ["Get all avatar IDs",
                'sendToClient(AvatarList.getAvatarIdentifiers(),"OUTPUT",identity)',
                ""
            ],
        "getAvatarDataByID":
            ["Get specific avatar's info",
                'sendToClient(AvatarList.getAvatar(\"UUID_string\"),"OUTPUT",identity)',
                "UUID_string"
            ],
        "getAvatarsNearPosition":
            ["Get avatars within specific distance of a position",
                'sendToClient(Avatar.getAvatarsInRange({\"x\":x_int,\"y\":y_int,\"z\":z_int},distance_int),"OUTPUT",identity)',
                "x_int,y_int,z_int,distance_int"
            ],
        "isAvatarNearPosition":
            ["Check if specific avatar within specific distance",
                'sendToClient(Avatar.isAvatarInRange({\"x\":x_int,\"y\":y_int,\"z\":z_int},distance_int),"OUTPUT",identity)',
                "x_int,y_int,z_int,distance_int"
            ]
    },
    "Edit": {
        "addEnt":
            ["Add new entity to world",
                'sendToClient(Entities.addEntity(properties_json),"OUTPUT",identity)',
                "properties_json"
            ],
        "editEnt":
            ["Edit existing entity",
                'sendToClient(Entities.editEntity(\"UUID_string\", properties_json),"OUTPUT",identity)',
                "UUID_string,properties_json"
            ],
        "delEnt":
            ["Delete existing entity",
                'sendToClient(Entities.deleteEntity(UUID_string),"OUTPUT",identity)',
                "UUID_string"
            ],
        "getATPText":
            ["Download text data from ATP",
                "handleAsset(\"path_string\",false,\"\",identity,'download')",
                "path_string"
            ],
        "getATPBinary":
            ["Download binary data from ATP",
                "handleAsset(\"path_string\",true,\"\",identity,'download')",
                "path_string"
            ],
        "putATPText":
            ["Upload text data to ATP",
                "handleAsset(\"path_string\",false,\"data_string\",identity,'upload')",
                "data_string,path_string"
            ],
        "putATPBinary":
            ["Upload binary data to ATP",
                "handleAsset(\"path_string\",true,\"data_base64string\",identity,'upload')",
                "data_base64string,path_string"
            ]
    },
    "Admin": {
        "run":
            ["Run any Overte API command (warning: risky)",
                "adminRun(\"function_string\",identity)",
                "function_string"
            ],
        "shutdown":
            ["Shutdown the bridge server",
                "webSocketServer.close(); connectedClients = []; updateStatus(STATUSES['off'],identity)",
                ""
            ],
        "toggleVerbose":
            ["Toggle the verbose setting",
                'sendToClient(toggleVerbosity(identity),"INFO",identity)',
                ""
            ],
        "toggleListen":
            ["Toggle the listening setting",
                'sendToClient(toggleListening(identity),"INFO",identity)',
                ""
            ],
        "toggleLocalOnly":
            ["Toggle the Local Only setting",
                'sendToClient(toggleLocalOnly(identity),"INFO",identity)',
                ""
            ]
    }
};

// NOTE: DEPRECATED. Remove this later
//
// These operations are never shown to CLI clients. They're intended for editing tools like Blender, as well as AI-powered scripts
//       Format:
//              KEY = name of the function
//              VALUE = parameters
//              
const OPERATIONS_HIDDEN = {
    "Blender":
    {
        "bridge2blender": "entityUUID_string_array",
        "blender2bridge": "entityUUID_string_array",
        "syncUUID": "entityUUID_string_array"
    },
    "AI":
    {
        "botSpeak": "botName_string,msg_string",
        "botListen": "botName_string,,msg_string",
        "botRespond": "botName_string,msg_string"
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
const welcome_msg = ("Welcome to the Overte bridge server for " + DOMAIN_NAME + "\n" + "Waiting for handshake...");

//
// END OF CUSTOMIZEABLE SETTINGS
//

var connectedClients = [];
var serverURL = "";

// Find and retrieve the bridge's in-world 3D models
const UUID = Entities.findEntitiesByName("bridgeStatus", { x: 0, y: 0, z: 0 }, 10000)[0];
const MODELS = Entities.getChildrenIDs(UUID);

function encrypt(salt, text) {
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

function decrypt(salt, encoded) {
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
}

function sanitizeString(text) {
    return text.replace(/[^a-zA-Z0-9 ]/g, '');
}
function isValidIP(text) {

    // Localhost is always valid
    if (text.indexOf("localhost") > -1 || text.indexOf("127.0.0.1") > -1) {
        return true;
    }

    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    result = regex.test(text);

    // If Local Only is enabled, check if it's the same IP as the server itself
    if (local_only && result) {
        if ((serverURL.indexOf(text.replace(regex, ""))) === -1) {
            return false;
        }
    }

    return result;
}

function toggleVerbosity(identity) {
    verbose = !(verbose);
    let status = "Verbose mode now " + ((verbose === true) ? "ON" : "OFF");
    updateStatus(status, identity);
    return status;
}

function toggleListening(identity) {
    listening = !(listening);
    let status = "Listening is now " + ((listening === true) ? "ENABLED" : "DISABLED");
    updateStatus(status, identity);
    return status;
}

function toggleLocalOnly(identity) {
    local_only = !(local_only);
    let status = "Bridge is now open " + ((local_only === true) ? "only to the localhost" : "to everyone");
    updateStatus(status, identity);
    return status;
}

function handshake(json, socket) {

    // Validate the initial handshake message structure
    if ("userName" in json && "clientType" in json) {

        // Check for supported client type
        if (json.clientType in CLIENT_TYPES) {
            if (CLIENT_TYPES[json.clientType] == true) {

                // Remove all special characters (except spaces) from the username first.
                // Admins can optionally add a word filter here to filter out offensive words
                let sanitized_name = sanitizeString(json.userName);

                // Validate the IP address
                let IPaddress = socket.url.replace(/(ws:\/\/|:[0-9]*\/)/g, "");
                if (isValidIP(IPaddress)) {

                    let identity = {
                        "userName": sanitized_name,
                        "ipAddress": IPaddress,
                        "clientType": json.clientType,
                        "socket": socket
                    };

                    // Handshake successful, so add the client to connected users list
                    connectedClients.push(identity);
                    identity = connectedClients[connectedClients.length - 1];
                    sendToClient(STATUSES["shakeOK"], "INFO", identity);
                    updateStatus("Identity established: " + identity.userName + " via " + identity.clientType + " [" + identity.ipAddress + "]");

                    // Check if this is a complete command
                    if ("complete" in json) {
                        identity.complete = json.complete;
                    }

                    return [true, identity];
                }
            }
        }
    }

    // Handshake failed
    return [false, ""];
}

function handleAsset(path, binaryOn, data_string, identity, mode) {

    // As a security measure, only admins can download or upload .js files
    if (ROLES[identity.role][1].indexOf("a") === -1) {
        if (path.endsWith(".js") || Assets.getMapping) {
            sendToClient(STATUSES["invalid"], "INFO", identity);
            updateStatus(STATUSES["invalid"], "INFO", identity);
            return;
        }
    }

    var data_info;
    if (mode === "upload") {
        data_info = {
            "data": ((binaryOn) ? btoa(data_string) : data_string)``,
            "path": path
        }
    }
    function status_callback(error, result) {
        if (error) {
            let errmsg = 'ERROR: Data not ' + mode + 'ed or mapping not set';
            updateStatus(errmsg);
            sendToClient(errmsg, "INFO", identity);
        } else {
            updateStatus('Successfully ' + mode + 'ed \n' +
                'URL: ' + result.url + "\n" +
                "Size:" + result.byteContent + "bytes\n" +
                "Content Type: " + result.contentType) + "\n" +
                "Client: " + identity.userName + " via " + identity.clientType;
            sendToClient(((mode === 'download') ? result.response : result.url), "OUTPUT", identity);
        }
    }

    if (mode === "upload") {
        Assets.putAsset(data_info, status_callback(error, result));
    }
    else {
        Assets.getAsset(path, status_callback(error, result));
    }
}

// TODO: Implement Blender bridge functions
function bridge2Blender(data, identity) {
    let socket = identity.socket;
}

function json2Bridge(data, identity) {
    let socket = identity.socket;
}

function syncUUID(data, identity) {
    let socket = identity.socket;
}

function updateStatus(status, identity = undefined) {

    if (verbose) {
        let timestamp = new Date();

        // Check if client identity was provided, and if so, append it to the status message
        if (identity !== undefined) {
            status += " (" + identity.userName + " via " + identity.clientType + ")";
        }

        // Send status via status channel
        Messages.sendMessage(STATUS_CHANNEL, "[ " + timestamp.toLocaleString() + " ] " + status);
        console.debug(status);
        Entities.editEntity(UUID, {
            "text": "Bridge: " + status
        });
    }
}

function chat(msg, recipient, identity) {

    if (CHAT_LIMIT > 0) {
        if (msg.length > CHAT_LIMIT) {
            sendToClient("ERROR: Chat message is too long (above " + CHAT_LIMIT + " characters)", "INFO", identity);
            updateStatus(STATUSES["chatTooLong"], identity);
            return;
        }
    }

    // Reformat the client's chat message
    msg = "[CHAT] [" + identity.userName + " via " + identity.clientType + "] " + msg;

    // Send chat message to all currently connected clients
    for (client of connectedClients) {
        if (client.clientType !== "Blender") {
            sendToClient(msg, "INFO", client);
        }
    }

    Messages.sendMessage(CHAT_CHANNEL, msg, false);

    let status = ((recipient === "clients") ? STATUSES["sentChat"] : STATUSES["gotChat"]);
    updateStatus(status, identity);

}

function parseJSON(message, socket) {
    json = "";

    // Try parsing JSON - and if it fails, print the error and quit
    try {
        json = JSON.parse(message.data);
    }
    catch (e) {
        updateStatus("Message Parsing ERROR:" + e);
        closeSocket(STATUSES["invalid"], { "socket": socket });
        return "";
    }

    updateStatus("Successfully parsed message");
    return json;
}


function incorrectCmd(socket) {
    let error = "ERROR: Incorrect input received.";
    sendToClient(error, "INFO", identity);
    console.debug(error);
}

function closeSocket(reason = "", identity, code = 1002) {
    let socket = identity.socket;

    switch (reason) {
        case STATUSES["invalid"]:
            code = 1002;
        case STATUSES["shakeFail"]:
            code = 1015;
        case STATUSES["wrongPerm"]:
            code = 1008;
        case STATUSES["cmdErr"]:
            code = 1003;
        case STATUSES["disconnected"]:
            code = 1000;
        case "":
            code = 1011;
    }

    console.debug(reason);
    updateStatus("Connection closed because: " + reason);
    socket.close(code, reason);
    connectedClients = connectedClients.filter(item => JSON.stringify(item) !== JSON.stringify(identity));
    return true;
}

function sendToClient(msg, type, identity) {

    let id = "";
    if ("userName" in identity && "clientType" in identity) {
        id += "[ " + identity.userName + " via " + identity.clientType + " ]";
    }

    // If a client's command returns empty or undefined output
    if (msg === undefined) {
        msg = "Requested data is empty, invalid, or doesn't exist.";
        type = "INFO";
    }

    switch (type) {
        case "REQUEST":
            updateStatus(STATUSES["sentRequest"] + " " + id);
        case "INFO":
            updateStatus(STATUSES["sentInfo"] + " " + id);
        case "OUTPUT":
            updateStatus(STATUSES["sentData"] + " " + id);
    }

    // If client is not CLI
    if ("complete" in identity) {
        if (identity.complete && type !== "OUTPUT") {
            return;
        }
    }
    identity.socket.send(JSON.stringify({ "msg": msg, "type": type }));

}

// USER PROMPT MENUS

function pick_role(json, identity) {
    let socket = identity.socket;
    identity.role = -1;

    // For CLI clients
    if (!("role" in json) && identity.clientType === "CLI") {
        json.role = json.response;
    }

    // Check if a valid role was selected
    if ("role" in json) {
        json.role = parseInt(json.role);
        if (!isNaN(json.role)) {
            // User-provided role is verified to be a number. Now check if it's within the correct range
            if (json.role >= 0 && json.role < Object.keys(ROLES).length) {
                identity.role = json.role;
                sendToClient("You selected the " + ROLES[identity.role][0] + " role.\n", "INFO", identity);
                updateStatus("Client selected the " + ROLES[identity.role][0] + " role.", identity);
            }
            else {
                identity.role = -1;
                sendToClient("ERROR: You selected a non-existent role.\n", "INFO", identity);
                updateStatus("Client selected a non-existent role.", identity);
            }
        }
    }
    if (!("role" in identity) || parseInt(identity.role) === -1) {
        let roles_desc = "ROLES: \n";
        for (r of ROLES) {
            roles_desc += ROLES.indexOf(r) + "\t-\t" + r[0] + "\n";
        }
        sendToClient(roles_desc, "INFO", identity);
        sendToClient("Please enter the number of the role that you wish to sign in with.", "REQUEST", identity);
    }

    return identity.role;
}

function authenticate(json, identity, attempts) {
    let password = "";
    let authenticated = false;

    // For CLI clients
    if (!("password" in json) && identity.clientType === "CLI") {
        password = json.response;
    }
    else {
        password = json.password;
    }

    // Check if encryption is enabled
    if (ENCRYPTED === true) {
        password = decrypt(KEY, password);
    }

    // Correct password
    if (password === ROLES[parseInt(identity.role)][2]) {
        updateStatus(STATUSES["rightPass"], identity);
        sendToClient("Thank you! Valid credentials received.", "INFO", identity);
        authenticated = true;
    }

    // Wrong password
    else {
        if (attempts === 0) {
            sendToClient("This role requires a password.\n Please enter the password.", "REQUEST", identity);
        }
        else {
            updateStatus(STATUSES["wrongPass"], identity);
            sendToClient("Incorrect password. Attempts remaining: " + (5 - attempts), "INFO", identity);

            // If client has already attempted to login more than 4 times, notify the client and close the connection
            if (attempts > 4) {
                closeSocket("Too many incorrect login attempts.", identity);
                return [false, 0];
            }

            else {
                sendToClient("Please try again.", "REQUEST", identity)
            }
        }
    }
    attempts += 1;
    return [authenticated, attempts];
}

function pick_operation(json, identity) {
    let command = "";
    let cmd_category = "";
    let param_string = "";
    let params = [];
    let cli_mode = identity.clientType === "CLI";
    let valid_operations = [];
    let prompt = "Please pick a command from the list below.\n\n";

    // Blender Bridge
    if (identity.clientType === "Blender") {
        if (ROLES[identity.role][1].indexOf("a") > -1 || ROLES[identity.role][1].indexOf("e") > -1) {
            if ("operation" in json) {
                switch (json.operation) {

                    // Blender push to Bridge
                    case "push":
                        blender2bridge(json.blender, identity);
                    case "pull":
                        bridge2blender(identity);
                    case "sync":
                        syncUUID(identity);
                }
            }

        }
    }

    // For CLI clients
    if (cli_mode && (json.operation === "" || json.operation === undefined)) {

        if (json.response === ROLES[parseInt(identity.role)][2]) {
            json.response = "";
        }

        json.operation = json.response;
    }

    // Generate list of available operations
    for (category of Object.keys(OPERATIONS)) {

        if (!CHAT_ENABLED && category === "Chat") { continue; }
        if ((!VISIT_ENABLED) && category === "Visit" && ROLES[parseInt(identity.role)][1].indexOf("e") === -1) { continue; }
        if (!EDIT_ENABLED && category === "Edit") { continue; }

        // Check if client has permissions to access this category
        if (ROLES[identity.role][1].indexOf(category[0].toLowerCase()) > -1) {

            prompt += "\* " + category.toUpperCase() + " \*\n\n";

            let maxCommandLength = Math.max(...Object.keys(OPERATIONS[category]).map(c => c.length));
            let maxDescLength = Math.max(...Object.keys(OPERATIONS[category]).map(c => c.length));

            for (op of Object.keys(OPERATIONS[category])) {

                prompt += op.padEnd(maxCommandLength) + " - " + OPERATIONS[category][op][0] + "\n";
                if (OPERATIONS[category][op][2] !== "") {
                    prompt += " ".padEnd(maxCommandLength) + "\t\t\t - Parameters: " + OPERATIONS[category][op][2] + "\n";
                }
                valid_operations.push(op);
            }
        }
        prompt += "\n";
    }

    // if (hidden_ops_enabled) {
    //     for (op in Object.keys(OPERATIONS_HIDDEN[identity.clientType])) {
    //         valid_operations.push(op);
    //     }
    // }

    if (cli_mode) {
        prompt += "Examples:\n";
        prompt += 'sendChat("Hi, how are you?")\n';
        prompt += 'countTotalAvatars()\n';
    }

    // Validate operation if one was already provided
    if (isNaN(parseInt(json.operation)) && json.operation !== "") {

        // Security checks to prevent potentially malicious code
        const CHECKS = ["console.debug(", "eval(", "Function(", "setTimeout(", "setInterval(", "print(", "return", "webSocket.send", "sendToClient", "connectedClients", "password", "JSON.parse"];
        for (c of CHECKS) {
            if (json.operation.toString().toLowerCase().replace(/\\./g, '').indexOf(c.toLowerCase()) > -1) {
                updateStatus(STATUSES["invalid"], identity);
                closeSocket(STATUSES["invalid"], identity);
                return undefined;
            }
        }

        // Parse the operation provided by client
        try {
            command = json.operation.slice(0, (json.operation.indexOf("(") > -1 ? json.operation.indexOf("(") : json.operation.length));

            if (json.operation.indexOf("(") > -1) {
                param_string = json.operation.slice(json.operation.indexOf("(") + 1, json.operation.lastIndexOf(")"));
            }
            else {
                param_string = "";
            }
        }
        catch (err) {
            updateStatus('Error parsing command string: ' + err, identity);
            closeSocket(STATUSES["cmdErr"], identity);
            return false;
        }

        // DEBUG
        // updateStatus("COMMAND STRING: " + command, identity);
        // updateStatus("PARAMS STRING: " + param_string, identity);

        // Check if requested command is valid
        if (valid_operations.indexOf(command) === -1) {
            updateStatus(STATUSES["invalid"], identity);
            closeSocket(STATUSES["invalid"], identity);
            return false;
        }

        let jsonStr = "";

        // Replace the single quotes with double quotes to make it valid JSON
        jsonStr = "[" + param_string.replace(/'/g, '"') + "]";

        try {
            params = JSON.parse(jsonStr);
        }
        catch (err) {
            updateStatus('Error parsing parameter string: ' + err, identity);
            closeSocket(STATUSES["cmdErr"], identity);
            return false;
        }

    }

    // Prepare to construct the command and run the operation
    if (!(command === "")) {
        let cmd = "";

        for (category of Object.keys(OPERATIONS)) {
            for (op of Object.keys(OPERATIONS[category])) {
                if (op === command) {
                    cmd = OPERATIONS[category][op][1];
                    cmd_category = category;
                    break;
                }
            }
            if (cmd !== "") {
                break;
            }
        }

        // DEBUG
        // print("REQUESTED CATEGORY: " + cmd_category);
        // print("REQUESTED CMD: " + OPERATIONS[cmd_category][command]);
        // print("REQUIRED PARAMS: " + OPERATIONS[cmd_category][command][2]);
        // print("SUBMITTED PARAMS: " + params);
        // print("SUBMITTED PARAMS TYPE: " + typeof (params));

        let required_params = OPERATIONS[cmd_category][command][2].split(",");

        // DEBUG
        // print("REQUIRED PARAMS LENGTH: " + required_params.length);
        // print("SUBMITTED PARAMS LENGTH: " + params.length);

        if (required_params[0] === "") {
            required_params = [];
        }
        if (required_params.length !== params.length) {
            let status = "ERROR: Parameter mismatch";
            updateStatus(status, identity);
            closeSocket(status, identity);
            return false;
        }

        // Inject the parameters into command string
        for (param_count = 0; param_count < required_params.length; param_count++) {
            cmd = cmd.replace(required_params[param_count], params[param_count]);
        }

        // Special case for admin 'run' command
        if ((command === "run") && (ROLES[identity.role][1].indexOf("a") > -1)) {
            cmd = params[0];
        }

        const run = new Function("identity", cmd);

        // Try running the constructed command and catch any errors
        try {
            run(identity);
            updateStatus(STATUSES["cmdOk"], identity);
            json.operation = "";
            identity.operation = "";
        }
        catch (err) {
            updateStatus(STATUSES["cmdErr"] + ": " + err.message, identity);
            closeSocket(STATUSES["cmdErr"] + ": " + err.message, identity);
        }
        identity.request_count += 1;
    }

    // Resend the prompt to CLI client again.
    if (cli_mode) {
        if (identity.request_count > 0) {
            if (command !== "commands") {
                prompt = "Please enter another command";
            }
        }
        sendToClient(prompt, "REQUEST", identity);
    }

    return false;
}

if (!listening) { throw { "name": "Disabled", "message": "Listening is disabled. Exiting..." }; }     // If "listening" is set to false, exit instead of proceeding

updateStatus(STATUSES["starting"]);
let webSocketServer = ((PORT > 0) ? new WebSocketServer(PORT) : new WebSocketServer());       // If PORT is 0, just randomize it.
serverURL = webSocketServer.url;
updateStatus(STATUSES["on"] + " at URL " + serverURL + " ");
Entities.editEntity(UUID, {
    "text": STATUSES["on"] + " on port " + webSocketServer.port
});

function onNewConnection(webSocket) {

    if (!listening) {
        // If "listening" is set to false, exit instead of proceeding
        closeSocket(STATUSES["off"], { "socket": webSocket });
    }
    sendToClient(welcome_art, "INFO", { "socket": webSocket });
    sendToClient(welcome_msg, "INFO", { "socket": webSocket });

    // Setup variables for this client
    var identity = undefined;
    let handshake_valid = undefined;
    let authenticated = false;
    let auth_attempts = 0;
    let cli_mode = undefined;
    let authenticate_result = undefined;

    updateStatus(STATUSES["connected"] + ": " + webSocket.url);

    webSocket.onclose = function (message) {
        updateStatus("Closed connection to client");
    }

    webSocket.onmessage = function (message) {

        let msg_json = "";
        msg_json = parseJSON(message, webSocket);

        // Check if handshake has happened yet, and if not, check the message for one
        if (handshake_valid === undefined) {
            handshake_result = handshake(msg_json, webSocket);
            handshake_valid = handshake_result[0];
            identity = handshake_result[1];
        }
        // If handshake invalid, close the connection
        if (handshake_valid === false) {
            closeSocket(STATUSES["shakeFail"], { "socket": webSocket });
            return;
        }
        // Handshake valid, so check for CLI client
        else {
            cli_mode = (identity.clientType === "CLI" ? true : false);
            identity.request_count = 0;
        }

        // Check if client sent an empty or invalid message
        if (msg_json === "") {
            // JSON was empty, so error and exit
            incorrectCmd();
            closeSocket(STATUSES["invalid"], identity);
            return;
        }

        // If role hasn't been set, prompt the client to select a role first
        if (handshake_valid === true) {
            if (!("role" in identity) || parseInt(identity.role) === -1) {
                identity.role = pick_role(msg_json, identity);
            }
        }

        // Authenticate if needed
        if (authenticated === false && identity.role > -1 && handshake_valid === true) {

            // Check permission requirements for the selected role
            if ((ROLES[identity.role][1].indexOf("a") > -1) || (ROLES[identity.role][1].indexOf("e") > -1)) {
                // Check for correct password
                authenticate_result = authenticate(msg_json, identity, auth_attempts);
            }
            else {
                // Selected role doesn't require write or admin privileges, so authenticate automatically without a password
                authenticate_result = [true, 0];
            }

            authenticated = authenticate_result[0];
            auth_attempts = authenticate_result[1];

        }

        // Provide a list to the user of possible actions
        if (authenticated === true && identity.role > -1 && handshake_valid === true) {
            pick_operation(msg_json, identity);

            if (identity.complete) {
                closeSocket(STATUSES["complete"], identity);
                updateStatus(STATUSES["complete"], identity);
                return;
            }
        }
    }

}

function onStatusReceived(channel, message, sender, localOnly) {
    Entities.editEntity(UUID, {
        "text": "Bridge: " + message
    });
    if (message.length > 56) {
        Entities.editEntity(UUID, {
            "dimensions": {
                "x": 2.9,
                "y": 0.7693,
                "z": 0.0100
            }
        });
    }
    else {
        Entities.editEntity(UUID, {
            "dimensions": {
                "x": 2.9,
                "y": 0.4935,
                "z": 0.01
            }
        });
    }
}


(function () {
    webSocketServer.newConnection.connect(onNewConnection);
    Messages.subscribe("bridge.status");
    Messages.messageReceived.connect(onStatusReceived);
})
