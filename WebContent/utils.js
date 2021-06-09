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
function makeCall(method, url, formElement, callBack, reset = true) {
    let request = new XMLHttpRequest(); // visible by closure
    request.onreadystatechange = function() {
        callBack(request);
    }; // closure

    request.open(method, url);
    if (formElement == null) {
        request.send();
    } else {
        //Send the form
        request.send(new FormData(formElement));
    }
    //If there is a form and reset is true -> reset the fields of the form
    if (formElement !== null && reset === true) {
        formElement.reset();
    }
}