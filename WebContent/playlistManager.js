{
    //Page components
    var playlistList;
    var songsInPLayList;
    let personalMessage;
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
     * FUnction that show the name of the current playlist the user is watching
     * @param playlistName is the name of the playlist
     * @param messageContainer id the tag where put the name of the playlist
     */
    function PlaylistMessage(playlistName , messageContainer){
        this.playlistName = playlistName;
        this.messageContainer = messageContainer;

        this.show = function() {
            this.messageContainer.textContent = this.playlistName;
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
                    songsInPLayList.setPlaylistId(anchor.getAttribute("playlistId"));
                    songsInPLayList.show();
                });
                //Disable the href of the anchor
                anchor.href = "#";
                row.appendChild(linkCell);

                self.listBodyContainer.appendChild(row);
            });
            //Show the table
            this.listcontainer.style.visibility = "visible";
        }

        this.autoClick = function(playlistId) {
            let e = new Event("click");
            let selector = document.querySelector("a[playlistId= " + playlistId + "']");
            //Take the first element or the specified playlist
            let anchorToClick = (playlistId) ?
                document.querySelector("a[playlistId= " + playlistId + "']") :
                this.listBodyContainer.querySelectorAll("a")[0];

            if(anchorToClick){
                anchorToClick.dispatchEvent(e);
            }
        }
    }

    /**
     * Function that takes all the songs in the playlist specified by playlistId
     * @param alertContainer is the container where set the error
     * @param listContainer is the container of the table
     * @param listBodyContainer is the body of the table
     * @param playlistId is the playlist the user wants to see the songs
     */
    function SongsInPlaylist(alertContainer , listContainer , listBodyContainer , playlistId){
        this.alertContainer = alertContainer;
        this.listContainer = listContainer;
        this.listBodyContainer = listBodyContainer;
        this.playlistId = playlistId;

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
        }

        this.show = function() {
            let self = this;

            makeCall("GET" , "GoToPlayListPage?playlistId=" + playlistId , null ,
                function(request) {
                    if(request.readyState == XMLHttpRequest.DONE){
                        switch(request.status){
                            case 200:
                                let songs = JSON.parse(request.responseText);
                                console.log("Number of songs in the playList is: " + songs.length);
                                if(songs.length == 0){
                                    self.alertContainer.textContent = "No songs yet";
                                    return;
                                }
                                self.update(songs , 0);
                                break;

                            case 403:
                                //Redirect to login.html and remove the username from the session
                                window.location.href = request.getResponseHeader("Location");
                                window.sessionStorage.removeItem("userName");
                                break;

                            default:
                                self.alertContainer.textContent = request.responseText;
                                break;
                        }
                    }
                }
            );
        }

        this.update = function(songs , section) {
            //Elements of the table
            let row, internalTableCell , imageRow , imageCell, songNameRow , songNameCell, internalTable , anchor, linkText , image;
            //Save this to make it visible in the function
            let self = this;
            //Empty the body of the table
            this.listBodyContainer.innerHTML = "";

            let next = false;

            //Check section and set next
            if (section < 0) {
                section = 0;
            }
            if (section * 5 + 5 > songs.size()) {
                section = (songs.size() / 5);
            }
            if ((section * 5 + 5) < songs.size()) {
                next = true;
            }

            let songsToShow;

            if (songs.size() >= section * 5 + 5)
                songsToShow = songs.slice(section * 5, section * 5 + 5); // [)
            else
                songsToShow = songs.slice(section * 5, songs.size()); // [)

            //Create the main row of the external table
            row = document.createElement("tr");

            songsToShow.forEach( function (songToShow){
                internalTableCell = document.createElement("td");
                internalTable = document.createElement("table");

                internalTableCell.appendChild(internalTable);

                //Row for the image
                imageRow = document.createElement("tr");
                //Row for the song title
                songNameRow = document.createElement("tr");

                imageCell = document.createElement("td");
                songNameCell = document.createElement("td");

                imageRow.appendChild(imageCell);
                songNameRow.appendChild(songNameCell);

                image = document.createElement("src");
                imageCell.appendChild(image);
                //TODO how add the image?? With an attribute?

                let src = image.src;
                makeCall("GET" , "GetImage?" + song.fileName , null ,
                    function(x) {
                        if(x.readyState == XMLHttpRequest.DONE){
                            src = x.response;
                        }
                    }
                );

                anchor = document.createElement("a");
                songNameCell.appendChild(anchor);
                linkText = document.createTextNode(songToShow.songTitle);
                anchor.appendChild(linkText);
                anchor.setAttribute("songId" , songToShow.songId);
                anchor.href = "#";
                anchor.addEventListener("click" , (e) => {
                   //TODO
                   //songDetails.show(e.target.getAttribute("songId"));
                });

                row.appendChild(internalTableCell);
            });
            self.listBodyContainer.appendChild(row);
        }

        this.setPlaylistId = function(newId) {
            this.playlistId = newId;
        }
    }

    /**
     * It's the main controller of the application
     * @constructor
     */
    function PageOrchestrator() {
        //Maybe i'll use just 1 error, not 1 for each component
        let playlistTableError = document.getElementById("playlistTableError");
        let songInPlaylistError = document.getElementById("songTableError");

        this.start = function() {
            //Set the personal message and show it. Question: why I don't have to save the container in the object as for the userName?
            personalMessage = new PersonalMessage(sessionStorage.getItem("userName") , document.getElementById("userName"));
            personalMessage.show();

            //Initialize the playlist table
            playlistList = new PlaylistList(playlistTableError , document.getElementById("playlistTable") ,
                                            document.getElementById("playlistTableBody"));

            //Initialize the song in the playlist
            songsInPLayList = new SongsInPlaylist(songInPlaylistError , document.getElementById("songTable") ,
                                            document.getElementById("songTableBody") , 19);//19 just for test

        	//Just for verify
        	playlistList.show();
        	//songInPLayList.show();
            playlistList.autoClick();a

            //Set the event of logout to the anchor
            document.querySelector("a[href='Logout']").addEventListener('click', () => {
                window.sessionStorage.removeItem('username');
            });
        }

        this.refresh = function() {
            //Reset the errors
            playlistTableError.textContent = "";
            songInPlaylistError.textContent = "";

            //Reset the playlistList
            //playlistList.reset();
        }
    }
}