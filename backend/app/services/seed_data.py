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
            "address": "Plot No. 1, Industrial Park, Sandur Road, Sriperumbudur",
            "city": "Kanchipuram",
            "state": "Tamil Nadu",
            "pincode": "602105",
            "country": "India",
            "phone": "+91-44-67123000",
            "email": "contact.india@flextronics.com"
        },
        {
            "name": "Brother Industries (Vietnam) Ltd.",
            "address": "Phuc Dien Industrial Zone, Cam Giay District",
            "city": "Hai Duong",
            "state": "Hai Duong",
            "pincode": "170000",
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
            "complaint_text": "Customer Care Division",
            "complaint_address": "Unit No 401 & 402, 4th Floor, Alpha Building, Hiranandani Gardens, Powai, Mumbai - 400076",
            "email": "customercare@brother.in",
            "telephone": "1-800-222-422",
            "toll_free_number": "1800-209-8904",
            "whatsapp_number": "+91-9967554433",
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
            "default_generic_name": "ALL-IN-ONE COMPUTER",
            "default_country_of_origin": "India",
            "default_net_qty": "1 N",
            "default_pack_contents": "All-In-One Computer 1 N, Power Adapter 1 N, Keyboard 1 N, Mouse 1 N"
        },
        {
            "name": "Printer",
            "description": "Single-function and Multi-function Laser Printers",
            "default_warranty": "5 Years",
            "default_generic_name": "LASER PRINTER",
            "default_country_of_origin": "Vietnam",
            "default_net_qty": "1 N",
            "default_pack_contents": "Laser Printer 1 N, Power Cable 1 N, USB Cable 1 N, Toner Cartridge 1 N"
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
            "product_number": "HP-PS4-AIO-G1I",
            "mfg_name": "Flextronics Technologies India Pvt. Ltd.",
            "cc_name": "HP India Customer Care",
            "warranty_name": "5 Years",
            "country_of_origin": "India",
            "generic_name": "ALL-IN-ONE COMPUTER",
            "net_quantity": "1 N",
            "default_mrp": 128500.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "All-In-One Computer 1 N, Power Adapter 1 N, Keyboard 1 N, Wireless Mouse 1 N",
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
            "product_number": "BR-DCPL5660DN",
            "mfg_name": "Brother Industries (Vietnam) Ltd.",
            "cc_name": "Brother India Support Helpdesk",
            "warranty_name": "5 Years",
            "country_of_origin": "Vietnam",
            "generic_name": "MONO MULTI-FUNCTION PRINTER",
            "net_quantity": "1 N",
            "default_mrp": 46990.0,
            "tax_text": "Incl. of all Taxes",
            "pack_contents": "Multi-Function Laser Printer 1 N, Toner Cartridge 1 N, Drum Unit 1 N, Power Cord 1 N, USB Cable 1 N",
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
    default_template = await templates_coll.find_one({"name": "Standard Compliance Label (100x150mm)"})
    if not default_template:
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
        t_doc = {
            "id": str(uuid.uuid4()),
            "name": "Standard Compliance Label (100x150mm)",
            "category_id": "",
            "category_name": "Universal / All Categories",
            "width_mm": 100.0,
            "height_mm": 150.0,
            "fields": fields,
            "is_default": True,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        await templates_coll.insert_one(t_doc)
