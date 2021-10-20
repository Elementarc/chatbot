//Regex to test if string is /f
const privateMessageRegEx = new RegExp(/^[\/]f$/)
//Class
class Account{
    constructor(username = "", room = "") {
        this.username = username
        this.room = room
        this.text
        this.data = ""
        this.ws
    }
    
    //Methods to set Member Values
    setUsername(username) {
        this.username = username
        this.checkUsername()
    }
    setRoom(room) {
        this.room = room
        this.checkRoom()
    }
    setText(text) {
        this.text = text
    }

    //Method to close Socket to Server Also ressetting input fields & Chat
    logout() {
        //Resetting Everything
        if(this.ws.readyState === 1) {
            this.ws.send("UNSUBSCRIBE")
        }
        this.ws.close()
        this.#resetAll()
        
        //Removing all Messages from DOM
        const getMessages = document.getElementsByClassName("message_container")
        //HTMLCollection to Array
        const messages = Array.from(getMessages)
        //Looping through Array of Messages to remove eachone
        for(let i = 0; i < messages.length; ++i) {
            messages[i].remove()
        }
        this.switchView(1)
    }
    //Method to Subscribe to loggedin Room
    login() {
        const validUsername = this.checkUsername()
        const validRoom = this.checkRoom()
        if(validUsername === true && validRoom === true) {
            //Creating socket
            this.ws = new WebSocket("wss://chat.web2021.dhbw.scytec.de/ws");
            //Making sure we are connected to socket
            this.ws.onopen = () => {
                //Subscribing to room
                this.ws.send(`SUBSCRIBE ${this.room}`)
                //Event that server returns whenever Room gets a message
                this.ws.onmessage = (message) => {

                    //Our Method that takes in that messageObj and creates a Component
                    this.#createMessageComponent(JSON.parse(message.data))
                }
            }
            
            this.#renderAllMessages(this.#getAllMessages(this.room))
            this.switchView(0)
            console.log("Successful Login as: " + `${this.username} in Room: ${this.room}`)
            
        } else {

            console.log("You cant Login with those informations")

        }
    }
    
    //Validation Für usernames
    checkUsername() {
        const getErrorMessageUsername = document.getElementById("username_input_error_message")
        if(this.username.length > 0 && this.username.length <= 12) {
            getErrorMessageUsername.innerHTML = ""
            return true
        } else {
            getErrorMessageUsername.innerHTML = "Min. 1 Zeichen & Max. 12 Zeichen."
            //Error message
            return false
        }
    }
    //Validation Für Rooms
    checkRoom() {
        const getErrorMessageRoom = document.getElementById("room_input_error_message")
        const RegEx = new RegExp(/^[A-Za-z0-9]*$/)
        if(RegEx.test(this.room) === true && this.room.length > 0) {
            getErrorMessageRoom.innerHTML = ""
            return true
        } else {
            getErrorMessageRoom.innerHTML = "Diese Zeichen sind erlaubt: a-z, A-Z, 0-9, -, _"
            //Error message
            return false
        }
    }

    //Animation to switch to Chat Window
    switchView(view){
        const getChatContainer = document.getElementById("chat_container")

        if(view === 0) {
            getChatContainer.style.opacity = "1"
            getChatContainer.style.pointerEvents = "all"
        } else {
            getChatContainer.style.opacity = "0"
            getChatContainer.style.pointerEvents = "none"
        }
        
    }
    //Method that resets all inputfields
    #resetAll() {
        //Getting Username Input Element
        const getUsernameInput = document.getElementById("username_input")
        //Getting Room Input Element
        const getRoomInput = document.getElementById("room_input")
        //Getting Text Input Element
        const textInput = document.getElementById("text_input")

        this.username = ""
        this.room = ""
        this.text = ""

        getUsernameInput.value = this.username
        getRoomInput.value = this.room
        textInput.value = this.text
    }
    //Method that sends a message to a specific room
    sendMessage() {
        try {
            if(this.username.length > 0 && this.room.length > 0) {
                //Message obj that gets send to server
                const msg = {
                    sender: this.username,
                    room: this.room,
                    text: this.text,
                    data: this.data
                }

                //Server response
                fetch(`https://chat.web2021.dhbw.scytec.de/room/${this.room}/messages`, {
                    method: "POST",
                    cors: "no-cors",
                    body: JSON.stringify(msg),
                })
                
                //Getting Text Input Element
                const textInput = document.getElementById("text_input")
                //Resetting textField
                this.text = ""
                //resetting Inputfield
                textInput.value = this.text
            } else {
                this.login()
            }
        } catch(err) {
            //console.log(err)
        }
    }
    //Method that returns an Array of all messages from a room
    async #getAllMessages(room) {
        try {
            if(this.username.length > 0 && this.room.length > 0) {
                
                const messages = await fetch(`https://chat.web2021.dhbw.scytec.de/room/${room}/messages`)
                const messageArr = await messages.json()
                return messageArr
            } else {
                console.log("you need to login to recieve messages")
            }
        } catch (err) {
            //console.log(err)
        }
        return 
    };
    //Method that renders all messages. Takes in an Array of messages
    async #renderAllMessages(MessageArr){
        const messageArr = await MessageArr
        
        if(messageArr) {
            for(const message of messageArr) {

                this.#createMessageComponent(message)
            }
        }
    };

    //Creating DOM Elements. Takes in and object that has name and text of message
    #createMessageComponent(message) {
        //GettingChat Container
        const getChatContainer = document.getElementById("chat_content_container")

        /*START--CREATING--ELEMENTS */
        const message_container = document.createElement("div")
        message_container.setAttribute("id", "message_container")
        message_container.setAttribute("class", "message_container")


        const message_user_container = document.createElement("div")
        message_user_container.setAttribute("id", "message_user_container")
        message_user_container.setAttribute("class", "message_user_container")

        const message_user_box = document.createElement("div")
        message_user_box.setAttribute("id", "message_user_box")
        message_user_box.setAttribute("class", "message_user_box")

        const message_username = document.createElement("h1")
        message_username.setAttribute("id", "message_username")
        message_username.setAttribute("class", "message_username")
        message_username.innerHTML = message.sender

        //Creating Private Message Component
        if(privateMessageRegEx.test(message.text.substring(0,2)) === true) {
            
            if(message.text.split(" ")[1].toLowerCase() === this.username.toLowerCase()) {
                const message_text = document.createElement("p")
                message_text.setAttribute("id", "message_text_private")
                message_text.setAttribute("class", "message_text_private")
                message_text.innerHTML = this.#removeCommandFromText(message.text)
                /*END--CREATING--END */

                //Adding to DOM
                message_user_container.appendChild(message_user_box)
                message_user_container.appendChild(message_username)
                message_container.appendChild(message_user_container)
                message_container.appendChild(message_text)
                getChatContainer.appendChild(message_container)

                
            } else {

                if(message.sender === this.username) {

                    const message_text = document.createElement("p")
                    message_text.setAttribute("id", "message_text_private")
                    message_text.setAttribute("class", "message_text_private")
                    message_text.innerHTML = `to: ${message.text.split(" ")[1].toLowerCase()}` + this.#removeCommandFromText(message.text)
                    /*END--CREATING--END */

                    //Adding to DOM
                    message_user_container.appendChild(message_user_box)
                    message_user_container.appendChild(message_username)
                    message_container.appendChild(message_user_container)
                    message_container.appendChild(message_text)
                    getChatContainer.appendChild(message_container)

                } 
            }
            
        } else {

            const message_text = document.createElement("p")
            message_text.setAttribute("id", "message_text")
            message_text.setAttribute("class", "message_text")
            message_text.innerHTML = message.text
            /*END--CREATING--END */

            //Adding to DOM
            message_user_container.appendChild(message_user_box)
            message_user_container.appendChild(message_username)
            message_container.appendChild(message_user_container)
            message_container.appendChild(message_text)
            getChatContainer.appendChild(message_container)

            //SCROLLING TO BOTTOM OF DIV 
            const getChatContent = document.getElementById("chat_content_container")
            getChatContent.scrollTop = getChatContent.scrollHeight
        }

        //SCROLLING TO BOTTOM OF DIV 
        const getChatContent = document.getElementById("chat_content_container")
        getChatContent.scrollTop = getChatContent.scrollHeight
    }
    
    #removeCommandFromText(text) {
        const textArr = text.split(" ")

        const newTextArr = textArr.slice(2)

        const finishedText = newTextArr.join(" ")

        console.log(finishedText)
        return finishedText
    }
}

const account = new Account();

//Function That gets invoked immediately. Adds an onclick eventlistener to login/LogOut Button. 
(function () {
    //Getting Button Element
    const getLoginButton = document.getElementById("login_button")
    //Getting Button Element
    const getLogoutButton = document.getElementById("logout_button")
    //Calling Accountfunction login when button Clicked
    getLoginButton.addEventListener("click", () => {
        //Calling logIn method to check if we should login user
        account.login()
    })
    //Calling Accountfunction logout when button Clicked
    getLogoutButton.addEventListener("click", () => {
        //Calling logIn method to check if we should login user
        account.logout()
    })
})();
//Function That gets invoked immediately. Adds an focusout eventlistener to inputs. 
(function () {
    //Getting Username Input Element
    const getUsernameInput = document.getElementById("username_input")
    //Getting Room Input Element
    const getRoomInput = document.getElementById("room_input")
    //Getting Text Input Element
    const textInput = document.getElementById("text_input")


    getUsernameInput.addEventListener("focusout", (e) => {
        account.setUsername(e.target.value)
    })

    getRoomInput.addEventListener("focusout", (e) => {
        account.setRoom(e.target.value)
    })
    
    textInput.addEventListener("focusout", (e) => {
        account.setText(e.target.value)
        
    })
})();
//Function That gets invoked immediately. Adds an onclick eventlistener send Button. 
(function () {
    //Getting Username Input Element
    const getSendButton = document.getElementById("send_button")

    getSendButton.addEventListener("click", () => {
        account.sendMessage()
    })
})();