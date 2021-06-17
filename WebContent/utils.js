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
function makeCall(method, url, formElement, objectToSend , callBack, isRequestingFile , reset = true) {
    let request = new XMLHttpRequest(); // visible by closure
    request.onreadystatechange = function() {
    	console.log("Request is onReadyStateChange");
        callBack(request);
    }; // closure

    request.open(method, url);

    if(isRequestingFile)
        request.responseType = "arraybuffer";

    if (formElement == null) {
        request.send();
    } else {
        //Send the form
        console.log("Form sent");
        request.send(new FormData(formElement));
    }

    if(objectToSend == null){
        request.send();
    } else {
        //Send the object
        console.log("Object sent");
        request.send(objectToSend);//TODO to verify
    }
    //If there is a form and reset is true -> reset the fields of the form
    if (formElement !== null && reset === true) {
    	console.log("Form reset");
        formElement.reset();
    }
}