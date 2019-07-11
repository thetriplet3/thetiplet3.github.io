
const SERVER_URL = "https://trat-forms.herokuapp.com/api/"
function init() {
    enableSocketConnection();
    initListners();
    initUsers();
    getCurrentUserFromCookie();
}

function initListners() {
    var parkingchb = document.getElementById("chbNeedParking");
    parkingchb.onclick = function() {
        if(this.checked) {
            document.getElementById("parkingContainer").style.display = "block";
            document.getElementById("parkingContainer").required = true;
        }
        else {
            document.getElementById("parkingContainer").style.display = "none";
            document.getElementById("parkingContainer").required = false;
        }
    }
    var radios = document.forms["frmDetails"].elements["options"];
    for (var i = 0, max = radios.length; i < max; i++) {
        radios[i].onclick = function () {
            document.getElementById("lblPersonal").className = "btn btn-success btn-lg dropdown-toggle";
        }
        radios[i].parentElement.onclick = function () {
            if (this.children[0].value == 3) {
                document.getElementById("lblPersonal").className = "btn btn-success btn-lg dropdown-toggle";
                document.getElementById("lblBusOne").className = "btn btn-outline-success btn-lg";
                document.getElementById("lblBusTwo").className = "btn btn-outline-success btn-lg";
                document.frmDetails.options[2].checked = true;

                document.getElementById("pickUpLocation").required = false;
                document.getElementById("regNumber").required = true;
            }
            else if (this.children[0].value == 2) {
                document.getElementById("lblBusOne").className = "btn btn-outline-success btn-lg";
                document.getElementById("lblPersonal").className = "btn btn-outline-success btn-lg dropdown-toggle";

                document.getElementById("pickUpLocation").required = true;
                document.getElementById("regNumber").required = false;
            }
            else if (this.children[0].value == 1) {
                document.getElementById("lblBusTwo").className = "btn btn-outline-success btn-lg";
                document.getElementById("lblPersonal").className = "btn btn-outline-success btn-lg dropdown-toggle";

                document.getElementById("pickUpLocation").required = true;
                document.getElementById("regNumber").required = false;
            }
        }
    }
}

function initUsers() {
    var url = SERVER_URL + "users/";
    let dropdown = document.getElementById('namesList');
    dropdown.length = 0;
    getData(url, "GET").then((res) => {
        if (res.length > 1) {
            for (let i = 0; i < res.length; i++) {
                option = document.createElement('option');
                option.text = res[i].name;
                option.value = res[i].name;
                dropdown.add(option);
            }
        }
    })
}

function getCurrentUser() {
    var url = SERVER_URL + "users/current";
    getData(url, "GET").then((res) => {
        updateUserDetails(res[0]);
        if (res) {
            getUserEntries();
        }
    })
}

function getCurrentUserFromCookie() {
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)currentUser\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieValue) {
        document.getElementById("name").value = cookieValue;
        document.getElementById("namesListContainer").style.display = "none";
        document.getElementById("nameContainer").style.display = "block";
        document.getElementById("namesList").value = cookieValue;
        document.getElementById("namesList").disabled = true;
        getUserEntries();
    }


}

function getUserDetails() {
    var name = document.getElementById("name").value;
    var url = SERVER_URL + "users/" + name;
    getData(url, "GET").then((res) => {
        updateUserDetails(res);
        if (res) {
            getUserEntries();
        }
    })
}

function getUserEntries() {
    var name = document.getElementById("name").value;
    var url = SERVER_URL + "entries/" + name;
    getData(url, "GET").then((res) => {
        updateUserEntry(res);
    })
}

function getBusCount() {
    var url = SERVER_URL + "entries/options";
    getData(url, "GET").then((res) => {
        updateSeats(res);
    })
}

function updatePickUpLocation() {
    var name = document.getElementById("name").value;
    var url = SERVER_URL + "entries/" + name;
    var pickUpLocation = document.getElementById("pickUpLocation").value
    var patchObj = {
        pickUpLocation: pickUpLocation
    }
    patchData(url, "PATCH", patchObj).then((data) => {
        toastr.success('Pickup location updated', 'Success')
    })
}

function getData(url = '', method, data = {}) {
    return fetch(url, {
        method: method,
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        //body: JSON.stringify(data), // body data type must match "Content-Type" header
    }).then(response => response.json()); // parses JSON response into native JavaScript objects 
}

function postData(url = '', method, data = {}) {
    return fetch(url, {
        method: method,
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    }).then(response => response.json()); // parses JSON response into native JavaScript objects 
}

function patchData(url = '', method, data = {}) {
    return fetch(url, {
        method: method,
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    }).then(response => response); // parses JSON response into native JavaScript objects 
}

function enableSocketConnection() {
    const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
    const port = 3000;
    //https://trat-forms.herokuapp.com/
    const echoSocketUrl = "wss://trat-forms.herokuapp.com" + '/api/entries/echo/';
    const socket = new WebSocket(echoSocketUrl);

    socket.onopen = () => {
        socket.send('0');
    }
    socket.onmessage = (res) => {
        updateSeats(JSON.parse(res.data));
    }
}

function updateSeats(busObj) {
    document.getElementById("bus1Count").innerText = busObj.first;
    document.getElementById("bus2Count").innerText = busObj.second;
}

function updateUserDetails(userObj) {
    if (!userObj) {
        // document.getElementById("username").style.display = "inline";
        // document.getElementById("btnFetchUserDetails").style.display = "inline";
        // document.getElementById("username").readOnly = false;
    }
    else {
        document.getElementById("username").readOnly = true;
        document.getElementById("username").value = userObj.username;
        document.getElementById("name").value = userObj.name;
        document.getElementById("namesList").value = userObj.name;
        document.getElementById("namesList").disabled = true;
        document.getElementById("seats").value = userObj.seats
    };
}

function updateUserEntry(entryObj) {
    document.getElementById("isSubmitted").checked = entryObj.length > 0;
    var isSubmitted = document.getElementById("isSubmitted").checked
    if (isSubmitted) {
        var entry = entryObj[0];
        document.frmDetails.options[parseInt(entry.option - 1)].checked = true;
        if (entry.option == "1") {
            $("#lblBusOne").button('toggle');
            document.getElementById("lblBusTwo").className = "btn btn-outline-success btn-lg";
            document.getElementById("lblPersonal").className = "btn btn-outline-success btn-lg dropdown-toggle";
            document.getElementById("lblBusTwo").disabled = true;
            document.getElementById("lblBusTwo").style.pointerEvents = "none";
            document.getElementById("lblPersonal").disabled = true;
            document.getElementById("lblPersonal").style.pointerEvents = "none";
            document.frmDetails.options[1].disabled = true;
        }
        else if (entry.option == "2") {
            $("#lblBusTwo").button('toggle');
            document.getElementById("lblBusOne").className = "btn btn-outline-success btn-lg";
            document.getElementById("lblPersonal").className = "btn btn-outline-success btn-lg dropdown-toggle";
            document.getElementById("lblBusOne").disabled = true;
            document.getElementById("lblBusOne").style.pointerEvents = "none";
            document.getElementById("lblPersonal").disabled = true;
            document.getElementById("lblPersonal").style.pointerEvents = "none";
            document.frmDetails.options[0].disabled = true;
        }
        else if (entry.option == "3") {
            $("#lblPersonal").button('toggle');
            document.getElementById("lblBusOne").className = "btn btn-outline-success btn-lg";
            document.getElementById("lblBusTwo").className = "btn btn-outline-success btn-lg";

            document.getElementById("lblBusOne").disabled = true;
            document.getElementById("lblBusOne").style.pointerEvents = "none";
            document.frmDetails.options[0].disabled = true;

            document.getElementById("lblBusTwo").disabled = true;
            document.getElementById("lblBusTwo").style.pointerEvents = "none";
            document.frmDetails.options[1].disabled = true;
        }
        document.getElementById("pickUpLocation").value = entry.pickUpLocation;
        document.getElementById("chbNeedParking").checked = entry.parkingNeeded;
        document.getElementById("regNumber").value = entry.regNumber;
        document.getElementById("btnUpdatePickUpLocation").style.display = "inline";
        document.getElementById("btnSubmit").disabled = true;
    }
}

function submitForm(event) {
    event.preventDefault();
    var url = SERVER_URL + "entries/";

    var username = document.getElementById("username").value;
    var nameDOM = document.getElementById("namesList");
    var name = nameDOM.options[nameDOM.selectedIndex].value;
    var seats = document.getElementById("seats").value;
    var pickUpLocation = document.getElementById("pickUpLocation").value;
    var option = document.frmDetails.options.value
    var parkingNeeded = document.getElementById("chbNeedParking").checked
    var regNumber = "0";
    if(parkingNeeded) {
        regNumber = document.getElementById("parkingNo").value;
    }
    else {
        regNumber = document.getElementById("regNumber").value;
    }
    var entryObj = {
        username: username,
        name: name,
        seats: seats,
        pickUpLocation: pickUpLocation,
        option: option,
        regNumber: regNumber,
        parkingNeeded: parkingNeeded
    }

    postData(url, "POST", entryObj)
        .then(handleErrors)
        .then((res) => {
            saveCookie(res);
            document.getElementById("namesList").disabled = true;
            document.getElementById("btnSubmit").disabled = true;
            document.getElementById("btnUpdatePickUpLocation").style.display = "inline";
            updateUserEntry([res]);
            toastr.success(`See you on saturday :)`, 'Success');

        }).catch((error) => {
            toastr.error(error, 'Error')
        })
    return false;
}

function handleErrors(response) {
    if (response.name == "MongoError") {
        var errorMessage = JSON.stringify(response);
        if (response.code == 11000) {
            errorMessage = "You've already submitted the form."
        }
        throw Error(errorMessage);
    }
    else if (response.name == "ServerError") {
        throw Error(response.message);
    }
    return response;
}

function saveCookie(entryObj) {
    document.cookie = `currentUser=${entryObj.name}`;
}
