/**
 * AJAX call
 */

/**
 *
 * @param method is the kind of action: GET or POST
 * @param url is the servlet that should be called
 * @param formElement is the form that has been selected
 * @param callBack is the function to call when arrive the answer
 * @param reset true reset the fields of the form
 */
function makeCall(method, url, formElement, callBack , objectToSend , reset = true) {
    let request = new XMLHttpRequest(); // visible by closure
    request.onreadystatechange = function() {
    	console.log("Request is onReadyStateChange");
        callBack(request);
    }; // closure

    request.open(method, url);

    if (formElement == null && objectToSend == null) {
        request.send();
    } else if(formElement != null){
    	//Send the form
        console.log("Form sent");
        request.send(new FormData(formElement));
    } else {
		//Send the object
        console.log("Object sent");
        //request.addAttribute("newSorting" , objectToSend);
        let toSend = JSON.stringify(objectToSend);
        console.log("toSend is: " + toSend.toString());
        request.send(toSend);//TODO to verify
    }

    //If there is a form and reset is true -> reset the fields of the form
    if (formElement !== null && reset === true) {
    	console.log("Form reset");
        formElement.reset();
    }
}