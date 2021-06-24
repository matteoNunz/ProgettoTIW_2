/**
 * Create a new playList
 */

/**
 * Function to avoid the global scope
 */
(function() {
    document.getElementById("createPlaylistButton").addEventListener("click" , (e) => {

        console.log("Creating a new playList!");

        //Take the closest form
        let form = e.target.closest("form");

        if(form.checkValidity()){
            //Make the call to the server
            makeCall("POST" , "CreatePlaylist" , form ,
                function (x) {
                    console.log("CallBack function called");

                    if(x.readyState == XMLHttpRequest.DONE){
                    pageOrchestrator.resetErrors();
                    
                        switch (x.status){
                            case 200:
                                //Update the playList list -> maybe use directly the pageOrchestrator
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