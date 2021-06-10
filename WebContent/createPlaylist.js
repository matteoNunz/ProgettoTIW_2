/**
 * Create a new playlist
 */

/**
 * Function to avoid the global scope
 */
(function() {
    document.getElementById("createPlaylistButton").addEventListener("click" , (e) => {

        console.log("Creating a new playlist!");

        //Take the closest form
        let form = e.target.closest("form");
        //Reset the error
        document.getElementById("createPlaylistError").textContent = null;

        if(form.checkValidity()){
            //Make the call to the server
            makeCall("POST" , "CreatePlaylist" , form ,
                function (x) {
                    console.log("CallBack function called");
                    //TODO reset in form
                    if(x.readyState == XMLHttpRequest.DONE){
                        switch (x.status){
                            case 200:
                                //Update the playlist list -> maybe use directly the pageOrchestrator
                                playlistList.show();
                                break;

                            case 403:
                                sessionStorage.removeItem("userName");
                                window.location.href = "login.html";
                                break;

                            default:
                                document.getElementById("createPlaylistError").textContent = x.responseText;
                                break;
                        }
                    }
                }
            );
            form.reset();
        }else{
            form.reportValidity();
        }
    });
})();