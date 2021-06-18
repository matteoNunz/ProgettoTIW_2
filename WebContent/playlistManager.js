{
    //Page components
    var playlistList;
    var songsInPLayList;
    var songsNotInPlayList;
    var songDetails;
    var sortingList;
    var playListSongsToOrder = new PlayListSongsToOrder();
    let personalMessage;
    let playListMessage;
    let pageOrchestrator = new PageOrchestrator();

    /**
     * It contains all the song titles and ids of the current playlist needed for the sorting
     * @constructor
     */
    function PlayListSongsToOrder(){
        /**
         * It's the id of the playlist
         */
        this.playlistId = null;
        /**
         * It's an array that contains song element. This attribute will be used to fill the table for the reorder
         */
        this.songs = new Array();

        /**
         * Function used to reset the attribute songs
         */
        this.reset = function() {
            this.songs = [];
        }

        /**
         * FUnction that add a song to the attribute
         * @param song is the song to add
         */
        this.addSong = function(song) {
        	console.log("Adding a song to playListSongsToOrder");
            this.songs.push(song);
        }
    }

    /**
     * Function that represent a song to be sorted
     */
    function Song(id , title){
        this.id = id;
        this.title = title;
    }

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
    function PlaylistMessage(messageContainer){
        this.playlistName = null;
        this.messageContainer = messageContainer;

        this.show = function() {
            this.messageContainer.textContent = this.playlistName;
            this.messageContainer.style.visibility = "visible";
        }

        this.setPlayListName = function(playlistName) {
            this.playlistName = playlistName;
            this.show();
        }

        this.reset = function() {
            this.messageContainer.style.visibility = "hidden";
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
            this.alertContainer.textContent = "";
        }

        this.show = function(next) {
            let self = this;

            //Ask the playList table to the server
            makeCall("GET" , "GetPlaylistList" , null ,
                function(request) {
                	self.alertContainer.textContent = "";
                    if(request.readyState == XMLHttpRequest.DONE){
                        switch(request.status){
                            case 200:
                                let playlistsToShow = JSON.parse(request.responseText);
                                if(playlistsToShow.length == 0){
                                    self.alertContainer.textContent = "No playlist yet";
                                    return;
                                }
                                self.alertContainer.textContent = "";
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
                            	alert("Default");
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

            playlists.forEach( function(playlist) {
                //Create the row
                row = document.createElement("tr");

                //Create the playlist title cell
                playListNameCell = document.createElement("td");
                playListNameCell.textContent = playlist.title;
                row.appendChild(playListNameCell);

                //Create the creation date cell
                creationDateCell = document.createElement("td");
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
                    //Reset the playListSongsToOrder
                    playListSongsToOrder.reset();
                    //Show songs in the playList selected
                    songsInPLayList.show(e.target.getAttribute("playlistId"));
                    //Show songs not in the playList selected
                    songsNotInPlayList.show(e.target.getAttribute("playlistId"));
                    //Show the title
                    //TODO to verify
                    let targetRow = e.target.closest("tr");//Row of the event
                    //let targetTitles = targetRow.selectAllChildren("td");//Take all the td in this row
                    //let targetTitles = targetRow.childNodes;
                    let targetTitles = targetRow.getElementsByTagName("td")
                    let targetTitle = targetTitles[0];//Tale the first td -> the title
                    playListMessage.setPlayListName(targetTitle);
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
            this.alertContainer.textContent = "";
        }

        this.show = function(playlistId) {
            this.playlistId = playlistId;
            let self = this;

            makeCall("GET" , "GetSongsInPlaylist?playlistId=" + playlistId , null ,
                function(request) {
                    if(request.readyState == XMLHttpRequest.DONE){
                    	self.alertContainer.textContent = "";
                        switch(request.status){
                            case 200:
                                let songs = JSON.parse(request.responseText);
        
                                if(songs.length == 0){
                                    self.alertContainer.textContent = "No songs yet";
                                    return;
                                }
                                self.update(songs , 0);

                                //Launch the autoClick to select a song to show
                                self.autoClick();
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

            //Set the playlistId
            playListSongsToOrder.playlistId = this.playlistId;
            //Save song titles and ids
            songs.forEach( function(songToOrder) {
                //Create a new song object
                let song = new Song(songToOrder.songId , songToOrder.songTitle);
                //Add it to playListSongsToOrder
                playListSongsToOrder.addSong(song);
            })
            
                        
            //TODO now here, in future there will be a button to do that
            sortingList.show();
            //console.log("CALLED THE SHOW METHOD OF SORTING_LIST");
            //console.log("Number of songs in the playListToOrder is: " + playListSongsToOrder.songs.length);

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
            	//console.log("Case (songs.length >= section * 5 + 5)");
            	songsToShow = songs.slice(section * 5, section * 5 + 5); // [)
            }   
               
            else{
            	//console.log("Case !(songs.length >= section * 5 + 5)");
            	//console.log("Section is " + section);
            	//console.log("Songs length is " + songs.length);
            	//console.log(songs.slice(section * 5, songs.length));
            	songsToShow = songs.slice(section * 5, songs.length); // [)
            }
                
                
            console.log("SongsToShow has " + songsToShow.length + " elements");

            //Create the main row of the external table

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

                //image.src = songToShow.fileName;

                
                //console.log("Calling GetImage/" + songToShow.fileName);
                
                makeCall("GET" , "GetImage/" + songToShow.fileName , null ,
                    function(x) {
                        if(x.readyState == XMLHttpRequest.DONE){
                            //Convert the array buffer in bytes
                            let bytes = new Uint8Array(x.response);
                            //alert(bytes);

                            //Convert the numeric byte array to a string
                            let string = String.fromCharCode.apply(null , bytes);
                            //alert(string);

                            //Convert the string to a base64 string
                            let base64 = btoa(string);
                            //alert(base64);

                            //TODO it can be jpeg too -> if it works return the base64 directly from the servlet
                            //Add the header to the base64 string
                            let dataUrl = "data:image/jpeg;base64," + base64;
                            //alert(dataUrl);

                            image.src = dataUrl;
                            //image.src = x.response;
                        }
                    } , null , true
                );

                anchor = document.createElement("a");
                songNameCell.appendChild(anchor);
                linkText = document.createTextNode(songToShow.songTitle);
                anchor.appendChild(linkText);
                anchor.setAttribute("songId" , songToShow.songId);
                anchor.href = "#";
                anchor.addEventListener("click" , (e) => {
                   songDetails.show(e.target.getAttribute("songId") , songsInPLayList.playlistId);
                });

                row.appendChild(internalTableCell);
            });
            this.listBodyContainer.appendChild(row);
            this.listContainer.style.visibility = "visible";
        }

        this.autoClick = function(songId) {
            let e = new Event("click");
            let selector = "a[songId=" + songId + "']";
            //Take the first element or the specified playlist

            let anchorToClick = (songId) ?
                document.querySelector(selector) :
                this.listBodyContainer.querySelectorAll("a")[0];

            console.log("AutoClick select song with id: " + anchorToClick.getAttribute("songId"));

            if(anchorToClick){
                anchorToClick.dispatchEvent(e);
            }else{
                //Show nothing if the playList has no song
                songDetails.reset();
            }
        }
    }

    /**
     * Function that shows songs not in the playList specified by playlistId
     * @param alertContainer is the container where set the error
     * @param listContainer is the container of the form
     * @param select is the select inside the form to be fulled
     */
    function SongsNotInPlaylist(alertContainer , listContainer , select){
        this.alertContainer = alertContainer;
        this.listContainer = listContainer;
        this.select = select;
        this.playlistId = null;

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
            this.alertContainer.textContent = "";
        }

        this.show = function(playlistId) {
            this.playlistId = playlistId;
            let self = this;

            makeCall("GET" , "GetSongsNotInPlaylist?playlistId=" + playlistId , null ,
                function(request) {
                    if(request.readyState == XMLHttpRequest.DONE){
                        self.alertContainer.textContent = "";
                        switch(request.status){
                            case 200:
                                let songs = JSON.parse(request.responseText);

                                if(songs.length == 0){
                                    self.alertContainer.textContent = "All songs already in this playlist";
                                    return;
                                }
                                self.update(songs);
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

        this.update = function(songsToShow) {

            let option;

            this.select.innerHTML = "";
            
            let self = this;

            //Add an option for each song
            songsToShow.forEach(function(songToShow) {
                option = document.createElement("option");
                option.setAttribute("value" , songToShow.id);
                option.appendChild(document.createTextNode(songToShow.songTitle));
                self.select.appendChild(option);
            });
            this.listContainer.style.visibility = "visible";
        }
    }

    /**
     * Function that shows the details of a selected song
     * @param alertContainer is the container of the error
     * @param listContainer is the container of the table
     * @param listBodyContainer is the body of the table where put the details
     */
    function SongDetails(alertContainer , listContainer , listBodyContainer){
        this.alertContainer = alertContainer;
        this.listContainer = listContainer;
        this.listBodyContainer = listBodyContainer;
        this.songId = null;
        this.playlistId = null;

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
        }

        this.show = function(songId , playlistId) {
            this.songId = songId;
            this.playlistId = playlistId;

            let self = this;

            makeCall("GET" , "GetSongDetails?songId=" + this.songId + "&playlistId=" + this.playlistId , null ,
                function(request) {
                    if(request.readyState == XMLHttpRequest.DONE){
                        switch(request.status){
                            case 200:
                                let songDetails = JSON.parse(request.responseText);
                                self.update(songDetails);
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

        this.update = function(songDetails) {
            let row , titleCell , singerCell , albumTitleCell , publicationYearCell , genreCell , playCell;

            this.listBodyContainer.innerHTML = "";

            row = document.createElement("tr");

            //TODO do it as follow -> but it's not good for the audio control tag
            /*
            let row , cell;
            songDetails.forEach(function(item){
                cell = document.createElement("td");
                cell.appendChild(document.createTextNode(item));
                row.appendChild(cell);
            });
             */

            titleCell = document.createElement("td");
            titleCell.appendChild(document.createTextNode(songDetails.songTitle));
            row.appendChild(titleCell);

            singerCell = document.createElement("td");
            singerCell.appendChild(document.createTextNode(songDetails.singer));
            row.appendChild(singerCell);

            albumTitleCell = document.createElement("td");
            albumTitleCell.appendChild(document.createTextNode(songDetails.albumTitle));
            row.appendChild(albumTitleCell);

            publicationYearCell = document.createElement("td");
            publicationYearCell.appendChild(document.createTextNode(songDetails.publicationYear));
            row.appendChild(publicationYearCell);

            genreCell = document.createElement("td");
            genreCell.appendChild(document.createTextNode(songDetails.kindOf));
            row.appendChild(genreCell);

            playCell = document.createElement("audio");
            playCell.setAttribute("type" , "audio/mpeg");
            row.appendChild(playCell);

            makeCall("GET" , "GetSong/" + songDetails.songFile , null ,
                function(x) {
                    //console.log("CallBack function for images called");
                    if(x.readyState == XMLHttpRequest.DONE){
                        //console.log("Setting the audio in src");

                        //Convert the array buffer in bytes
                        let bytes = new Uint8Array(x.response);
                        //alert(bytes);

                        //Convert the numeric byte array to a string
                        let string = String.fromCharCode.apply(null , bytes);
                        //alert(string);

                        //Convert the string to a base64 string
                        let base64 = btoa(string);
                        //alert(base64);

                        //Add the header to the base64 string
                        let dataUrl = "data:audio/mpeg;base64," + base64;
                        //alert(dataUrl);

                        playCell.src = dataUrl;
                    }
                } , null , true
            );

            this.listBodyContainer.appendChild(row);
            this.listContainer.style.visibility = "visible";
        }
    }

    function SortingList(alertContainer , listContainer , listBodyContainer){
        this.alertContainer = alertContainer;
        this.listContainer = listContainer;
        this.listBodyContainer = listBodyContainer;
        this.playlistId = null;

        this.setPlaylistId = function(playlistId) {
            this.playlistId = playlistId;
        }

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
            alertContainer.textContent = "";
        }

        //Take the song from playListSongsToOrder and fill the table
        this.show = function() {
            //Define the components of the table
            let row , dataCell , nameCell;
            //Save this for the closure
            let self = this;
            
            //Empty the table
            this.listBodyContainer.innerHTML = "";

			console.log("The number of songs in playListToOrder is " + playListSongsToOrder.songs.length);

            //playListSongsToOrder.songs.forEach( function(song) {
            
            for(let i = 0 ; i < playListSongsToOrder.songs.length ; i++){
            
            	console.log("Entered in the for: iteration number " + i);
            
            	let song = playListSongsToOrder.songs[i];

                row = document.createElement("tr");
                row.className = "draggable";
                row.setAttribute("songId" , song.id);

                dataCell = document.createElement("td");
                nameCell = document.createTextNode(song.title);
                dataCell.appendChild(nameCell);
                row.appendChild(dataCell);
                
                self.listBodyContainer.appendChild(row);
                
                console.log("Appended element with id " + song.id + " and title " + song.title);

            }
            console.log("After the for");
            this.listContainer.style.visibility = "visible";
            //call the other file
            //Add listeners to the new row
            handleSorting.addEventListeners();
        }
    }

    /**
     * It's the main controller of the application
     */
    function PageOrchestrator() {
        //Maybe i'll use just 1 error, not 1 for each component
        let playlistTableError = document.getElementById("playlistTableError");
        let songInPlaylistError = document.getElementById("songTableError");

        this.start = function() {
            //Set the personal message and show it. Question: why I don't have to save the container in the object as for the userName?
            personalMessage = new PersonalMessage(sessionStorage.getItem("userName") , document.getElementById("userName"));
            personalMessage.show();

            playListMessage = new PlaylistMessage(document.getElementById("playlistNameMessage"));

            //Initialize the playlist table
            playlistList = new PlaylistList(playlistTableError , document.getElementById("playlistTable") ,
                                            document.getElementById("playlistTableBody"));

            //Initialize the songs in the playList
            songsInPLayList = new SongsInPlaylist(songInPlaylistError , document.getElementById("songTable") ,
                                            document.getElementById("songTableBody"));

            //Initialize songs not in the playlist
            songsNotInPlayList = new SongsNotInPlaylist(document.getElementById("addSongMessage") ,
                document.getElementById("addSongToPlaylistDiv") , document.getElementById("addSongToPlayList"));

            //Initialize the songDetails
            songDetails = new SongDetails(document.getElementById("songDetailsMessage") ,
                                        document.getElementById("songPage") , document.getElementById("songDetailsTableBody"));

            //Initialize the sortingList
            sortingList = new SortingList(document.getElementById("sortingError") ,
                                        document.getElementById("sortPlayListTable") , document.getElementById("sortPLayListBody"));
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
            document.getElementById("addSongMessage").textContent = "";
            document.getElementById("songDetailsMessage").textContent = "";

            //Show the playlists and show the song of a playlist(the first one or the one specified by the id)
            //That implies the invocation of songsNotInPlaylist.show(playlistId)
            playlistList.show( function() {
                playlistList.autoClick(playlistId);
            });

            //Reset the playlistList
            //playlistList.reset();
        }
    }
}