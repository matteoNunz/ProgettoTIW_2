/**
 * Login
 */

/**
 * Function to avoid the global scope
 */
(function() {
	console.log("In the global function of login.js");
    document.getElementById("loginButton").addEventListener('click' , (e) => {

        console.log("Login event!");
        //Take the closest form
        let form = e.target.closest("form");

        //Check if the form is valid -> every field is been fulled
        if(form.checkValidity()){

            //Make the call to the server
            makeCall("POST" , 'CheckLogin' , e.target.closest("form") ,
                function (x) {
                    console.log("CallBack function called");
                    if(x.readyState == XMLHttpRequest.DONE){
                        let message = x.responseText;
                        switch(x.status){
                            //If ok -> set the userName in the session
                            case 200:
                                sessionStorage.setItem('userName' , message);
                                window.location.href = "HomePage.html";
                                break;
                            //If ko -> show the error
                            default:
                                document.getElementById("error").textContent = message;
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
