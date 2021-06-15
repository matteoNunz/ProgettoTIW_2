/**
 * Add a song in a playList
 */

/**
 * Function to avoid the global scope
 */

(function(){
    document.getElementById("addSongButton").addEventListener("click" , (e) => {

        console.log("Adding a song to the playlist");

        //Take the closest form
        let form = e.target.closest("form");

        //Reset the error
        document.getElementById("addSongMessage").textContent = "";

        if(form.checkValidity()){
            makeCall("POST" , "AddSong?playlistId=" + songsNotInPlayList.playlistId , form ,
                function(request) {
                    console.log("CallBack function called");

                    if(request.readyState == XMLHttpRequest.DONE){
                        switch(request.status){
                            case 200:
                                //Update the view
                                songsInPLayList.show(songsNotInPlayList.playlistId);
                                songsNotInPlayList.show(songsNotInPlayList.playlistId);
                                break;

                            case 403:
                                sessionStorage.removeItem("userName");
                                window.location.href = "login.html";
                                break;

                            default:
                                document.getElementById("addSongMessage").textContent = request.responseText;
                                break;
                        }
                    }
                }
            );
            //I'm not sure it's necessary with a select form
            //form.reset();
        }else{
            form.reportValidity();
        }
    });
})();