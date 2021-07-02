/**
 * Add a song in a playList
 */
(function(){
    document.getElementById("addSongButton").addEventListener("click" , (e) => {

        //Take the closest form
        let form = e.target.closest("form");

        //Reset the error
        document.getElementById("addSongMessage").textContent = "";

        if(form.checkValidity()){
            makeCall("POST" , "AddSong?playlistId=" + songsNotInPlayList.playlistId , form ,
                function(request) {

                    if(request.readyState == XMLHttpRequest.DONE){
                    	pageOrchestrator.resetErrors();
                    	
                        switch(request.status){
                            case 200:
                                //Update the view
                                songsInPlayList.show(songsNotInPlayList.playlistId);
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
        }else{
            form.reportValidity();
        }
    });
})();