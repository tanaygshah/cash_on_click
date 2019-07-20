import frappe
import requests
import time
import datetime
import os

@frappe.whitelist()
def create_fulfilment_requests(amount, address):
    try:
        geocoding_response = requests.get("https://maps.googleapis.com/maps/api/geocode/json", params = {"address": address,"key": os.environ["MAPS_GEOCODING_KEY"]}) 
        geocoding_response = geocoding_response.json()
        latitude = geocoding_response['results'][0]['geometry']['location']['lat']
        longitude = geocoding_response['results'][0]['geometry']['location']['lng']
    except:
        return {"error": "Please enter proper address"}
    
    co_doc = frappe.new_doc("Cash Order")
    co_doc.requester = frappe.session.user
    co_doc.request_time = datetime.datetime.now()
    co_doc.delivery_address = address
    co_doc.delivery_latitude = latitude
    co_doc.delivery_longitude = longitude
    co_doc.amount = amount
    co_doc.status = "Requested"
    co_doc.insert()
    frappe.db.commit()

    # get all cash points in vicnity

    #cash_points = frappe.get_all("Cash Points", filters=[["Cash Points", "latitude",">",latitude - 0.02],["Cash Points", "latitude","<",latitude + 0.02],["Cash Points", "longitude",">",longitude - 0.02],["Cash Points", "longitude","<",longitude + 0.02]], fields=["name"])

    cash_points = frappe.get_all("Cash Points", fields=["name"])
    if len(cash_points) == 0:
        return {"error": "Sorry, No Cash Points Available"}

    publishing_time = time.time()
    published_fr = []
    for cp in cash_points:
        fr_doc = frappe.new_doc("Fulfilment Request")
        fr_doc.cash_order = co_doc.name
        fr_doc.to = cp["name"]
        fr_doc.status = "Sent Out"
        fr_doc.insert()
        published_fr.append(fr_doc.name)

    frappe.db.commit()
    while True:
        frappe.db.commit()
        updated_doc = frappe.get_doc("Cash Order", co_doc.name)
        if updated_doc.status != "Requested":
            fulfiler_cash_point = frappe.get_doc("Cash Points",updated_doc.fulfilled_by)
            return {
                "error": "", 
                "co_name": updated_doc.name, 
                "source_latitude": fulfiler_cash_point.latitude,
                "source_longitude": fulfiler_cash_point.longitude,
                "destination_latitude": updated_doc.delivery_latitude,
                "destination_longitude": updated_doc.delivery_longitude
            }
        elif time.time() - publishing_time > 60:
            for fr_name in published_fr:
                failed_fr = frappe.get_doc("Fulfilment Request", fr_name)
                failed_fr.status = "Unfulfilled"
                failed_fr.save()
            return {"error": "Sorry, Please try again later"}
        time.sleep(10)


@frappe.whitelist()
def confirm_reciept(co_name):
    co_doc = frappe.get_doc("Cash Order", co_name)
    co_doc.requester_delivery_confirmation = True
    co_doc.save()
    return 200
