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
        
        let self = this;

        this.reset = function() {
            this.listcontainer.style.visibility = "hidden";
        }

        this.show = function(next) {
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
                                //Simulate a click with autoClick function
                                if(next){
                                    next();
                                }
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
                console.log("Initializing row with playlistId " + playlist.id);
                anchor.addEventListener("click" , (e) => {
                    songsInPLayList.show(anchor.getAttribute("playlistId"));
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
            let selector = "a[playlistId=" + playlistId + "']";
            //Take the first element or the specified playlist
            let anchorToClick = (playlistId) ?
                document.querySelector(selector) :
                self.listBodyContainer.querySelectorAll("a")[0];           
   
            console.log("AutoClick select playlist with id: " + anchorToClick.getAttribute("playlistId"));

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
    function SongsInPlaylist(alertContainer , listContainer , listBodyContainer){
        this.alertContainer = alertContainer;
        this.listContainer = listContainer;
        this.listBodyContainer = listBodyContainer;
        this.playlistId = null;

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
        }

        this.show = function(playlistId) {
            this.playlistId = playlistId;
            let self = this;

            makeCall("GET" , "GoToPlayListPage?playlistId=" + playlistId , null ,
                function(request) {
                    if(request.readyState == XMLHttpRequest.DONE){
                        switch(request.status){
                            case 200:
                                let songs = JSON.parse(request.responseText);
        
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
            
            console.log("Number of songs in the playList is: " + songs.length);

            let next = false;

            //Check section and set next
            if (section < 0 || !section) {
                section = 0;
            }
            if (section * 5 + 5 > songs.length) {
                section = (songs.length / 5);
                //Save just the number before the point
                section = parseInt(section.toString().split(".")[0]);
            }
            if ((section * 5 + 5) < songs.length) {
                next = true;
            }

            let songsToShow;

            if (songs.length >= section * 5 + 5){
            	console.log("Case (songs.length >= section * 5 + 5)");
            	songsToShow = songs.slice(section * 5, section * 5 + 5); // [)
            }   
               
            else{
            	console.log("Case !(songs.length >= section * 5 + 5)");
            	console.log("Section is " + section);
            	console.log("Songs length is " + songs.length);
            	console.log(songs.slice(section * 5, songs.length));
            	songsToShow = songs.slice(section * 5, songs.length); // [)
            }
                
                
            console.log("SongsToShow has " + songsToShow.length + " elements");

            //Create the main row of the external table
            
            console.log("Creating the song table");
            
            row = document.createElement("tr");

            songsToShow.forEach( function (songToShow){
            	console.log("Creating a cell of the song table");
                internalTableCell = document.createElement("td");
                internalTable = document.createElement("table");

                internalTableCell.appendChild(internalTable);

                //Row for the image
                imageRow = document.createElement("tr");
                //Row for the song title
                songNameRow = document.createElement("tr");
                
                internalTable.appendChild(imageRow);
                internalTable.appendChild(songNameRow);

                imageCell = document.createElement("td");
                songNameCell = document.createElement("td");

                imageRow.appendChild(imageCell);
                songNameRow.appendChild(songNameCell);

                image = document.createElement("img");
                imageCell.appendChild(image);
                //TODO how add the image?? With an attribute?

                let src = image.src;
                
                console.log("Calling GetImage/" + songToShow.fileName);
                
                makeCall("GET" , "GetImage/" + songToShow.fileName , null ,
                    function(x) {
                    	console.log("CallBack function for images called");
                        if(x.readyState == XMLHttpRequest.DONE){
                        	console.log("Setting the image in src");
                        	console.log("Response 1: " + x);
                        	//console.log("Response 2: " + x.response);
                        	console.log("Response 3: " + x.responseText);
                            image.src = x.response;
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
                                            document.getElementById("songTableBody"));

        	//Just for verify
        	//playlistList.show();
        	//songInPLayList.show();

            //Set the event of logout to the anchor
            document.querySelector("a[href='Logout']").addEventListener('click', () => {
                window.sessionStorage.removeItem('username');
            });
        }

        this.refresh = function(playlistId) {
            //Reset the errors
            playlistTableError.textContent = "";
            songInPlaylistError.textContent = "";

            //Show the playlists and show the song of a playlist(the first one or the one specified by the id)
            playlistList.show( function() {
                playlistList.autoClick(playlistId);
            });



            //Reset the playlistList
            //playlistList.reset();
        }
    }
}