import frappe
import datetime

@frappe.whitelist()
def fetch_orders():
    orders = frappe.db.sql("""
        SELECT 
            tco.delivery_address,
            tco.delivery_latitude,
            tco.delivery_longitude,
            tco.requester,
            tco.amount,
            tfr.name
        FROM `tabFulfilment Request` tfr
        INNER JOIN `tabCash Points` tcp
        ON tfr.to = tcp.name
        INNER JOIN `tabCash Order` tco
        ON tco.name = tfr.cash_order
        WHERE tfr.status = "Sent Out"
        AND tcp.owner = '{0}'
    """.format(frappe.session.user), as_dict = True)
    return {"available_orders": orders}

@frappe.whitelist()
def accept_order(fr_name):
    fulfilment_request = frappe.get_doc("Fulfilment Request", fr_name)
    fulfilment_request.status = "Accepted"    
    fulfilment_request.save()

    cash_order = frappe.get_doc("Cash Order", fulfilment_request.cash_order)
    cash_order.fulfilled_by = fulfilment_request.to
    cash_order.status = "In Transit"
    cash_order.fulfilment_time = datetime.datetime.now()

    cash_order.save()

    cash_point = frappe.get_doc("Cash Points", fulfilment_request.to)
    return {
        "source_latitude": cash_point.latitude,
        "source_longitude": cash_point.longitude,
        "destination_latitude": cash_order.delivery_latitude,
        "destination_longitude": cash_order.delivery_longitude,
        "co_name": cash_order.name,
    }

@frappe.whitelist()
def accept_cash_order(co_name):
    valid_fr = frappe.db.sql("""
        SELECT tfr.name
        FROM `tabFulfilment Request` tfr
        INNER JOIN `tabCash Order` tco
        ON tfr.cash_order = tco.name
        INNER JOIN `tabCash Points` tcp
        ON tcp.name = tfr.to
        WHERE tcp.owner = '{0}'
        AND tco.name = '{1}'
    """.format(frappe.session.user, co_name), as_dict=True)
    fulfilment_request = frappe.get_doc("Fulfilment Request", valid_fr[0]["name"])
    fulfilment_request.status = "Accepted"    
    fulfilment_request.save()

    cash_order = frappe.get_doc("Cash Order", fulfilment_request.cash_order)
    cash_order.fulfilled_by = fulfilment_request.to
    cash_order.status = "In Transit"
    cash_order.fulfilment_time = datetime.datetime.now()

    cash_order.save()

    cash_point = frappe.get_doc("Cash Points", fulfilment_request.to)
    return {
        "source_latitude": cash_point.latitude,
        "source_longitude": cash_point.longitude,
        "destination_latitude": cash_order.delivery_latitude,
        "destination_longitude": cash_order.delivery_longitude,
        "co_name": cash_order.name,
    }

@frappe.whitelist()
def confirm_delivery(co_name):
    co_doc = frappe.get_doc("Cash Order", co_name)
    co_doc.da_delivery_confirmation = True
    co_doc.save()
    return 200