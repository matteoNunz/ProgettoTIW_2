{
    //Page components
    var playlistList;
    let pageOrchestrator = new PageOrchestrator();

    window.addEventListener("load" , () => {
        if(sessionStorage.getItem("userName") == null){
            window.location.href = "login.html";
        }else{
            pageOrchestrator.start();
            pageOrchestrator.refresh();
        }
    } , false);

    /**
     * Function that initialize the personal message (the username)
     * @param username is the username to add in the html file
     * @param messageContainer is the place where add the username
     */
    function PersonalMessage(username , messageContainer) {
        this.username = username;
        this.messageContainer = messageContainer;

        this.show = function() {
            this.messageContainer.textContent = this.username;
        }
    }

    /**
     * Function that take the playlist og the user from the data base
     * @param alertContainer is the container of the error
     * @param listContainer is the table that contains the list
     * @param listBodyContainer is the body of the table
     * @constructor
     */
    function PlaylistList(alertContainer , listContainer , listBodyContainer) {
        this.alertContainer = alertContainer;
        this.listcontainer = listContainer;
        this.listBodyContainer = listBodyContainer;

        this.reset = function() {
            this.listcontainer.style.visibility = "hidden";
        }

        this.show = function() {
            let self = this;

            //Ask the playList table to the server
            makeCall("GET" , "GetPlaylistList" , null ,
                function(request) {
                    if(request.readyState == XMLHttpRequest.DONE){
                        switch(request.status){
                            case 200:
                                let playlistsToShow = JSON.parse(request.responseText);
                                if(playlistsToShow.length == 0){
                                    self.alertContainer.textContent = "No playlist yet";
                                    return;
                                }
                                self.update(playlistsToShow);
                                break;

                            case 403:
                                //Redirect to login.html and remove the username from the session
                                window.location.href = request.getResponseHeader("Location");
                                window.sessionStorage.removeItem("userName");
                                break;

                            default:
                                self.alertContainer.textContent = request.responseText;
                        }
                    }
                }
            );
        }

        this.update = function(playlists) {
            //Elements of the table for each row
            let row , playListNameCell , creationDateCell , anchor , linkCell , linkText;
            //Save this to make it visible in the function
            let self = this;

            //Empty the table body
            this.listBodyContainer.innerHTML = "";

            playlists.forEach(  function(playlist){
                //Create the row
                row = document.createElement("tr");

                //Create the playlist title cell
                playListNameCell = document.createElement("td");
                playListNameCell.textContent = playlist.title;
                row.appendChild(playListNameCell);

                //Create the creation date cell
                creationDateCell = document.createElement("td");
                //TODO verify the follow
                creationDateCell.textContent = playlist.creationDate;
                //creationDateCell.appendData(playlist.creationDate);
                row.appendChild(creationDateCell);

                //Create the link to the details
                linkCell = document.createElement("td");
                anchor = document.createElement("a");
                linkCell.appendChild(anchor);
                linkText = document.createTextNode("Open");
                anchor.appendChild(linkText);
                anchor.setAttribute("playlistId" , playlist.id);
                anchor.addEventListener("click" , (e) => {
                    //TODO
                    //playlistDetails.show(e.target.getAttribute("playlistId"));
                });
                //Disable the href of the anchor
                anchor.href = "#";
                row.appendChild(linkCell);

                self.listBodyContainer.appendChild(row);
            });
            //Show the table
            this.listcontainer.style.visibility = "visible";
        }
    }

    /**
     * It's the main controller of the application
     * @constructor
     */
    function PageOrchestrator() {
        //Maybe i'll use just 1 error, not 1 for each component
        let alertContainer = document.getElementById("playlistTableError");

        this.start = function() {
            //Set the personal message and show it. Question: why I don't have to save the container in the object as for the userName?
            personalMessage = new PersonalMessage(sessionStorage.getItem("userName") , document.getElementById("userName"));
            personalMessage.show();

            //Initialize the playlist table
            playlistList = new PlaylistList(alertContainer , document.getElementById("playlistTable") ,
                                            document.getElementById("playlistTableBody"));
        	//Just for verify
        	playlistList.show();

            //Set the event of logout to the anchor
            document.querySelector("a[href='Logout']").addEventListener('click', () => {
                window.sessionStorage.removeItem('username');
            });
        }

        this.refresh = function() {
            //Reset the error
            alertContainer.textContent = "";

            //Reset the playlistList
            //playlistList.reset();
        }
    }
}