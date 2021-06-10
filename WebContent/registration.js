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
        //Reset the error
        document.getElementById("error").textContent = null;

        //Check the form validity
        if(form.checkValidity()){

			console.log("In check validity");
			
            //Check the validity of the fields
            let user = document.getElementById("user").value;
            let password = document.getElementById("password").value;

			console.log("User length is: " + user.length);
            if(user.length > 45 || password.length > 45){
            	console.log("Values too long");
                document.getElementById("error").textContent = "username e/o password too long";
                return;
            }
            if(!(password.includes("0") || password.includes("1") || password.includes("2") ||
                password.includes("3") || password.includes("4") || password.includes("5") ||
                password.includes("6") || password.includes("7") || password.includes("8") ||
                password.includes("9")) ||
                !(password.includes("#") || password.includes("@") || password.includes("_")) ||
                password.length < 4){
                console.log("Bad format for password");
                document.getElementById("error").textContent = "Password has to contain at least:4 character,1 number and 1 of the following @,# and _ ";
                return;
            }
            
            console.log("Validity ok");

            //Make the call to  the server
            makeCall("POST" , 'Registration' , e.target.closest("form") ,
                function (x) {
                    console.log("CallBack function called");

                    if(x.readyState == XMLHttpRequest.DONE){
                        switch(x.status){
                            //If ok -> redirect to login page
                            case 200:
                                window.location.href = "login.html";
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