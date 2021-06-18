/**
 * Handle the sorting of a playList
 */

{
    var handleSorting = new HandleSorting();

    function HandleSorting() {
        /**
         * To save the dragged element reference
         */
        let startElement = null;

        /**
         * Add d&d event to all the row with class "draggable"
         */
        this.addEventListeners = function() {
            let elements = document.getElementsByClassName("draggable");

            for(let i = 0 ; i < elements.length ; i++){
                elements[i].draggable = true;//Otherwise it can't be dragged

                elements[i].addEventListener("dragstart" , dragStart); //save dragged element reference
                elements[i].addEventListener("dragover" , dragOver);   //change color of reference element to red
                elements[i].addEventListener("dragleave" , dragLeave); // change color of reference element to black
                elements[i].addEventListener("drop" , drop);           //change position of dragged element using the referenced element
            }
        }

        /**
         * Function that makes all the rows of the table not selectd
         * @param rows
         */
        function unselectRows(rows) {
            for(let i = 0 ; i < rows.length; i++){
                rows[i].className = "notSelected";
            }
        }

        /**
         * The dragstart event is fired when the user start dragging an element (if it is draggable = True)
         * @param event is the event caused by the user
         */
        function dragStart(event) {
            //Save the element
            startElement = event.target.closest("tr");
            console.log("Start element selected and it is " + startElement);
            console.log("The start song id is: " + startElement.getAttribute("songId"));
        }

        /**
         * The dragover event is fired when an element is being dragged over a valid drop target
         * @param event is the event caused by the user
         */
        function dragOver(event) {
            //Need to use prevent default, otherwise the drop event is not called
            event.preventDefault();

            //Need to select the row that triggered this event to marked as "selected" so it's clear for the user
            let dest = event.target.closest("tr");

            //TODO change color with CSS

            // Mark  the current element as "selected"
            dest.className = "selected";
        }

        /**
         * The dragleave event is fired when a dragged element leaves a valid drop target
         * @param event is the event caused by the user
         */
        function dragLeave(event) {
            //Need to select the row that triggered this event to marked it as "notSelected" so it's clear for the user
            let dest = event.target.closest("tr");

            //Mark the current element as "notSelected", then with CSS we will put it in black
            dest.className = "notSelected";
        }

        /**
         * The drop event is fired when an element or text selection is dropped on a valid drop target
         * @param event is the event caused by the user
         */
        function drop(event) {

            //Obtain the row on which we're dropping the dragged element
            let dest = event.target.closest("tr");

            //Obtain the index of the row in the table to use it as reference for changing the dragged element position
            let table = dest.closest('table');
            let rows = Array.from(table.querySelectorAll('tbody > tr'));
            let indexDest = rows.indexOf(dest);
            
            console.log("StartElement is: " + startElement);
            console.log("The start song id is: " + startElement.getAttribute("songId"));

            //Move the dragged element to the new position
            if (rows.indexOf(startElement) < indexDest)
                //If we're moving down, then we insert the element after our reference (indexDest)
                startElement.parentElement.insertBefore(startElement, rows[indexDest + 1]);
            else
                //If we're moving up, then we insert the element before our reference (indexDest)
                startElement.parentElement.insertBefore(startElement, rows[indexDest]);

            //Mark all rows in "not selected" class to reset previous dragOver
            unselectRows(rows);
        }

        /**
         * Function that will send the final sorting to the server and, when the answer arrived, turn back to
         * the standard home page, showing the playlist with the new ordering
         */
        function sendSorting() {

        }
    }
}