# Сhat_express
This is backend side built with express for my lokkeroom challange. It's running on Heroku.

# Improvements
 - I had to change the format of my responses in a way that they fit my needs from frontend side.

# GET Endpoints

# Get Users in a Lobby
URL: /lobby/:id/users
Description: Retrieves a list of users in a specified lobby.
Auth Required: Yes
# Get Messages in a Lobby
URL: /lobby/:id/messages
Description: Retrieves all messages from a specified lobby.
Auth Required: Yes
# Get My Direct Messages in a Lobby
URL: /lobby/:id/myMessages
Description: Retrieves the user's direct messages in a specified lobby.
Auth Required: Yes
# Get My Private Messages
URL: /myMessages
Description: Retrieves the user's private messages.
Auth Required: Yes
# Get All Lobbies
URL: /lobbies
Description: Retrieves a list of all lobbies.
Auth Required: Yes
# Get My Lobbies
URL: /mylobbies
Description: Retrieves a list of lobbies the user is part of.
Auth Required: Yes
POST Endpoints

# Register a New User
URL: /register
Description: Registers a new user.
Auth Required: No
# Login a User
URL: /login
Description: Logs in an existing user.
Auth Required: No
# Create a New Lobby
URL: /createLobby
Description: Creates a new lobby.
Auth Required: Yes
# Join a Lobby
URL: /lobby/:id/join
Description: Joins a specified lobby.
Auth Required: Yes
# Write a Message in a Lobby
URL: /lobby/:id/writeMessage
Description: Writes a message in a specified lobby.
Auth Required: Yes
# Add User to a Lobby
URL: /lobby/:id/addUser
Description: Adds a user to a specified lobby.
Auth Required: Yes
# Send a Direct Message
URL: /directMessage
Description: Sends a direct message to another user.
Auth Required: Yes
# Create a New Lobby and Post a Message
URL: /createNewLobbyAndPostMessage
Description: Creates a new lobby and posts a message in it.
Auth Required: Yes
PATCH Endpoints

# Edit a Message in a Lobby
URL: /lobby/:id/myMessages/:messageId
Description: Edits a specified message in a specified lobby.
Auth Required: Yes
DELETE Endpoints

# Delete a Message from a Lobby
URL: /lobby/:id/myMessages/:messageId
Description: Deletes a specified message from a specified lobby.
Auth Required: Yes
