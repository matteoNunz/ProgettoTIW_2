/**
 * Registration
 */

/**
 * Function to avoid the global scope
 */
(function () {
    document.getElementById("registrationButton").addEventListener('click' , (e) => {

        console.log("Registration event!");
        //Take the closest form
        let form = e.target.closest("form");

        //Check the form validity
        if(form.checkValidity()){

            //Make the call to  the server
            makeCall("POST" , 'Registration' , e.target.closest("form") ,
                function (x) {
                    console.log("CallBack function called");

                    if(x.readyState == XMLHttpRequest.DONE){
                        switch(x.status){
                            //If ok -> redirect to login page
                            case 200:
                                window.location.href("login.html");
                                break;
                            //If ko -> show the error
                            default:
                                document.getElementById("error").textContent = x.responseText;
                        }
                    }
                }
            );
        }else{
            form.reportValidity();
        }
    });
})();