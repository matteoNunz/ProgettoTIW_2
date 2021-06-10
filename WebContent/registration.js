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

            //Check the validity of the fields
            let user = document.getElementById("user");
            let password = document.getElementById("password");


            if(user.textContent.big() > 45 || password.textContent.big() > 45){
                document.getElementById("error").textContent = "username e/o password too long";
                return;
            }
            if(!(password.textContent.includes("0") || password.textContent.includes("1") || password.textContent.includes("2") ||
                password.textContent.includes("3") || password.textContent.includes("4") || password.textContent.includes("5") ||
                password.textContent.includes("6") || password.textContent.includes("7") || password.textContent.includes("8") ||
                password.textContent.includes("9")) ||
                !(password.textContent.includes("#") || password.textContent.includes("@") || password.textContent.includes("_")) ||
                password.textContent.big() < 4){
                document.getElementById("error").textContent = "Password has to contain at least:4 character,1 number and 1 of the following @,# and _ ";
                return;
            }

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