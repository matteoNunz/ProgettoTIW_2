/**
 * Create a new playList
 */
(function() {
    document.getElementById("createPlaylistButton").addEventListener("click" , (e) => {

        console.log("Creating a new playList!");

        //Take the closest form
        let form = e.target.closest("form");

        if(form.checkValidity()){
        	 //Check if the title specified is valid
        	 let title = document.getElementById("name").value;
        	 let tableBody = document.getElementById("playlistTableBody");
        	 //Take the rows of the tables
        	 let targetTitles = tableBody.getElementsByTagName("tr");
        	 let targetTitle;
        	 
        	 for(let i = 0 ; i < targetTitles.length ; i++){
        	 	targetTitle = targetTitles[i].getElementsByTagName("a")[0].innerHTML;
        	 	if(title == targetTitle){
        	 		document.getElementById("createPlaylistError").textContent = "PlayList name already used - client";
        	 		return;
        	 	}
        	 }
        
            //Make the call to the server
            makeCall("POST" , "CreatePlaylist" , form ,
                function (x) {

                    if(x.readyState == XMLHttpRequest.DONE){
                    pageOrchestrator.resetErrors();
                    
                        switch (x.status){
                            case 200:
                                //Update the playList list
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