/**
 * Confirm the new sorting og the playList sending it to the server
 */

(function() {
    document.getElementById("confirmSortingButton").addEventListener("click" , (e) => {

        console.log("Sending the new sorting to the server to memorize it");
        let rows = Array.from(document.getElementById("sortPlayListTable").querySelectorAll('tbody > tr'));
        //Fill sortingToSend with the id of the songs
        let sortingToSend = new Array();

        for(let i = 0 ; i < rows.length ; i++){
            //Add just the id of the song
            //sortingToSend.add(rows[i].getAttribute("songId"));
            sortingToSend.push(rows[i].getAttribute("songId"));
        }
        
        console.log("The new sorting is: " + sortingToSend.toString());

        //TODO add a control in case of length 0 or 1

        makeCall("POST" , "AddSorting?playlistId=" + playListSongsToOrder.playlistId , null ,
            function(request) {
                console.log("CallBack function called");

                if(request.readyState == XMLHttpRequest.DONE){

                    //Reset the error
                    document.getElementById("sortingError").textContent = "";

                    switch(request.status){
                        case 200:
                            //Come back to the home page
                            //TODO add a method in the pageOrchestrator
                            break;

                        case 403:
                            sessionStorage.removeItem("userName");
                            window.location.href = "login.html";
                            break;

                        default:
                            document.getElementById("sortingError").textContent = request.responseText;
                            break;
                    }
                }
            } , sortingToSend
        );
    });
})();