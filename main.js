//Regex, um zu testen, ob in dem Textinput ein /f ist für whisper
const privateMessageRegEx = new RegExp(/^[\/]f$/)

//Klasse Account
class Account {
    //Hier wird der Konstruktor definiert
    constructor(username = "", room = "") {
        this.username = username
        this.room = room
        this.text = ""
        this.data = ""
        this.ws
    }

    //Set-Methoden, um die Werte zu setzen zu setzen
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

    //Die Methode logout schließt die Verbindung vom WebSocket zum Server und ruft die Methode #resetAll() auf
    logout() {
        //Prüft, ob eine Verbindung zwischen Web Socket und Server besteht
        if (this.ws.readyState === 1) {
            //Hat der Websocket eine Verbindung zum Server wird diese bei Verwendung der Methode getrennt
            this.ws.send("UNSUBSCRIBE")
        }
        //Schließt den Web Socket
        this.ws.close()
        //Setzt alle Variablen und Elemente zurück
        this.#resetAll()

        //Erstellt eine Konstante und weist ihr das Element "message_container" zu
        const getMessages = document.getElementsByClassName("message_container")

        //Gibt ein Array aus getMessages zurück und speichert diese in die Konstante messages
        const messages = Array.from(getMessages)

        //Löscht alle Nachrichten im Array
        for (let i = 0; i < messages.length; ++i) {
            messages[i].remove()
        }
        //Wechselt die Ansicht zum Anmeldefenster
        this.switchView(1)
    }

    //Method to Subscribe to loggedin Room
    login() {
        // übergibt die booleschen Werte (ob der Nutzername und Raumname valide ist) in Variablen
        const validUsername = this.checkUsername()
        const validRoom = this.checkRoom()

        //Prüft, ob der Nutzername und Raumname Valide sind
        if (validUsername === true && validRoom === true) {
            //deklariert einen Websocket mit Angabe des Backends
            this.ws = new WebSocket("wss://chat.web2021.dhbw.scytec.de/ws");

            //Wenn der Websocket eine Verbindung zum Server hat wird das folgende Event vom Server zurückgegben
            this.ws.onopen = () => {
                //Verbindung zum Raum wird hergestellt
                this.ws.send(`SUBSCRIBE ${this.room}`)
                //Wenn der Raum eine Message erhält wird das folgende Event vom Server zurückgegben
                this.ws.onmessage = (message) => {
                    //Für Die neue Nachricht im Raum wird eine neue Komponente erstellt
                    this.#createMessageComponent(JSON.parse(message.data))
                }
            }
            //Erstellt für jede sich in dem Raum befindene Nachricht eine eigene Komponente
            this.#renderAllMessages(this.#getAllMessages(this.room))

            //Ändert die Sicht zum Chatfenster
            this.switchView(0)
            console.log("Successful Login as: " + `${this.username} in Room: ${this.room}`)

            //fügt den Raumnamen an der gewollten Stelle in der HTML hinzu
            this.showRoomname();
        } else {
            console.log("You cant Login with those informations")
        }
    }

    //Diese Methode gibt die Validierung des Nutzernamen vor
    checkUsername() {
        //Erstellt eine Konstante und weist ihr das Element "username_input_error_message" zu
        const getErrorMessageUsername = document.getElementById("username_input_error_message")

        //Prüft, ob die Länge des Nutzernamen größer als 0 und kleiner gleich 12 ist
        if (this.username.length > 0 && this.username.length <= 12) {

            if(this.username.includes(" ") ===  true) {
                getErrorMessageUsername.innerHTML = "Du kannst keine Leerzeichen im namen benutzen"
                return false
            } else {
                getErrorMessageUsername.innerHTML = ""
                return true
            }
            //Ist der Name >0 und <=12 wird keine Error Message ausgegeben bzw. eine leere.
            
            
        } else {
            //Ist der Name <0 oder >12 wird eine Error Message unter dem Textfeld ausgegeben
            getErrorMessageUsername.innerHTML = "Min. 1 Zeichen & Max. 12 Zeichen."
            return false
        }
    }
    //Diese Methode gibt die Validierung des Raumnamen vor
    checkRoom() {
        //Erstellt eine Konstante und weist ihr das Element "room_input_error_message" zu
        const getErrorMessageRoom = document.getElementById("room_input_error_message")

        //Definiert Was ein Raumname alles enthalten darf
        const RegEx = new RegExp(/^[A-Za-z0-9]*$/)

        //Prüft, ob der Raumname valide und der Raumname <0 ist
        if (RegEx.test(this.room) === true && this.room.length > 0) {
            //Wenn der Raumname >0 ist und valide ist wird keine Error Message ausgegeben (bzw. eine leere)
            getErrorMessageRoom.innerHTML = ""
            return true
        } else {
            //Ist der Raumname <0 oder ist dieser nicht valide wird eine Error Message unter dem Textfeld ausgegeben
            getErrorMessageRoom.innerHTML = "Diese Zeichen sind erlaubt: a-z, A-Z, 0-9, -, _"
            return false
        }
    }

    //Diese Methode wechselt die sicht vom Login Fenster zum Chat Fenster und umgekehrt
    switchView(view) {
        //Erstellt eine Konstante und weist ihr das Element "chat_container" zu
        const getChatContainer = document.getElementById("chat_container")

        //Je nach View wird ein anderes Fenster gezeigt: 1 Login Fenster | 0 Chat Fenster
        if (view === 0) {
            getChatContainer.style.opacity = "1"
            getChatContainer.style.pointerEvents = "all"
        } else {
            getChatContainer.style.opacity = "0"
            getChatContainer.style.pointerEvents = "none"
        }

    }

    //Diese Methode setzt alle Variablen und Elemente zurück
    #resetAll() {
        //Erstellt eine Konstante und weist ihr das Textfeld "username_input" zu
        const getUsernameInput = document.getElementById("username_input")
        //Erstellt eine Konstante und weist ihr das Textfeld "room_input" zu
        const getRoomInput = document.getElementById("room_input")
        //Erstellt eine Konstante und weist ihr das Textfeld "text_input" zu
        const textInput = document.getElementById("text_input")

        //Setzt alle Variablen zurück
        this.username = ""
        this.room = ""
        this.text = ""

        //setzt alle Elemente zurück
        getUsernameInput.value = this.username
        getRoomInput.value = this.room
        textInput.value = this.text
    }

    //Diese Methode sendet die geschriebene Nachricht zum Raum in dem man sich befindet
    sendMessage() {
        try {
            //Prüft, ob der Nutzername und der Raumname existiert
            if (this.username.length > 0 && this.room.length > 0) {

                //Nachricht wird nur gesendet wenn die nachricht inhalt beinhaltet
                if(this.text.length > 0) {
                    //Hier wird das Objekt msg deklariert das zum Server geschickt wird
                    const msg = {
                        sender: this.username,
                        room: this.room,
                        text: this.text,
                        data: this.data
                    }

                    //Die Nachricht wird zum Backend für den angegebenen Raum gesendet
                    fetch(`https://chat.web2021.dhbw.scytec.de/room/${this.room}/messages`, {
                        // schreibt die URL-Parameter in den HTTP-Request für den Server
                        method: "POST",
                        //no-cors: Teilt dem Backend mit, dass die Methode aufjedenfall eine GET / POST Methode ist und nur simple header enthalten sind
                        cors: "no-cors",
                        //Im body befindet sich der Inhalt der gesendet wird
                        body: JSON.stringify(msg),
                    })

                    //Erstellt eine Konstante und weist ihr das Textfeld "text_input" zu
                    const textInput = document.getElementById("text_input")

                    //Setzt das Textfeld wieder zurück
                    this.text = ""
                    textInput.value = this.text
                } else {
                    //Nachricht wird nicht versendet
                    console.log("nachricht kann nicht versendet werden da es leer ist")
                }
                
            } else {
                //Existiert der Raum- oder Nutzername nicht wird die Methode login() ausgeführt
                this.login()
            }
        } catch (err) {
            console.log(err)
        }
    }

    //Diese Methode gibt Alle Nachrichten eines angegebenen Raums zurück 
    async #getAllMessages(room) {
        try {
            //Prüft, ob der Nutzername und der Raumname existiert
            if (this.username.length > 0 && this.room.length > 0) {

                //Speichert die Nachrichten des angegebenen Raumes in die Konstante messages
                const messages = await fetch(`https://chat.web2021.dhbw.scytec.de/room/${room}/messages`)
                //Wandelt die Nachrichten in ein Objekt in Form einer Json( [{Nachricht1},{Nachricht2}] ) um
                const messageArr = await messages.json()
                return messageArr
            } else {
                //Gibt eine Fehlermeldung in der Konsole aus Falls der Nutzername bzw. der Raumname nicht existiert
                console.log("you need to login to recieve messages")
            }
        } catch (err) {
            console.log(err)
        }
        return
    };

    //Diese Methode erstellt für jede Nachricht eine eigene Komponente
    async #renderAllMessages(MessageArr) {
        //Weist einer lokalen Variable den angegebenen Parameter(Array der Nachrichten) zu
        const messageArr = await MessageArr

        //Prüft, ob das message Array existiert
        if (messageArr) {

            //Für jede Nachricht im ARray wird eine eigene Komponente erstellt.
            for (const message of messageArr) {

                this.#createMessageComponent(message)
            }
        }
    };

    //Diese Methode erstellt alle Componente die Für eine Nachricht benötigt werden und schreibt diese in die HTML
    #createMessageComponent(message) {
        //Erstellt eine Konstante und weist ihr das Element "chat_content_container" zu
        const getChatContainer = document.getElementById("chat_content_container")

        /*Hier beginnt das Erstellen von Elementen */

        //erstellt ein div Element in der HTML
        const message_container = document.createElement("div")
        //fügt dem div Element eine id und class name hinzu
        message_container.setAttribute("class", "message_container")

        //erstellt ein div Element in der HTML
        const message_user_container = document.createElement("div")
        //fügt dem div Element eine id und class name hinzu
        message_user_container.setAttribute("class", "message_user_container")

        //erstellt ein h1 Element in der HTML
        const message_username = document.createElement("h1")
        //fügt dem h1 Element eine id und class name hinzu
        message_username.setAttribute("class", "message_username")
        message_username.innerHTML = message.sender

        const time_date = document.createElement("p")
        time_date.setAttribute("class", "message_date")
        time_date.innerHTML = this.getDateOfMessage(message.timestamp)

        const time_time = document.createElement("p")
        time_time.setAttribute("class", "message_time")
        time_time.innerHTML = this.getTimeOfDate(message.timestamp)

        
        //Eigene Nachrichten werden auf der rechten seite angezeigt
        if(message.sender === this.username) {
            message_container.classList.add("self_message")
        }


        //Erstellt eine Komponente für Private Nachrichten
        if (privateMessageRegEx.test(message.text.substring(0, 2)) === true) {

            if (message.text.split(" ")[1].toLowerCase() === this.username.toLowerCase()) {
                //erstellt ein p Element in der HTML
                const message_text = document.createElement("p")
                //fügt dem p Element eine id und class name hinzu
                message_text.setAttribute("class", "message_text_private")
                message_text.innerHTML = this.#removeCommandFromText(message.text)
                /*Hier endet das Erstellen von Elementen */

                /*Definiert eine Struktur für das Einfügen der Elemente in die HTML*/

                //Das h1 Element message_username befindet sich im div Element message_user_container
                message_user_container.appendChild(message_username)
                //Das div Element message_user_container befindet sich im div Element message_container
                message_container.appendChild(message_user_container)
                message_user_container.appendChild(time_date)
                message_user_container.appendChild(time_time)
                //Das p Element message_text befindet sich im div Element message_text_container
                message_container.appendChild(message_text)
                //Das div Element message_container befindet sich im div Element getChatContainer
                getChatContainer.appendChild(message_container)

                /*Hier endet die Definierung der Struktur für das Einfügen der Elemente in die HTML*/

            } else {

                if (message.sender === this.username) {
                    //erstellt ein p Element in der HTML
                    const message_text = document.createElement("p")
                    //fügt dem p Element eine id und class name hinzu
                    message_text.setAttribute("class", "message_text_private")
                    message_text.innerHTML = `to ${message.text.split(" ")[1].toLowerCase()}: ` + this.#removeCommandFromText(message.text)

                    /*Hier endet das Erstellen von Elementen */

                    /*Definiert eine Struktur für das Einfügen der Elemente in die HTML*/

                    //Das h1 Element message_username befindet sich im div Element message_user_container
                    message_user_container.appendChild(message_username)
                    //Das div Element message_user_container befindet sich im div Element message_container
                    message_container.appendChild(message_user_container)
                    message_user_container.appendChild(time_date)
                    message_user_container.appendChild(time_time)
                    //Das p Element message_text befindet sich im div Element message_text_container
                    message_container.appendChild(message_text)
                    //Das div Element message_container befindet sich im div Element getChatContainer
                    getChatContainer.appendChild(message_container)

                    /*Hier endet die Definierung der Struktur für das Einfügen der Elemente in die HTML*/
                }
            }

        } else {
            //erstellt ein p Element in der HTML
            const message_text = document.createElement("p")
            //fügt dem p Element eine id und class name hinzu
            message_text.setAttribute("class", "message_text")
            message_text.innerHTML = message.text
            /*Hier endet das Erstellen von Elementen */

            /*Definiert eine Struktur für das Einfügen der Elemente in die HTML*/
                 //Das h1 Element message_username befindet sich im div Element message_user_container
                 message_user_container.appendChild(message_username)
                 //Das div Element message_user_container befindet sich im div Element message_container
                 message_container.appendChild(message_user_container)
                 message_user_container.appendChild(time_date)
                 message_user_container.appendChild(time_time)
                 //Das p Element message_text befindet sich im div Element message_text_container
                 message_container.appendChild(message_text)
                 //Das div Element message_container befindet sich im div Element getChatContainer
                 getChatContainer.appendChild(message_container)

            /*Hier endet die Definierung der Struktur für das Einfügen der Elemente in die HTML*/

            //Scrollt den Nachrichtenverlauf ganz nach unten wenn eine neue Naxchricht erscheint
            const getChatContent = document.getElementById("chat_content_container")
            getChatContent.scrollTop = getChatContent.scrollHeight
        }

        //Scrollt den Nachrichtenverlauf ganz nach unten wenn eine neue Naxchricht erscheint
        const getChatContent = document.getElementById("chat_content_container")
        getChatContent.scrollTop = getChatContent.scrollHeight
    }

    //Diese Methode entfernt das "to:username" von der Privaten Nachricht, um nur die Private Nachricht an einen Bestimmten User zu schicken
    #removeCommandFromText(text) {
        //Teilt den text bei einem Leerzeichen in ein Array
        const textArr = text.split(" ")

        //Kürzt den Array auf die ersten zwei Elemente im Array
        const newTextArr = textArr.slice(2)

        //Fügt dem Text ein Leerzeichen hinzu
        const finishedText = newTextArr.join(" ")

        //Gibt den geschriebenen Text für eine Private nachricht zurück
        return finishedText
    }
    //Diese Methode fügt den Raumnamen der sich in der Variablen room befindet an der gewollten Stelle in der HTML hinzu
    showRoomname() {
        document.getElementById("room_text").innerHTML = this.room;
    }

    //Diese Methode nimmt den timestamp der jeweiligen Nachricht aus dem Backend und gibt nur die Uhrzeit zurück
    getTimeOfDate(timestamp) {
        //Teilt den timestamp der Nachricht in ein Array
        var timestampArray = timestamp.split(/[.T]/)
        //Gibt die Uhrzeit der Nachricht zurück
        return timestampArray[1]
    }

    //Diese Methode nimmt den timestamp der jeweiligen Nachricht aus dem Backend und gibt nur das Datum zurück
    getDateOfMessage(timestamp) {
        //Teilt den timestamp der Nachricht in ein Array
        var timestampArray = timestamp.split(/[.T]/)
        //Gibt das Datum der Nachricht zurück
        console.log(timestampArray[0])
        return timestampArray[0]
    }
}

//Erstellt eine Instanz der Klasse Account
const account = new Account("Manfred", "500");

account.login();
/* Im Folgenden kommen Funktionen die den Elementen Eventlistener hinzufügen*/

//Diese Funktion wird direkt aufgerufen. Fügt einen Onclick Eventlistener für den Login & Logout Button hinzu. 
(function () {
    //Erstellt eine Konstante und weist ihr den Button "login_button" zu
    const getLoginButton = document.getElementById("login_button")
    //Erstellt eine Konstante und weist ihr den Button "logout_button" zu
    const getLogoutButton = document.getElementById("logout_button")
    //Fügt einen EventListener hinzu der bei einem click die Instanzmethode login() ausführt
    getLoginButton.addEventListener("click", () => {
        //Die Methode login() wird aufgerufen, um den Benutzer einzuloggen
        account.login()
    })
    //Fügt einen EventListener hinzu der bei einem click die Instanzmethode logout() ausführt
    getLogoutButton.addEventListener("click", () => {
        //Die Methode logout() wird aufgerufen, um den Benutzer auszuloggen
        account.logout()
    })
})();

//Diese Funktion wird direkt aufgerufen. Fügt den Textfeldern Eventlistener zu, die bei einem Focusout die jeweiligen SetMethoden ausführen
(function () {
    //Erstellt eine Konstante und weist ihr das Textfeld "username_input" zu
    const getUsernameInput = document.getElementById("username_input")
    //Erstellt eine Konstante und weist ihr das Textfeld "room_input" zu
    const getRoomInput = document.getElementById("room_input")
    //Erstellt eine Konstante und weist ihr das Textfeld "text_input" zu
    const textInput = document.getElementById("text_input")

    //Fügt einen EventListener hinzu der bei einem focusout die Instanzmethode setUsername() ausführt
    getUsernameInput.addEventListener("focusout", (e) => {
        account.setUsername(e.target.value)
    })
    //Fügt einen EventListener hinzu der bei einem focusout die Instanzmethode setRoom() ausführt
    getRoomInput.addEventListener("focusout", (e) => {
        account.setRoom(e.target.value)
    })
    //Fügt einen EventListener hinzu der bei einem focusout die Instanzmethode setText() ausführt
    textInput.addEventListener("keyup", (e) => {
        account.setText(e.target.value)

    })
})();

//Diese Funktion wird direkt aufgerufen. Fügt einen Onclick Eventlistener zum SendButton für die Nachrichten hinzu
(function () {
    //Erstellt eine Konstante und weist ihr das Element "send_button" zu
    const getSendButton = document.getElementById("send_button")

    //Fügt einen EventListener hinzu der bei einem Klick auf den Button die Instanzmethode sendMessage() ausführt
    getSendButton.addEventListener("click", () => {
        account.sendMessage()
    })
})();

//Diese Funktion wird direkt aufgerufen. Fügt dem fenster ein Eventlistener zum hinzu das der button  Send Message gedrückt wird wenn die taste Enter gedrückt wird.
(function () {
    //Erstellt eine Konstante und weist ihr das Element "send_button" zu
    const getSendButton = document.getElementById("send_button")

    window.addEventListener("keydown", (e) => {
        if(account.text.length > 0 === true) {
            if(e.key === "Enter") {
                getSendButton.click()
            }
        }
    })
}())