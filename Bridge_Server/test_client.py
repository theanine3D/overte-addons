import asyncio
import websockets
import json
import sys
from functools import reduce

def encrypt(salt, text):
    text_to_chars = lambda text: [ord(c) for c in text]
    byte_hex = lambda n: '{:02x}'.format(n) 
    apply_salt_to_char = lambda code: reduce(lambda a, b: a ^ b, text_to_chars(salt), code)

    return ''.join([byte_hex(apply_salt_to_char(code)) for code in text_to_chars(text)])


async def websocket_client(ip="localhost",port="59999",username="CLI_User", password="", role="-1", operation=""):
    uri = "ws://" + ip + ":" + port

    async with websockets.connect(uri) as websocket:
        # Prepare the initial message
        msg = {
            "userName": username,
            "clientType": "CLI",
        }
        if password != "":
            msg.update({"password": password})            
        if role != "-1":
            msg.update({"role": role})            
        if operation != "":
            msg.update({"operation": operation})            

        # Send the message
        await websocket.send(json.dumps(msg))

        while True:
            # Receive a response
            response = await websocket.recv()

            json_response = json.loads(response)

            # Check if the message is a request
            if json_response["type"] == "REQUEST":

                print(f"BRIDGE:\n {json_response['msg']}")
                # Get user input from terminal
                user_input = input("Input: ")
                print("")

                # Prepare the message
                msg = {
                    "response": user_input
                }
                
                # Send the message
                await websocket.send(json.dumps(msg))

            # Check if message is data output
            elif json_response["type"] == "OUTPUT":
                print("COMMAND OUTPUT:\n" + json.dumps(json_response["msg"]) + "\n")

            # Check if message is just informational
            elif json_response["type"] == "INFO":
                if json_response["msg"].startswith("[CHAT]"):
                    print(f"{json_response['msg']}\n")
                else:
                    print(f"BRIDGE:\n {json_response['msg']}")
                
# Show list of command line arguments if none were provided
if len(sys.argv) == 1:
    print("Usage:")
    print("\tpython test_client.py [server_ip] [port] [username] [password] [role] [operation]")
    print("\tOnly first three arguments are mandatory. The other parameters are optional.")

else:
    ip = sys.argv[1] if len(sys.argv) > 1 else "localhost"
    port = sys.argv[2] if len(sys.argv) > 2 else "59999"
    username = sys.argv[3] if len(sys.argv) > 3 else "CLI_User"
    password = sys.argv[4] if len(sys.argv) > 4 else ""
    role = sys.argv[5] if len(sys.argv) > 5 else "-1"
    operation = sys.argv[6] if len(sys.argv) > 6 else ""

    # Check if encryption flag was passed via the password
    if password.startswith("[e]"):

        # Encrypt the password
        password = encrypt("3EA66EC1AF586A3FEDE84D7324221", password)
        print("ENCRYPTED PASSWORD: " + password)

    try:
        asyncio.get_event_loop().run_until_complete(websocket_client(ip,port,username,password,role,operation))
    except Exception as e:
        print(str(e))
