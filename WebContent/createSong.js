/**
 * Create a new song in the data base
 */

/**
 * Function to avoid the global scope
 */
(function () {
    document.getElementById("createSongButton").addEventListener("click" , (e) => {
       console.log("Creating a new song");

       //Take the closest form
       let form = e.target.closest("form");

       //Reset the error
        pageOrchestrator.resetErrors();

        if(form.checkValidity()){
            //TODO check the input fields
            //Tale the fields of the form
            let title = document.getElementById("title").value;
            let genre = document.getElementById("genre").value;
            let albumTitle = document.getElementById("albumTitle").value;
            let singer = document.getElementById("singer").value;
            let publicationYear = document.getElementById("date").value;
            let imageFile = document.getElementById("imageFile");
            let songFile = document.getElementById("songFile");

            //Check if the publicationYear is valid
            if(isNaN(publicationYear)){
                document.getElementById("songError").textContent = "Publication year is not a number";
                return;
            }
            if(publicationYear > (new Date().getFullYear())){
                document.getElementById("songError").textContent = "Publication year not valid";
                return;
            }

            //Check if the genre is one of the type allowed
            if(!(genre === "Dance" || genre === "Pop" || genre ==="Rap" || genre === "Rock")){
                document.getElementById("songError").textContent = "Invalid genre";
                return;
            }

            //Check if some fields are too long
            if(title.length > 45 || albumTitle-length > 45 || singer.length > 45 || genre.length > 45){
                document.getElementById("songError").textContent = "Some values are too long";
                return;
            }

            //TODO Check the input files
            /*if(!(imageFile.length > 0)){
                document.getElementById("songError").textContent = "Image not valid";
                return;
            }
            if(!(songFile.length > 0)){
                document.getElementById("songError").textContent = "Song not valid";
                return;
            }
            if(imageFile.length > 1024000){
                document.getElementById("songError").textContent = "Image too big";
                return;
            }
            if(songFile.length > 10240000){
                document.getElementById("songError").textContent = "Song too big";
                return;
            }*/

            makeCall("POST" , "CreateSong" , form ,
                function (x) {
                    console.log("CallBack function called");

                    if(x.readyState = XMLHttpRequest.DONE){
                        switch(x.status){
                            case 200:
                                //TODO update the list of songs I can add in the playList selected
                                console.log("Song added correctly");
                                songsNotInPlayList.show(songsNotInPlayList.playlistId);
                                //Reset the form if the request was successful
                                form.reset();
                                break;

                            case 403:
                                sessionStorage.removeItem("userName");
                                window.location.href = "login.html";
                                break;

                            default:
                                document.getElementById("songError").textContent = x.responseText;
                                break;
                        }
                    }
                }
            );

        }else{
            form.reportValidity();
        }
    });
})();