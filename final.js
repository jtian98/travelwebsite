var root_url = "http://comp426.cs.unc.edu:3001/";
var dep, arr, airline, oneOrRoundTrip; // filter conditions (all ids)
var user, pass, map
// id arrays
var firstname, lastname, age, gender;
let airports = [];
let departureAirportNames = [];
let departureAirportCodes = [];
// let dept_latlng = []; // for API
// let arr_latlng = [];

// let arrivalAirportNames = [];
let airlines = [];
let airlineNames = [];
let flights = [];
let arrivingFlights = [];
let planes = [];

var departure_airport_name, arrival_airport_name;

$(document).ready(() => {
      // initMap(); // test
      logIn();
      createAirportFilter();
      createAirlineFilter();
      createPlaneFilter();
}); // document

// NOTES
// cant have mutiple HTML files bc one DOM but fixed

function logIn() {

      // let body = $('body');
      // body.empty();

      // body.append('<div id="login_div"></div>');
      // body.append('<input class="input" type="text" id="login_user" placeholder="Username">');
      // body.append('<input class="input" type="text" id="login_pass" placeholder="Password">');
      // body.append('<button id="login_btn" onclick = createUser()>Login</button>');

      $('#search_div').hide();
      $('#itinerary_div').hide();

      let login = $('#login_div')
      // login.append('<div id="login_div"></div>');

      login.append('<h1 id="welcome">Welcome.<br>Enter your username and password to get started.</h1>');
      login.append('<h2>Username: <input class="input" type="text" id="login_user" placeholder="enter username..."></h2>');
      login.append('<h2>Password: <input class="input" type="password" id="login_pass" placeholder="enter password..."></h2><br><br>');
      login.append('<button id="login_btn" onclick="createUser()">Login</button>');
}

// -----helper functions----
function createUser() {

      user = $('#login_user').val();
      pass = $('#login_pass').val();

      console.log(user);
      console.log(pass);

      $.ajax(root_url + 'sessions',
            {
                  type: 'POST',
                  dataType: 'json',
                  xhrFields: { withCredentials: true },
                  data: {
                        "user": {
                              // "username": "averyss",
                              // "password": "123456"

                              "username": user,
                              "password": pass
                        }
                  },
                  success: (response) => {
                        //if (response.status) {
                        console.log('user created successfully.');
                        loginButton();
                        //} else {
                        //$('#mesg_div').html("Login failed. Try again.");
                        //}

                  },
                  error: () => {
                        $("#login_div").append("<h3>Login failed. Try again.</h3>");
                        // alert('error');
                  }
            });
}

function loginButton() {
      $('#login_div').hide(); // hide login
      $('#search_div').show(); // show the HTML on the file
}

function createAirportFilter() {
      $.ajax(root_url + 'airports', {
            type: 'GET',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            success: (response) => {
                  for (var i = 0; i < response.length; i++) {
                        $('#departure').append('<option value=' + response[i].id + '>' + response[i].code + ': ' + response[i].city + '</option>');
                        $('#arrival').append('<option value=' + response[i].id + '>' + response[i].code + ': ' + response[i].city + '</option>');
                        airports.push(response[i].id);
                        departureAirportNames.push(response[i].name + ' (' + response[i].code + ", " + response[i].city + ')');
                        departureAirportCodes.push(response[i].code);
                        // console.log(airports[i]); // test
                  }
            },
            error: () => {
                  alert('error');
            }
      });
}

function createAirlineFilter() {
      $.ajax(root_url + 'airlines', {
            type: 'GET',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            success: (response) => {
                  for (var i = 0; i < response.length; i++) {
                        $('#airline').append('<option value=' + response[i].id + '>' + response[i].name + '</option>');
                        airlines.push(response[i].id);
                        airlineNames.push(response[i].name);
                  }
            },
            error: () => {
                  alert('error');
            }
      });
}

function createPlaneFilter() {
      // TODO: fill-in? only if needed.
}

function search() { // on click
      // TODO: no longer capitalized location -> airport id
      dep = $('#departure option:selected').val(); // val = id
      arr = $('#arrival option:selected').val();
      airline = $('#airline option:selected').val();
      oneOrRoundTrip = $('#onewayroundtrip option:selected').val();
      console.log("search button pressed");

      // console.log(dep);
      // console.log(arr);

      // TODO: add tests
      buildFlightInterface();
}

function buildFlightInterface() {
      // hierarchy: body -> div -> h1 -> div
      let body = $('body');

      // body.empty(); // clear page

      $('#search_div').hide();
      $('#itinerary_div').hide();

      body.append('<div id="flights_interface"></div>') // for centering content

      $('#flights_interface').append('<button type="button" onclick = "goHome()" id="home">Return Home</button>');
      // $('#flights_interface').append('<h1>Here are some flights: </h1>');
      $('#flights_interface').append('<div id="depart_div"></div>'); //for roundtrip <h1>
      if (oneOrRoundTrip == "roundtrip") {
            $('#depart_div').append('<h1>Departing Flights</h1>');
      }

      $('#flights_interface').append('<div id="departure_flights_div"></div>');
      $('#flights_interface').append('<div id="arrive_div"></div>'); //for roundtrip <h1>
      if (oneOrRoundTrip == "roundtrip") {
            $('#arrive_div').append('<h1>Arriving Flights</h1>');
      }
      $('#flights_interface').append('<div id="arrival_flights_div"></div>');
      fetchFlights();
}

function fetchFlights() { // creates flights

      let result = [];
      $.ajax(root_url + 'flights', {
            type: 'GET',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            success: (response) => {

                  let quickestFlightArriveTime = "2100-01-01T20:23:00.000Z"; //a date in the future (ex. MAX_VALUE)
                  for (var i = 0; i < response.length; i++) {
                        flights.push(response[i].id);
                        // TESTING: SFO -> BOS

                        if (response[i].departure_id == dep && response[i].arrival_id == arr) {

                              showDepartureFlightMatch(response[i]); // filter by: dep, arr, airline

                              if (response[i].arrives_at < quickestFlightArriveTime) {
                                    quickestFlightArriveTime = response[i].arrives_at;
                              }
                        }
                  }

                  if (oneOrRoundTrip == "roundtrip") { //for roundtrip
                        for (var i = 0; i < response.length; i++) {
                              if (quickestFlightArriveTime < response[i].departs_at &&
                                    response[i].departure_id == arr && response[i].arrival_id == dep) {
                                    showArrivalFlightMatch(response[i]);
                              }
                        }
                  }

                  // console.log($('.dep_flight').length);
                  if ($('.dep_flight').length == 0) {
                        $('#departure_flights_div').append('<h2>Try again. There are no flights that match your criteria.</h2>')
                  }

                  if ($('.arr_flight').length == 0 && oneOrRoundTrip == "roundtrip") {
                        $('#arrival_flights_div').append('<h2>Try again. There are no flights that match your criteria.</h2>')
                  }

            },
            error: () => {
                  alert('error');
            }
      });
}

function showDepartureFlightMatch(flight) {
      $('#departure_flights_div').append('<button class="dep_flight" value=' + flight.id + ' id=' + flight.id + '></button>'); // container

      for (var i = 0; i < airlines.length; i++) {
            if (airline == airlines[i]) {
                  $('#' + flight.id).append('<h2 id="airline1">Airline: ' + airlineNames[i] + '</h2>');
             }
           
      } // matching airline id -> name

      $('#' + flight.id).append('<div id="tic_logo_div"><img id="ticketlogo" src="ticketlogo.png" width="50"></div>');
      $('#' + flight.id).append('<h2>Flight Number: ' + flight.number + '</h2>');
      $('#' + flight.id).append('<h2>----------------------------</h2>');


      var departure_airport = "";
      var arrival_airport = "";
      for (var i = 0; i < airports.length; i++) {
            if (dep == airports[i]) {
                  $('#' + flight.id).append('<h3>Departure Airport: ' + departureAirportNames[i] + '</h3>');
                  departure_airport = departureAirportCodes[i];
                  departure_airport_name = departureAirportNames[i];
            }
            if (arr == airports[i]) {
                  $('#' + flight.id).append('<h3>Arrival Airport: ' + departureAirportNames[i] + '</h3>');
                  arrival_airport = departureAirportCodes[i];
                  arrival_airport_name = departureAirportNames[i];
            }
      }

      var depDate = new Date(flight.departs_at);
      // $('#' + flight.id).append('<h2>Departure Time: ' + flight.departs_at + '</h2>');
      $('#' + flight.id).append('<h3>Departure Time: ' + depDate.toString() + '</h3>');

      var arrDate = new Date(flight.arrives_at);
      // $('#' + flight.id).append('<h2>Arrival Time: ' + flight.arrives_at + '</h2>');
      $('#' + flight.id).append('<h3>Arrival Time: ' + arrDate.toString() + '</h3>');

      // $('#' + flight.id).append('<button class="book" id="book_" ' + flight.id + ' onclick="bookFlight(' + flight.id + ')">Book Flight</button>');
      // $('#' + flight.id).append('<button class="book" id="book_" ' + flight.id + ' onclick="bookFlight(' + flight, departure_airport, arrival_airport+ ')">Book Flight</button>');
      $('#' + flight.id).append('<button class="book" id="book_" ' + flight.id + ' onclick="bookFlight(\'' + flight.id + '\',\'' + departure_airport + '\',\'' + arrival_airport + '\',\'' + departure_airport_name + '\',\'' + arrival_airport_name + '\')">Book This Flight</button>');

}

function showArrivalFlightMatch(flight) {

      $('#arrival_flights_div').append('<button class = "arr_flight" value=' + flight.id + ' id=' + flight.id + '></button>'); // container

      for (var i = 0; i < airlines.length; i++) {
            if (airline == airlines[i]) {
                  $('#' + flight.id).append('<h2>Airline: ' + airlineNames[i] + '</h2>');
            }
      } // matching airline id -> name

      $('#' + flight.id).append('<div id="tic_logo_div"><img id="ticketlogo" src="ticketlogo.png" width="50"></div>');
      $('#' + flight.id).append('<h2>Flight Number: ' + flight.number + '</h2>');
      $('#' + flight.id).append('<h2>----------------------------</h2>');

      //for (var i = 0; i < airports.length; i++) {
      let departure_airport = "";
      let arrival_airport = "";
      for (var i = airports.length - 1; i >= 0; i--) {

            if (arr == airports[i]) {
                  $('#' + flight.id).append('<h3>Departure Airport: ' + departureAirportNames[i] + '</h3>');
                  departure_airport = departureAirportCodes[i];
                  console.log("dep var: " + departure_airport);
            }
            if (dep == airports[i]) {
                  $('#' + flight.id).append('<h3>Arrival Airport: ' + departureAirportNames[i] + '</h3>');
                  arrival_airport = departureAirportCodes[i];
                  console.log("arrival var " + arrival_airport);
            }
      }

      var depDate = new Date(flight.departs_at);
      $('#' + flight.id).append('<h3>Departure Time: ' + depDate.toString() + '</h3>');

      var arrDate = new Date(flight.arrives_at);
      $('#' + flight.id).append('<h3>Arrival Time: ' + arrDate.toString() + '</h3>');

      // $('#' + flight.id).append('<button class="book" id="book_" ' + flight.id + ' onclick="bookFlight(' + flight.id + ')">Book Flight</button>');
      // $('#' + flight.id).append('<button class="book" id="book_" ' + flight.id + ' onclick="bookFlight(' + flight, departure_airport, arrival_airport + ')">Book Flight</button>');
      $('#' + flight.id).append('<button class="book" id="book_" ' + flight.id + ' onclick="bookFlight(\'' + flight.id + '\',\'' + departure_airport + '\',\'' + arrival_airport + '\')">Book This Flight</button>');

}

function bookFlight(flight_id, departure_airport, arrival_airport, departure_airport_name, arrival_airport_name) {
      $('#flights_interface').hide();
      $('#book_div').empty();
      $('#book_div').append('<h1><br>Input passenger<br>information:</h1>');
      $('#book_div').append('<h2><br>First Name: <input type="text" id="firstname"></h2>');
      $(function() {
       var temp=[];
       $.ajax(root_url+'tickets',{
          type:'GET',
          dataType:'json',
          xhrFields: {withCredentials: true },
            success: (response) => {
             for(var i=0; i<response.length;i++){
                  temp.push(response[i].first_name);
             };
                 }
      });

      $("#firstname").autocomplete({
            source: temp
      });
});
      $('#book_div').append('<h2><br>Last Name: <input type="text" id="lastname"></h2>');
      $(function() {
       var arr=[];
       $.ajax(root_url+'tickets',{
          type:'GET',
          dataType:'json',
          xhrFields: {withCredentials: true },
            success: (response) => {
             for(var i=0; i<response.length;i++){
                  arr.push(response[i].last_name);
             };
                 }
      });

      $("#lastname").autocomplete({
            source: arr
      });
});
      $('#book_div').append('<h2><br>Age:<input type="number" id="age"></h2>');
      $('#book_div').append('<h2><br>Gender: <input type="text" id="gender" placeholder="female/male"></h2>');
      $('#book_div').append('<br><br><button id="button_ticket">Confirm</button>');
      $('#book_div').show();

      $('#button_ticket').click(function () {
            firstname = $('#firstname').val();
            lastname = $('#lastname').val();
            age = $('#age').val();
            gender = $('#gender').val();
            // console.log(age);
            $.ajax(root_url + 'tickets', {
                  type: 'POST',
                  data: {
                        'ticket': {
                              'first_name': firstname,
                              'last_name': lastname,
                              'age': age,
                              'gender': gender
                        }
                  },
                  dataType: 'json',
                  xhrFields: { withCredentials: true },
                  success: (response) => {
                        generateItinerary(flight_id, departure_airport, arrival_airport, firstname, lastname, age, gender, departure_airport_name, arrival_airport_name);
                  }
            });
      });
}


function generateItinerary(flight_id, departure_airport, arrival_airport, firstname, lastname, age, gender, departure_airport_name, arrival_airport_name) {
      $('#flights_interface').hide();
      $('#book_div').hide();
      $('#itinerary_div').show();
      code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5).toUpperCase(); // random capitilized 5 char code
      // console.log(code);

      $.ajax(root_url + 'itineraries', {
            type: 'POST',
            data: {
                  'itinerary': {
                        'confirmation_code': code,
                        'email': user + '@cs.unc.edu'
                  }
            },
            dataType: 'json',
            xhrFields: { withCredentials: true },
            success: (response) => {
                  console.log('Itinerary ' + response.id + ' booked succesfully.');

                  // $('#itinerary_div').append('<button type="button" onclick = "goHome()" id="home">Home</button>'); //home
                  // $("#itinerary_div").append("<input class='input' type= 'text' placeholder = 'search airport code' id = 'search_tickets'> </input>");

                  $('#itinerary_div').append('<button class="itin" value=' + response.id + ' id=' + response.id + '></button>'); // container
                  $('#' + response.id).append('<h2>Your Itinerary: </h2>');
                  $('#' + response.id).append('<h3>Flight ID: ' + flight_id + ' </h3>');
                  $('#' + response.id).append('<h3>Confirmation Code: ' + code + ' </h3>');
                  $('#' + response.id).append('<h3>Passenger Name: ' + firstname + ' ' + lastname + ' </h3>');
                  $('#' + response.id).append('<h3>Age: ' + age + ' Gender: ' + gender);
                  $('#' + response.id).append('<h3 id ="airs" >' + departure_airport + '-' + arrival_airport + '</h3>');
                  $('#' + response.id).append('<button id="show_map" onclick="showMap(\'' + departure_airport_name + '\',\'' + arrival_airport_name + '\')">Show Map</button>');                  $('#' + response.id).append('<button id="back">Return to Flights</button>');
                  $('#' + response.id).append('<button class="book" onclick="delete_itinerary(' + response.id + ')" id= "delete_' + response.id + '">Delete</button>');
                  

                  $('#back').click(function () {
                        $('#flights_interface').show();
                        $('#book_div').hide();
                        $('#itinerary_div').hide();
                  });
                  $("#search_tickets").keyup(function () {
                        $(".itin").each(function () {
                              if ($(this).find("#airs").text().toLowerCase().indexOf($('#search_tickets').val().toLowerCase()) >= 0) {
                                    console.log($(this).text());
                                    $(this).show();
                              } else {
                                    $(this).hide();
                              }
                        })
                  })
            },
            error: () => {
                  alert('error');
            }
      });
}

function delete_itinerary(response_id) {
      $.ajax(root_url + 'itineraries' + '/' + response_id, {
            type: 'DELETE',
            dataType: 'json',
            xhrFields: { withCredentials: true },
            success: (response) => {
                  $("#delete_" + response_id).parent().remove();
            }
      });
      // $('#map').hide();
}

function showMap(departure_airport_name, arrival_airport_name) {

      var geocoder = new google.maps.Geocoder();
      // geocodeDeptAirport(departure_airport, geocoder);
      // geocodeArrAirport(arrival_airport, geocoder);
      // generatePath();
      // console.log(flight.departure_airport);
      
      map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 5
      });

      $('#map').append(map);

      var dir_service = new google.maps.DirectionsService;
      var dir_display = new google.maps.DirectionsRenderer;
      dir_display.setMap(map);

      renderDirections(dir_service, dir_display, departure_airport_name, arrival_airport_name);
}

function renderDirections(dir_service, dir_display, dept_airport_name, arr_airport_name) {
      console.log(dept_airport_name);
      console.log(arr_airport_name);

      dir_service.route({
            origin: dept_airport_name,
            destination: arr_airport_name,
            travelMode: 'DRIVING'
      }, function (response, status) {
            if (status == 'OK') {
                  dir_display.setDirections(response);
            } else {
                  alert('Error retrieving path.');
            }
      });
}

// function geocodeDeptAirport(airport, geocoder) {
//       console.log(airport); // test
//       geocoder.geocode({'address':airport},function(results, status) {
//             if (status === 'OK') {
//                   // map.setCenter(results[0].geometry.location);
//                   dept_latlng[0] = ['lat:' + results[0].geometry.location.lat(), 'lng:' + results[0].geometry.location.lng()];
//                   var marker = new google.maps.Marker({
//                         map: map,
//                         position: results[0].geometry.location,
//                   });
//             } else {
//                   alert('Invalid geocode: ' + status);
//             }
//       });
// }

// function geocodeArrAirport(airport, geocoder) {
//       console.log(airport); // test
//       geocoder.geocode({'address':airport},function(results, status) {
//             if (status === 'OK') {
//                   map.setCenter(results[0].geometry.location); // set map center to destination
//                   arr_latlng[0] = ['lat: ' + results[0].geometry.location.lat(), 'lng: ' + results[0].geometry.location.lng()];
//                   var marker = new google.maps.Marker({
//                         map: map,
//                         position: results[0].geometry.location,
//                   });
//             } else {
//                   alert('Invalid geocode: ' + status);
//             }
//       });
// }

// function generatePath() {

//       console.log(dept_latlng);
//       console.log(arr_latlng);

//       var flightPathCoord = [
//             dept_latlng,
//             arr_latlng
//       ];

//       var flightPath = new google.maps.Polyline({
//             path: flightPathCoord,
//             geodesic: true,
//             strokeColor: '#FF0000',
//             strokeOpacity: 1.0,
//             strokeWeight: 2
//       });

//       flightPath.setMap(map);
// }

// function bookFlight(flight_id) {
//       $('#flights_interface').hide();
//       $('#itinerary_div').show();

//       code = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5).toUpperCase(); // random capitilized 5 char code
//       // console.log(code);

//       $.ajax(root_url + 'itineraries', {
//             type: 'POST',
//             data: {
//                   'itinerary': {
//                         'confirmation_code': code,
//                         'email': user + '@cs.unc.edu'
//                   }
//             },
//             dataType: 'json',
//             xhrFields: { withCredentials: true },
//             success: (response) => {
//                   console.log('Itinerary ' + response.id + ' booked succesfully.');

//                   $('#itinerary_div').append('<button type="button" onclick = "goHome()" id="home">Home</button>'); //home
//                   $('#itinerary_div').append('<button value=' + response.id + ' id=' + response.id + '></button>'); // container
//                   $('#' + response.id).append('<h2>Your Itinerary: </h2>');
//                   $('#' + response.id).append('<h3>Flight ID: '+ flight_id +' </h3>');
//                   $('#' + response.id).append('<h3>Confirmation Code: '+ code +' </h3>');
//                   $('#' + response.id).append('<h3>  </h3>');
//             },
//             error: () => {
//                   alert('error');
//             }
//       });
// }

function goHome() {
      // window.location.href = "final.html";
      $('#flights_interface').empty(); // hide login
      $('#flights_interface').show();
      $('#search_div').show(); // show the HTML on the file
      $('#itinerary_div').hide();
}





















