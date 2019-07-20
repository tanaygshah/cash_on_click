function createFulfilmentRequests(){
	frappe.dom.freeze("Please Wait")
	frappe.call({
		method: "zippy_cash.zippy_cash.page.order_cash.order_cash.create_fulfilment_requests",
		args: {
			"amount": $("#order-amount").val(),
			"address": $("#order-address").val()
		},
		callback: function(response){
			if(response["message"]["error"] != ""){
				frappe.msgprint(response["message"]["error"])
			}
			else {
				location.replace("/desk#track-cash?user=cashrequester&co_name=" 
				+ response["message"]["co_name"] + "&source_latitude="
				+ response["message"]["source_latitude"] + "&source_longitude="
				+ response["message"]["source_longitude"] + "&destination_latitude="
				+ response["message"]["destination_latitude"] + "&destination_longitude="
				+ response["message"]["destination_longitude"] +"&status=tracking")
			}

			frappe.dom.unfreeze()
		}
	})
}

frappe.pages['order-cash'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Order Cash',
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
			await loadResource("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.js").then(()=>{console.log("Yay..")})	
			//await loadResource("/assets/zippy_cash/js/frappe-datatable.min.js").then(()=>{console.log("Yay..")})
			//await loadResource("/assets/zippy_cash/js/Sortable.min.js").then(()=>{console.log("Yay..")})
			//await loadResource("/assets/zippy_cash/js/auto-complete.js").then(()=>{console.log("Yay..")})
			
			addCss('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css')
			//addCss('/assets/zippy_cash/css/auto-complete.css')
			//addCss('/assets/zippy_cash/css/order-cash-page.css')
			
			
			$('<div id="start-order" class="collapse">\
			<div class="row" align="center">\
			<div class="col-sm-6">\
				<label>Please Enter Amount<label>\
			</div>\
			</div>\
			<div class="row" align="center">\
				<div class="col-sm-6">\
					<input type="int" id="order-amount">\
				</div>\
				</div>\
				<div class="row" align="center">\
			<div class="col-sm-6">\
				<label>Please Enter Delivery Address<label>\
			</div>\
			</div>\
			<div class="row" align="center">\
				<div class="col-sm-6">\
					<input id="order-address">\
				</div>\
				</div>\
				<div class="row align="center">\
					<div class="col-sm-6" align="center">\
						<button style="background: #58585a; color: #ffffff; border-radius: 4px; border: 1px solid #58585a; padding: 7px 20px; margin: 10px 0px 0px 20px;" id="order-button" onclick="createFulfilmentRequests()">Accio</button>\
					</div>\
				</div>\
			   </div>\
			   </div>').appendTo($(wrapper).find('.layout-main-section'));
			
			   $('<a id="toggle-start-order" href="#start-order" data-toggle="collapse"></a>').appendTo($(wrapper).find('.layout-main-section'));
			   
			   $('<div id="track-order" class="collapse">\
			   <div class="row" align="center">\
			   <div class="col-sm-6">\
				   <label>Your Order Is Arriving..<label>\
			   </div>\
			   </div>\
			   <div class="row" align="center">\
				   <div id="map-container" class="col-sm-6">\
				   	<div id="map" style="width: 100%; height: 480px;"></div>\
				   </div>\
				   </div>\
				   <div class="row" align="center">\
			      <div class="row align="center">\
					   <div class="col-sm-6" align="center">\
						   <button style="background: #58585a; color: #ffffff; border-radius: 4px; border: 1px solid #58585a; padding: 7px 20px; margin: 10px 0px 0px 20px;" id="confirm-button" onclick="confirmDelivery()">Confirm Delivery</button>\
					   </div>\
				   </div>\
				  </div>\
				  </div>').appendTo($(wrapper).find('.layout-main-section'));
			   
				  $('<a id="toggle-track-order" href="#track-order" data-toggle="collapse"></a>').appendTo($(wrapper).find('.layout-main-section'));
			   
			resolve()
		});						
	}
	

	pageLoad().then(()=>{
		$("#toggle-start-order").click()
	})
	.catch((err)=>{alert(err)})

}