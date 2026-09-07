import datetime
import logging
import uuid
from backend.app.database.mongodb import db_manager
from backend.app.core.security import get_password_hash
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

async def seed_initial_data():
    users_coll = db_manager.get_collection("users")
    categories_coll = db_manager.get_collection("categories")
    manufacturers_coll = db_manager.get_collection("manufacturers")
    customer_care_coll = db_manager.get_collection("customer_care")
    warranties_coll = db_manager.get_collection("warranties")
    products_coll = db_manager.get_collection("products")
    templates_coll = db_manager.get_collection("label_templates")
    settings_coll = db_manager.get_collection("settings")

    # 1. Seed Default Admin User
    if settings.DEFAULT_ADMIN_EMAIL and settings.DEFAULT_ADMIN_PASSWORD:
        try:
            if len(settings.DEFAULT_ADMIN_PASSWORD.encode("utf-8")) > 72:
                raise ValueError("DEFAULT_ADMIN_PASSWORD is too long for bcrypt.")

            admin = await users_coll.find_one({"email": settings.DEFAULT_ADMIN_EMAIL})
            password_hash = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)
        except Exception as exc:
            logger.error("Skipping admin seed because password hashing failed: %s", exc)
        else:
            admin_doc = {
                "email": settings.DEFAULT_ADMIN_EMAIL,
                "password_hash": password_hash,
                "name": "System Administrator",
                "role": "admin",
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            if not admin:
                admin_doc["id"] = str(uuid.uuid4())
                admin_doc["created_at"] = datetime.datetime.utcnow().isoformat()
                await users_coll.insert_one(admin_doc)
            else:
                await users_coll.update_one({"email": settings.DEFAULT_ADMIN_EMAIL}, {"$set": admin_doc})

    # 2. Seed Settings
    existing_settings = await settings_coll.find_one({"id": "default_settings"})
    if not existing_settings:
        await settings_coll.insert_one({
            "id": "default_settings",
            "app_name": "RIT",
            "company_name": "RIT Precision Suite Pvt. Ltd.",
            "logo_url": "/rit-logo.svg",
            "default_currency": "₹",
            "default_country": "India",
            "default_label_width": 100.0,
            "default_label_height": 150.0,
            "updated_at": datetime.datetime.utcnow().isoformat()
        })

    # 3. Seed Warranties
    warranty_list = [
        {"name": "1 Year", "duration": "1 Year"},
        {"name": "2 Years", "duration": "2 Years"},
        {"name": "3 Years", "duration": "3 Years"},
        {"name": "5 Years", "duration": "5 Years"},
    ]
    warranty_map = {}
    for w in warranty_list:
        found = await warranties_coll.find_one({"name": w["name"]})
        if not found:
            doc_id = str(uuid.uuid4())
            w_doc = {
                "id": doc_id,
                "name": w["name"],
                "duration": w["duration"],
                "created_at": datetime.datetime.utcnow().isoformat(),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            await warranties_coll.insert_one(w_doc)
            warranty_map[w["name"]] = doc_id
        else:
            warranty_map[w["name"]] = found["id"] if "id" in found else str(found.get("_id"))

    # 4. Seed Manufacturers
    manufacturers_data = [
        {
            "name": "Flextronics Technologies India Pvt. Ltd.",
            "address": "Plot No.3, PhaseII SIPCOT Industrial Park, DTA Sandavellur C Village, Sriperumbudur Taluk",
            "city": "Kanchipuram",
            "state": "Tamil Nadu",
            "pincode": "602106",
            "country": "India",
            "phone": "+91-44-67123000",
            "email": "contact.india@flextronics.com"
        },
        {
            "name": "Brother Industries (Vietnam) Ltd.",
            "address": "Phuc Dien Industrial Zone, Mao Dien Commune",
            "city": "Hai Phong City",
            "state": "",
            "pincode": "174700",
            "country": "Vietnam",
            "phone": "+84-220-3777-100",
            "email": "info@brother.vn"
        },
        {
            "name": "Canon Inc. High-Tech Precision Plant",
            "address": "30-2 Shimomaruko 3-chome, Ohta-ku",
            "city": "Tokyo",
            "state": "Tokyo",
            "pincode": "146-8501",
            "country": "Japan",
            "phone": "+81-3-3758-2111",
            "email": "inquiry@canon.co.jp"
        },
        {
            "name": "Quick Heal Technologies Limited (Seqrite)",
            "address": "Marvel Edge, 7th Floor, Viman Nagar",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411014",
            "country": "India",
            "phone": "1800-121-7377",
            "email": "support@seqrite.com"
        }
    ]
    mfg_map = {}
    for m in manufacturers_data:
        found = await manufacturers_coll.find_one({"name": m["name"]})
        if not found:
            doc_id = str(uuid.uuid4())
            m_doc = {
                "id": doc_id,
                **m,
                "created_at": datetime.datetime.utcnow().isoformat(),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            await manufacturers_coll.insert_one(m_doc)
            mfg_map[m["name"]] = doc_id
        else:
            mfg_map[m["name"]] = found["id"] if "id" in found else str(found.get("_id"))

    # 5. Seed Customer Care Profiles
    cc_data = [
        {
            "profile_name": "HP India Customer Care",
            "complaint_text": "Customer Care",
            "complaint_address": "Building 2, Think Campus, Electronic City Phase 1, Bangalore, Karnataka - 560100",
            "email": "in.contact@hp.com",
            "telephone": "1-800-425-4999",
            "toll_free_number": "1800-258-7170",
            "whatsapp_number": "+91-8867619377",
            "website": "www.hp.com/in"
        },
        {
            "profile_name": "Brother India Support Helpdesk",
            "complaint_text": "Customer Care Executive",
            "complaint_address": "BROTHER INTERNATIONAL (INDIA) PVT LTD, NOS. 801 AND 802, 8TH FLOOR, ALPHA BUILDING, HIRANANDANI GARDENS, POWAI, MUMBAI - 400 076, MAHARASHTRA",
            "email": "customercare@brother.in",
            "telephone": "1800 222 422 (ALL BSNL & MTNL CUSTOMERS)",
            "toll_free_number": "1800 209 8904 (OTHER LANDLINE AND MOBILE CUSTOMERS)",
            "whatsapp_number": "",
            "website": "www.brother.in"
        },
        {
            "profile_name": "Canon India Master Service Cell",
            "complaint_text": "Executive Customer Service Cell",
            "complaint_address": "7th Floor, Tower B, Building No. 5, DLF Cyber City, Gurgaon, Haryana - 122002",
            "email": "ci.callcenter@canon.co.in",
            "telephone": "1-800-180-3366",
            "toll_free_number": "1860-180-3366",
            "whatsapp_number": "+91-9988776655",
            "website": "www.canon.co.in"
        },
        {
            "profile_name": "Seqrite Security Support Desk",
            "complaint_text": "Technical Complaints Desk",
            "complaint_address": "Marvel Edge, 7th Floor, Viman Nagar, Pune, Maharashtra - 411014",
            "email": "support@seqrite.com",
            "telephone": "1-800-121-7377",
            "toll_free_number": "1800-121-7377",
            "whatsapp_number": "+91-9011002233",
            "website": "www.seqrite.com"
        }
    ]
    cc_map = {}
    for c in cc_data:
        found = await customer_care_coll.find_one({"profile_name": c["profile_name"]})
        if not found:
            doc_id = str(uuid.uuid4())
            c_doc = {
                "id": doc_id,
                **c,
                "created_at": datetime.datetime.utcnow().isoformat(),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            await customer_care_coll.insert_one(c_doc)
            cc_map[c["profile_name"]] = doc_id
        else:
            cc_map[c["profile_name"]] = found["id"] if "id" in found else str(found.get("_id"))

    # 6. Seed Categories
    cat_data = [
        {
            "name": "Desktop Computer",
            "description": "High performance tower & business desktop workstations",
            "default_warranty": "5 Years",
            "default_generic_name": "DESKTOP COMPUTER",
            "default_country_of_origin": "India",
            "default_net_qty": "1 N",
            "default_pack_contents": "Desktop Computer 1 N, Central Processing Unit 1 N, Cable Set 1 N, Keyboard 1 N, Mouse 1 N"
        },
        {
            "name": "AIO Computer",
            "description": "Space-saving All-In-One Desktop systems",
            "default_warranty": "5 Years",
            "default_generic_name": "ALL IN ONE COMPUTER",
            "default_country_of_origin": "India",
            "default_net_qty": "1 N",
            "default_pack_contents": "60.45 CM ALL IN ONE COMPUTER 1N,\nCENTRAL PROCESSING UNIT 1N,\nCABLE SET 1N,\nTOWERSTAND 1N,KEYBOARD 1N,MOUSE 1N"
        },
        {
            "name": "Printer",
            "description": "Single-function and Multi-function Laser Printers",
            "default_warranty": "5 Years",
            "default_generic_name": "LASER MFC PRINTER",
            "default_country_of_origin": "Vietnam",
            "default_net_qty": "1N",
            "default_pack_contents": "1N Printer, 1N Power Cable, 1N Toner, 1N Drum, 1N Guide"
        },
        {
            "name": "Scanner",
            "description": "High speed sheet-fed and flatbed document scanners",
            "default_warranty": "5 Years",
            "default_generic_name": "DOCUMENT SCANNER",
            "default_country_of_origin": "Japan",
            "default_net_qty": "1 N",
            "default_pack_contents": "Document Scanner 1 N, AC Adapter 1 N, USB Cable 1 N"
        },
        {
            "name": "Photocopier",
            "description": "Enterprise digital multifunction photocopiers",
            "default_warranty": "5 Years",
            "default_generic_name": "DIGITAL PHOTOCOPIER",
            "default_country_of_origin": "Thailand",
            "default_net_qty": "1 N",
            "default_pack_contents": "Main Photocopier Unit 1 N, Platen Cover 1 N, Power Cable 1 N"
        },
        {
            "name": "Antivirus",
            "description": "Enterprise Endpoint Protection and Security Suites",
            "default_warranty": "5 Years",
            "default_generic_name": "SECURITY SOFTWARE",
            "default_country_of_origin": "India",
            "default_net_qty": "1 N",
            "default_pack_contents": "Software License Key 1 N, Quick Start Guide 1 N"
        }
    ]
    cat_map = {}
    for cat in cat_data:
        found = await categories_coll.find_one({"name": cat["name"]})
        if not found:
            doc_id = str(uuid.uuid4())
            cat_doc = {
                "id": doc_id,
                **cat,
                "created_at": datetime.datetime.utcnow().isoformat(),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            await categories_coll.insert_one(cat_doc)
            cat_map[cat["name"]] = doc_id
        else:
            cat_map[cat["name"]] = found["id"] if "id" in found else str(found.get("_id"))

    # 7. Seed Demo Products
    products_data = [
        {
            "name": "HP ProDesk 2 G1a Tower",
            "category_name": "Desktop Computer",
            "brand": "HP",
            "product_number": "HP-PD-2G1A-TW",
            "mfg_name": "Flextronics Technologies India Pvt. Ltd.",
            "cc_name": "HP India Customer Care",
            "warranty_name": "5 Years",
            "country_of_origin": "India",
            "generic_name": "DESKTOP COMPUTER",
            "net_quantity": "1 N",
            "default_mrp": 114229.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "Desktop Computer 1 N, Central Processing Unit 1 N, Cable Set 1 N, Keyboard 1 N, Mouse 1 N",
            "status": "Active"
        },
        {
            "name": "HP ProStudio 4 AIO G1i",
            "category_name": "AIO Computer",
            "brand": "HP",
            "product_number": "D2UP4PT#ACJ",
            "mfg_name": "Flextronics Technologies India Pvt. Ltd.",
            "cc_name": "HP India Customer Care",
            "warranty_name": "5 Years",
            "country_of_origin": "India",
            "generic_name": "ALL IN ONE COMPUTER",
            "net_quantity": "1 N",
            "default_mrp": 90000.0,
            "tax_text": "Incl.of all Taxes",
            "pack_contents": "60.45 CM ALL IN ONE COMPUTER 1N,\nCENTRAL PROCESSING UNIT 1N,\nCABLE SET 1N,\nTOWERSTAND 1N,KEYBOARD 1N,MOUSE 1N",
            "status": "Active"
        },
        {
            "name": "Seqrite EPS Suite",
            "category_name": "Antivirus",
            "brand": "Seqrite",
            "product_number": "SEQ-EPS-5Y",
            "mfg_name": "Quick Heal Technologies Limited (Seqrite)",
            "cc_name": "Seqrite Security Support Desk",
            "warranty_name": "5 Years",
            "country_of_origin": "India",
            "generic_name": "SECURITY SOFTWARE",
            "net_quantity": "1 N",
            "default_mrp": 8499.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "License Key Card 1 N, User Manual 1 N",
            "status": "Active"
        },
        {
            "name": "Brother DCP-L5660DN",
            "category_name": "Printer",
            "brand": "Brother",
            "product_number": "DCP-L5660DN",
            "mfg_name": "Brother Industries (Vietnam) Ltd.",
            "cc_name": "Brother India Support Helpdesk",
            "warranty_name": "5 Years",
            "country_of_origin": "Vietnam",
            "generic_name": "LASER MFC PRINTER",
            "net_quantity": "1N",
            "default_mrp": 59990.0,
            "tax_text": "Inclusive of all Taxes",
            "pack_contents": "1N Printer, 1N Power Cable, 1N Toner, 1N Drum, 1N Guide",
            "status": "Active"
        },
        {
            "name": "Brother HL-L5210DN",
            "category_name": "Printer",
            "brand": "Brother",
            "product_number": "BR-HLL5210DN",
            "mfg_name": "Brother Industries (Vietnam) Ltd.",
            "cc_name": "Brother India Support Helpdesk",
            "warranty_name": "5 Years",
            "country_of_origin": "Vietnam",
            "generic_name": "MONO SINGLE FUNCTION PRINTER",
            "net_quantity": "1 N",
            "default_mrp": 29500.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "Single Function Laser Printer 1 N, Toner Cartridge 1 N, Drum Unit 1 N, Power Cord 1 N",
            "status": "Active"
        },
        {
            "name": "Brother DCP-L3560CDW",
            "category_name": "Printer",
            "brand": "Brother",
            "product_number": "BR-DCPL3560CDW",
            "mfg_name": "Brother Industries (Vietnam) Ltd.",
            "cc_name": "Brother India Support Helpdesk",
            "warranty_name": "5 Years",
            "country_of_origin": "Vietnam",
            "generic_name": "COLOUR MULTI-FUNCTION LASERJET",
            "net_quantity": "1 N",
            "default_mrp": 54900.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "Colour Laser Multi-Function Printer 1 N, 4 Starter Toner Cartridges 1 N, Drum Unit 1 N, Power Cord 1 N",
            "status": "Active"
        },
        {
            "name": "DRC240",
            "category_name": "Scanner",
            "brand": "Canon",
            "product_number": "CN-DRC-240",
            "mfg_name": "Canon Inc. High-Tech Precision Plant",
            "cc_name": "Canon India Master Service Cell",
            "warranty_name": "5 Years",
            "country_of_origin": "Japan",
            "generic_name": "DOCUMENT SCANNER",
            "net_quantity": "1 N",
            "default_mrp": 42500.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "Document Scanner 1 N, AC Adapter 1 N, USB 2.0 Cable 1 N, Setup Guide 1 N",
            "status": "Active"
        },
        {
            "name": "Canon iR2930",
            "category_name": "Photocopier",
            "brand": "Canon",
            "product_number": "CN-IR2930",
            "mfg_name": "Canon Inc. High-Tech Precision Plant",
            "cc_name": "Canon India Master Service Cell",
            "warranty_name": "5 Years",
            "country_of_origin": "Thailand",
            "generic_name": "DIGITAL MULTI-FUNCTION PHOTOCOPIER",
            "net_quantity": "1 N",
            "default_mrp": 215000.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "Main Unit Photocopier 1 N, Platen Cover 1 N, Starter Toner 1 N, Power Cable 1 N",
            "status": "Active"
        }
    ]

    for p in products_data:
        found = await products_coll.find_one({"name": p["name"]})
        if not found:
            cat_id = cat_map.get(p["category_name"], "")
            mfg_id = mfg_map.get(p["mfg_name"], "")
            cc_id = cc_map.get(p["cc_name"], "")
            w_id = warranty_map.get(p["warranty_name"], "")

            p_doc = {
                "id": str(uuid.uuid4()),
                "name": p["name"],
                "category_id": cat_id,
                "category_name": p["category_name"],
                "brand": p["brand"],
                "product_number": p["product_number"],
                "manufacturer_id": mfg_id,
                "manufacturer_name": p["mfg_name"],
                "customer_care_id": cc_id,
                "customer_care_name": p["cc_name"],
                "warranty_id": w_id,
                "warranty_name": p["warranty_name"],
                "country_of_origin": p["country_of_origin"],
                "generic_name": p["generic_name"],
                "net_quantity": p["net_quantity"],
                "default_mrp": p["default_mrp"],
                "tax_text": p["tax_text"],
                "pack_contents": p["pack_contents"],
                "status": p["status"],
                "created_at": datetime.datetime.utcnow().isoformat(),
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            await products_coll.insert_one(p_doc)

    # 8. Seed Default Template
    fields = [
        {"key": "manufactured_by", "label": "Manufactured By", "enabled": True, "font_size": 11, "bold": True, "alignment": "left", "order": 1},
        {"key": "manufactured_for", "label": "Manufactured For", "enabled": True, "font_size": 11, "bold": True, "alignment": "left", "order": 2},
        {"key": "for_complaints", "label": "For Complaints", "enabled": True, "font_size": 11, "bold": True, "alignment": "left", "order": 3},
        {"key": "email", "label": "Email", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 4},
        {"key": "telephone", "label": "Tel", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 5},
        {"key": "whatsapp", "label": "WhatsApp", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 6},
        {"key": "month_year", "label": "Month & Year of Manufacture", "enabled": True, "font_size": 11, "bold": True, "alignment": "left", "order": 7},
        {"key": "mrp", "label": "MRP (Incl. of all Taxes)", "enabled": True, "font_size": 13, "bold": True, "alignment": "left", "order": 8},
        {"key": "product_number", "label": "Product No.", "enabled": True, "font_size": 11, "bold": True, "alignment": "left", "order": 9},
        {"key": "country_of_origin", "label": "Country of Origin", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 10},
        {"key": "generic_name", "label": "Generic Name", "enabled": True, "font_size": 11, "bold": True, "alignment": "left", "order": 11},
        {"key": "net_quantity", "label": "Net Qty", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 12},
        {"key": "pack_contents", "label": "Pack Contents", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 13}
    ]
    default_template = await templates_coll.find_one({"name": "Standard Compliance Label (100x150mm)"})
    if not default_template:
        t_doc = {
            "id": str(uuid.uuid4()),
            "name": "Standard Compliance Label (100x150mm)",
            "category_id": "",
            "category_name": "Universal / All Categories",
            "width_mm": 100.0,
            "height_mm": 150.0,
            "fields": fields,
            "layout_style": "standard",
            "is_default": True,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        await templates_coll.insert_one(t_doc)

    printer_template = await templates_coll.find_one({"name": "Printer Compliance Label (100x95mm)"})
    if not printer_template:
        legacy_printer_template = await templates_coll.find_one({
            "name": {"$in": ["Printer Compliance Label (100x60mm)", "Printer Compliance Label (100x80mm)", "Printer Compliance Label (100x150mm)"]}
        })
        if legacy_printer_template:
            await templates_coll.update_one(
                {"id": legacy_printer_template["id"]},
                {"$set": {
                    "name": "Printer Compliance Label (100x95mm)",
                    "width_mm": 100.0,
                    "height_mm": 95.0,
                    "layout_style": "printer",
                    "updated_at": datetime.datetime.utcnow().isoformat()
                }}
            )
            printer_template = await templates_coll.find_one({"name": "Printer Compliance Label (100x95mm)"})
    if not printer_template:
        printer_fields = fields + [
            {"key": "importer_name", "label": "Importers Name & Address", "enabled": True, "font_size": 9, "bold": True, "alignment": "left", "order": 14, "default_value": ""},
            {"key": "imported_in", "label": "Imported In", "enabled": True, "font_size": 9, "bold": False, "alignment": "left", "order": 15, "default_value": ""},
            {"key": "customer_care_other_numbers", "label": "Customer Care - Other Numbers", "enabled": True, "font_size": 9, "bold": False, "alignment": "left", "order": 16, "default_value": ""},
            {"key": "barcode_text", "label": "Barcode", "enabled": True, "font_size": 10, "bold": True, "alignment": "left", "order": 17, "default_value": ""},
            {"key": "recycling_information", "label": "Recycling Information", "enabled": True, "font_size": 8, "bold": False, "alignment": "left", "order": 18, "default_value": ""}
        ]
        await templates_coll.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Printer Compliance Label (100x95mm)",
            "category_id": cat_map.get("Printer", ""),
            "category_name": "Printer",
            "width_mm": 100.0,
            "height_mm": 95.0,
            "fields": printer_fields,
            "layout_style": "printer",
            "is_default": False,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        })
        printer_template = await templates_coll.find_one({"name": "Printer Compliance Label (100x95mm)"})

    aio_template = await templates_coll.find_one({"name": "AIO Computer Tall Label (65x150mm)"})
    if not aio_template:
        aio_fields = fields + [
            {"key": "manufactured_for_name", "label": "Manufactured For Name", "enabled": True, "font_size": 10, "bold": True, "alignment": "left", "order": 14, "default_value": ""},
            {"key": "manufactured_for_address", "label": "Manufactured For Address", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 15, "default_value": ""}
        ]
        await templates_coll.insert_one({
            "id": str(uuid.uuid4()),
            "name": "AIO Computer Tall Label (65x150mm)",
            "category_id": cat_map.get("AIO Computer", ""),
            "category_name": "AIO Computer",
            "width_mm": 65.0,
            "height_mm": 150.0,
            "fields": aio_fields,
            "layout_style": "aio",
            "is_default": False,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        })
        aio_template = await templates_coll.find_one({"name": "AIO Computer Tall Label (65x150mm)"})

    # 9. Seed Brother Printer Label
    brother_product = await products_coll.find_one({"name": "Brother DCP-L5660DN"})
    brother_category_id = cat_map.get("Printer", "")
    brother_template = printer_template or await templates_coll.find_one({"name": "Printer Compliance Label (100x95mm)"})
    existing_brother_label = await db_manager.get_collection("labels").find_one({
        "product_name": "Brother DCP-L5660DN",
        "month": "January",
        "year": "2026"
    })
    if existing_brother_label:
        await db_manager.get_collection("labels").update_one(
            {"id": existing_brother_label["id"]},
            {"$set": {
                "template_id": brother_template.get("id", "") if brother_template else existing_brother_label.get("template_id", ""),
                "snapshot.width_mm": 100.0,
                "snapshot.height_mm": 95.0,
                "snapshot.layoutStyle": "printer",
                "snapshot.currency": "₹",
                "updated_at": datetime.datetime.utcnow().isoformat()
            }}
        )
    if brother_product and not existing_brother_label:
        now = datetime.datetime.utcnow().isoformat()
        template_fields = brother_template.get("fields", []) if brother_template else []
        template_field_keys = {field.get("key") for field in template_fields}
        extra_printer_fields = [
            {"key": "importer_name", "label": "Imported By", "enabled": True, "font_size": 9, "bold": True, "alignment": "left", "order": 14, "default_value": ""},
            {"key": "imported_in", "label": "Imported In", "enabled": True, "font_size": 9, "bold": False, "alignment": "left", "order": 15, "default_value": ""},
            {"key": "customer_care_other_numbers", "label": "Customer Care - Other Numbers", "enabled": True, "font_size": 9, "bold": False, "alignment": "left", "order": 16, "default_value": ""},
            {"key": "website", "label": "Website", "enabled": True, "font_size": 9, "bold": False, "alignment": "left", "order": 17, "default_value": ""},
            {"key": "barcode_text", "label": "Barcode", "enabled": True, "font_size": 10, "bold": True, "alignment": "left", "order": 18, "default_value": ""},
            {"key": "recycling_information", "label": "Recycling Information", "enabled": True, "font_size": 8, "bold": False, "alignment": "left", "order": 19, "default_value": ""}
        ]
        label_fields = template_fields + [
            field for field in extra_printer_fields
            if field["key"] not in template_field_keys
        ]
        await db_manager.get_collection("labels").insert_one({
            "id": str(uuid.uuid4()),
            "category_id": brother_product.get("category_id") or brother_category_id,
            "category_name": "Printer",
            "product_id": brother_product.get("id") or str(brother_product.get("_id")),
            "product_name": "Brother DCP-L5660DN",
            "template_id": brother_template.get("id", "") if brother_template else "",
            "month": "January",
            "year": "2026",
            "mrp": 59990.0,
            "copies": 1,
            "snapshot": {
                "productName": "Brother DCP-L5660DN",
                "brand": "Brother",
                "productNumber": "DCP-L5660DN",
                "manufacturerName": "BROTHER INDUSTRIES (VIETNAM) LTD.",
                "manufacturerAddress": "Phuc Dien Industrial Zone, Mao Dien Commune, Hai Phong City, Viet Nam - 174700",
                "customerCareProfile": "Customer Care Executive",
                "customerCareAddress": "Same as Importer Above",
                "customerCareEmail": "CUSTOMERCARE@BROTHER.IN",
                "customerCarePhone": "1800 222 422 (ALL BSNL & MTNL CUSTOMERS)",
                "customerCareTollFree": "1800 209 8904 (OTHER LANDLINE AND MOBILE CUSTOMERS)",
                "customerCareWhatsApp": "",
                "customerCareWebsite": "WWW.BROTHER.IN",
                "countryOfOrigin": "Vietnam",
                "genericName": "LASER MFC PRINTER",
                "netQuantity": "1N",
                "mrp": 59990.0,
                "currency": "₹",
                "taxText": "Inclusive of all Taxes",
                "packContents": "1N Printer, 1N Power Cable, 1N Toner, 1N Drum, 1N Guide",
                "month": "January",
                "year": "2026",
                "width_mm": 100.0,
                "height_mm": 95.0,
                "fields": label_fields,
                "layoutStyle": "printer",
                "importer_name": "BROTHER INTERNATIONAL (INDIA) PVT LTD, NOS. 801 AND 802, 8TH FLOOR, ALPHA BUILDING, HIRANANDANI GARDENS, POWAI, MUMBAI - 400 076, MAHARASHTRA",
                "imported_in": "January 2026",
                "customer_care_other_numbers": "1800 209 8904 (OTHER LANDLINE AND MOBILE CUSTOMERS)",
                "website": "WWW.BROTHER.IN",
                "barcode_text": "8C5L5L00145",
                "recycling_information": "For Recycling of your product, please visit: www.brother.in"
            },
            "created_by": "Admin",
            "created_at": now
        })

    # 10. Seed HP AIO Label
    aio_product = await products_coll.find_one({"name": "HP ProStudio 4 AIO G1i"})
    aio_category_id = cat_map.get("AIO Computer", "")
    existing_aio_label = await db_manager.get_collection("labels").find_one({
        "product_name": "HP ProStudio 4 AIO G1i",
        "month": "Feb",
        "year": "2026"
    })
    if aio_product and not existing_aio_label:
        now = datetime.datetime.utcnow().isoformat()
        aio_fields = aio_template.get("fields", []) if aio_template else [
            {"key": "manufactured_for_name", "label": "Manufactured For Name", "enabled": True, "font_size": 10, "bold": True, "alignment": "left", "order": 14, "default_value": ""},
            {"key": "manufactured_for_address", "label": "Manufactured For Address", "enabled": True, "font_size": 10, "bold": False, "alignment": "left", "order": 15, "default_value": ""}
        ]
        await db_manager.get_collection("labels").insert_one({
            "id": str(uuid.uuid4()),
            "category_id": aio_product.get("category_id") or aio_category_id,
            "category_name": "AIO Computer",
            "product_id": aio_product.get("id") or str(aio_product.get("_id")),
            "product_name": "HP ProStudio 4 AIO G1i",
            "template_id": aio_template.get("id", "") if aio_template else "",
            "month": "Feb",
            "year": "2026",
            "mrp": 90000.0,
            "copies": 1,
            "snapshot": {
                "productName": "HP ProStudio 4 AIO G1i",
                "brand": "HP",
                "productNumber": "D2UP4PT#ACJ",
                "manufacturerName": "Flextronics Technologies India Pvt. Ltd.",
                "manufacturerAddress": "Plot No.3, PhaseII SIPCOT Industrial Park, DTA Sandavellur C Village, Sriperumbudur Taluk Kanchipuram Tamilnadu - 602106",
                "customerCareProfile": "Customer Care",
                "customerCareAddress": "Same address as above",
                "customerCareEmail": "in.contact@hp.com",
                "customerCarePhone": "1-800-258-7170",
                "customerCareTollFree": "1-800-258-7170",
                "customerCareWhatsApp": "+ 91 22 6101 4560",
                "customerCareWebsite": "",
                "warranty": "5 Years",
                "countryOfOrigin": "India",
                "genericName": "ALL IN ONE COMPUTER",
                "netQuantity": "1 N",
                "mrp": 90000.0,
                "currency": "₹",
                "taxText": "Incl.of all Taxes",
                "packContents": "60.45 CM ALL IN ONE COMPUTER 1N,\nCENTRAL PROCESSING UNIT 1N,\nCABLE SET 1N,\nTOWERSTAND 1N,KEYBOARD 1N,MOUSE 1N",
                "month": "Feb",
                "year": "2026",
                "width_mm": 65.0,
                "height_mm": 150.0,
                "fields": aio_fields,
                "layoutStyle": "aio",
                "manufactured_for_name": "HP India Sales Private Ltd.",
                "manufactured_for_address": "No.24, Kothari Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030"
            },
            "created_by": "Admin",
            "created_at": now
        })
