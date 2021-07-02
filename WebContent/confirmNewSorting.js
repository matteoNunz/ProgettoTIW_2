/**
 * Confirm the new sorting of the playList sending it to the server
 */

(function() {
    document.getElementById("confirmSortingButton").addEventListener("click" , (e) => {

        let rows = Array.from(document.getElementById("sortPlayListTable").querySelectorAll('tbody > tr'));
        //Fill sortingToSend with the id of the songs
        let sortingToSend = new Array();

        for(let i = 0 ; i < rows.length ; i++){
            //Add just the id of the song
            sortingToSend.push(rows[i].getAttribute("songId"));
        }

        //TODO add a control in case of length 0 or 1

        makeCall("POST" , "AddSorting?playlistId=" + playListSongsToOrder.playlistId , null ,
            function(request) {

                if(request.readyState == XMLHttpRequest.DONE){

                    //Reset the errors
                    pageOrchestrator.resetErrors();

                    switch(request.status){
                        case 200:
                            //Come back to the home page
                            songsInPlayList.show(songsInPlayList.playlistId);
                            pageOrchestrator.showMainPage();
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