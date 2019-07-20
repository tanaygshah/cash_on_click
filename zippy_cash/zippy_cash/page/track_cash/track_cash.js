/*
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
	center: {lat: 20.397, lng: 79.644},
	zoom: 8
  });
}
*/
var co_name;

function acceptOrder(){
	frappe.call({
		method: "zippy_cash.zippy_cash.page.deliver_cash.deliver_cash.accept_cash_order",
		args: {"co_name": co_name},
		callback: function(response){
			location.replace("/desk#track-cash?user=cashpoint&co_name=" 
				+ response["message"]["co_name"] + "&source_latitude="
				+ response["message"]["source_latitude"] + "&source_longitude="
				+ response["message"]["source_longitude"] + "&destination_latitude="
				+ response["message"]["destination_latitude"] + "&destination_longitude="
				+ response["message"]["destination_longitude"] + "&status"
				+ "tracking")
		}
	})
}
function confirmDelivery(){
	frappe.call({
		method: "zippy_cash.zippy_cash.page.deliver_cash.deliver_cash.confirm_delivery",
		args: {"co_name": co_name},
		callback: function(response){
			$("#map-canvas").hide()
			$("#requester-div").hide()
			$("#deliverer-div").hide()
			$("#finish-message").show()
		}
	})
}

function confirmReciept(){
	frappe.call({
		method: "zippy_cash.zippy_cash.page.order_cash.order_cash.confirm_reciept",
		args: {"co_name": co_name},
		callback: function(response){
		   $("#map-canvas").hide()
		   $("#requester-div").hide()
		   $("#deliverer-div").hide()
		   $("#finish-message").show()
		}
	})
}

function mapLocation(source_latitude, source_longitude, destination_latitude, destination_longitude) {
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	var map;
  
	function initialize() {
	  directionsDisplay = new google.maps.DirectionsRenderer();
	  var chicago = new google.maps.LatLng(17.334818, 73.884886);
	  var mapOptions = {
		zoom: 7,
		center: chicago
	  };
	  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	  directionsDisplay.setMap(map);
	  calcRoute()
	}
  
	function calcRoute() {
	  var start = new google.maps.LatLng(source_latitude, source_longitude);
	  //var end = new google.maps.LatLng(38.334818, -181.884886);
	  var end = new google.maps.LatLng(destination_latitude, destination_longitude);
	  var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.TravelMode.DRIVING
	  };
	  directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
		  directionsDisplay.setDirections(response);
		  directionsDisplay.setMap(map);
		} else {
		  alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
		}
	  });
	}
  
	google.maps.event.addDomListener(window, 'load', initialize);
  }
frappe.pages['track-cash'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Track Cash',
		single_column: true
	});

	function loadResource(url){
		return new Promise((resolve, reject) => {
			$.getScript(url, function( data, textStatus, jqxhr ) {
				resolve()
			})
		})
	}

	function addCss(url){
		$('<link>')
			.appendTo('head')
			.attr({
				type: 'text/css', 
				rel: 'stylesheet',
				href: url
			});
	}

	function pageLoad(){
		return new Promise(async (resolve, reject)=> {
			await loadResource("https://maps.googleapis.com/maps/api/js?key=ADD_YOUR_API_KEY").then(()=>{console.log("Yay..")})	
			
			//addCss('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css')
			
			
			$('<div class="row" align="center" id="map-canvas" style="height: 300px; width: 90%; margin-left: 20px">\
				</div>\
			<div class="row" align="center" id="requester-div">\
				<button class="btn btn-primary" style="margin-top:20px; width:80%" onclick="confirmReciept()">Recieved Cash</button>\
			</div>\
			<div class="row" align="center" id="deliverer-div">\
				<button class="btn btn-primary" style="margin-top:20px; width:80%" onclick="confirmDelivery()">Delivered Cash</button>\
			</div>\
			<div class="row" align="center" id="accept-order">\
				<button class="btn btn-primary" style="margin-top:20px; width:80%" onclick="acceptOrder()">Accept</button>\
			</div>\
			<div class="row" align="center" id="finish-message"><h2>Thanks</h2></div>').appendTo($(wrapper).find('.layout-main-section'));
				
			resolve()
		});						
	}
	

	pageLoad().then(()=>{
		//initMap()
		var page_info = window.location.href.split("=")
		var user_type = page_info[1].split("&")[0]
		co_name = page_info[2].split("&")[0]
		var source_latitude = page_info[3].split("&")[0]
		var source_longitude = page_info[4].split("&")[0]
		var destination_latitude = page_info[5].split("&")[0]
		var destination_longitude = page_info[6].split("&")[0]
		var purpose = page_info[7]

		if(user_type == "cashrequester"){
			$("#deliverer-div").hide()
			$("#requester-div").show()
		}
		else{
			$("#requester-div").hide()
			$("#deliverer-div").show()
		}
		$("#finish-message").hide()
		
		if(purpose == "viewing"){
			$("#accept-order").show()
			$("#deliverer-div").hide()
		}
		else{
			$("#accept-order").hide()
		}
		mapLocation(source_latitude, source_longitude, destination_latitude, destination_longitude);
	})
	.catch((err)=>{alert(err)})
}
