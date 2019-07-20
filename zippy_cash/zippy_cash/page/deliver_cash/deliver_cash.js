function acceptOrder(fr_name){
	frappe.call({
		method: "zippy_cash.zippy_cash.page.deliver_cash.deliver_cash.accept_order",
		args: {"fr_name": fr_name},
		callback: function(response){
			location.replace("/desk#track-cash?user=cashpoint&co_name=" 
				+ response["message"]["co_name"] + "&source_latitude="
				+ response["message"]["source_latitude"] + "&source_longitude="
				+ response["message"]["source_longitude"] + "&destination_latitude="
				+ response["message"]["destination_latitude"] + "&destination_longitude="
				+ response["message"]["destination_longitude"] + "&status=tracking")
		}
	})
}

function viewOnMap(fr_name){
	frappe.call({
		method: "zippy_cash.zippy_cash.page.deliver_cash.deliver_cash.accept_order",
		args: {"fr_name": fr_name},
		callback: function(response){
			location.replace("/desk#track-cash?user=cashpoint&co_name=" 
				+ response["message"]["co_name"] + "&source_latitude="
				+ response["message"]["source_latitude"] + "&source_longitude="
				+ response["message"]["source_longitude"] + "&destination_latitude="
				+ response["message"]["destination_latitude"] + "&destination_longitude="
				+ response["message"]["destination_longitude"] + "&status=viewing")
		}
	})
}
function fetchOrders(){
	frappe.call({
		method: "zippy_cash.zippy_cash.page.deliver_cash.deliver_cash.fetch_orders",
		callback: function(response){
			var available_orders = response["message"]["available_orders"]
			var orders_html = '<div class="card"><div class="list-group list-group-flush">'
			available_orders.forEach(function(order){
				orders_html = orders_html + '<li class="list-group-item">'
					 + '<div align="center" class="row">' 
					 + '<p align="center" class="card-text"><b>Amount :</b> Rs. '
					 + order["amount"] + '</p>'
					 + '<p align="center" class="card-text"><b>Aaddress :</b> '
					 + order["delivery_address"] + '</p>'
					 + '</div>'
					 + '<div align="center" class="row"><div align="right" class="col-xs-6"><button class="btn btn-primary" onclick="acceptOrder(\'' 
					 + order["name"]
					 + '\')">Accept</button></div><div align="left" class="col-xs-6"><button class="btn btn-primary" onclick="viewOnMap(\'' 
					 + order["name"]
					 + '\')">Map View</button></div></div>'
					 + '</li>'
			})
			orders_html = orders_html + "</div></div>"
			console.log("orders", orders_html)
			$("#orders-list").html(orders_html)
		
		}
	})
}

frappe.pages['deliver-cash'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Deliver Cash',
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
			
			
			$('<div class="row" align="center">\
				<button style="background: #58585a; color: #ffffff; border-radius: 4px; border: 1px solid #58585a; padding: 7px 20px; margin: 10px 0px 10px 0px;" id="fetch-button" onclick="fetchOrders()">Check for Orders</button>\
				</div>\
				<div id="orders-list" class="row">\
				</div>\
			   </div>').appendTo($(wrapper).find('.layout-main-section'));
			
			   $('<a id="toggle-start-order" href="#start-order" data-toggle="collapse"></a>').appendTo($(wrapper).find('.layout-main-section'));
			   
			resolve()
		});						
	}
	

	pageLoad().then(()=>{
		$("#toggle-start-order").click()
	})
	.catch((err)=>{alert(err)})
}