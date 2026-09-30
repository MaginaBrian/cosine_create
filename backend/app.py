from flask import Flask, current_app, g, jsonify, request, send_file
from flask_cors import CORS
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from io import BytesIO
from pathlib import Path
import json
import os

from completion_pdf import build_completion_pdf
from config import Config
from mailer import send_stage_email
from models import Fabric, Inquiry, Order, Product, User, db, find_user_by_email
from security import check_password, make_token, require_auth, require_role

ADMIN_MOVE_STAGES = ("processing", "produce", "distribute")
STAFF_ROLES = ("admin", "produce", "dispatch")
STAGE_ALIASES = {
    "process": "processing",
    "processing": "processing",
    "idea": "processing",
    "reorder": "processing",
    "brief": "processing",
    "source": "processing",
    "sample": "processing",
    "production": "produce",
    "produce": "produce",
    "dispatch": "distribute",
    "distribute": "distribute",
}
GARMENT_IDS = {
    "oversized-t-shirt",
    "hoodie",
    "sweatshirt",
    "female-sweatpants",
    "male-sweatpants",
    "vest",
    "crop-top",
    "groove-oversized-t-shirt",
    "groove-crop-top",
    "groove-hats",
    "groove-tags",
}
HEIGHTS = {"Short", "Regular", "Tall"}
MWOTAJI_TSHIRT_FABRICS = {
    "Black - T-shirt": "T-shirt",
    "Off White - T-shirt": "T-shirt",
}
MWOTAJI_FLEECE_FABRICS = {
    "Black - Fleece": "Fleece",
    "Teal - Fleece": "Fleece",
}
MWOTAJI_FABRICS_FOR_GARMENT = {
    "oversized-t-shirt": MWOTAJI_TSHIRT_FABRICS,
    "vest": MWOTAJI_TSHIRT_FABRICS,
    "crop-top": MWOTAJI_TSHIRT_FABRICS,
    "hoodie": MWOTAJI_FLEECE_FABRICS,
    "sweatshirt": MWOTAJI_FLEECE_FABRICS,
    "female-sweatpants": MWOTAJI_FLEECE_FABRICS,
    "male-sweatpants": MWOTAJI_FLEECE_FABRICS,
}
GROOVE_SLUG = "the-groove-hangout"
GROOVE_TEE_COLORS = {"White", "Black", "Blue"}
GROOVE_TEE_GARMENTS = {"groove-oversized-t-shirt", "groove-crop-top"}
GROOVE_HAT_OPTIONS = {
    "Bucket hat - Acid wash grey": "Bucket hat",
    "Baseball hat - Acid wash black": "Baseball hat",
}
GROOVE_TAG_COLORS = {"Black", "White", "Green"}
INQUIRY_MAKING = {"Apparel", "Accessories", "Other"}
INQUIRY_STAGES = {"idea", "sample", "produce", "buy", "reorder"}
FABRIC_UNITS = {"m", "kg"}


def canonical_stage(value):
    key = (value or "").strip()
    return STAGE_ALIASES.get(key, key)


def allowed_stage_move(role, previous, stage):
    if previous == stage:
        return True
    if role == "admin" and stage in ADMIN_MOVE_STAGES:
        return True
    if role == "produce":
        return previous == "processing" and stage == "produce"
    if role == "dispatch":
        return previous == "produce" and stage == "distribute"
    return False


def stage_move_error(role):
    if role == "produce":
        return "You can only move orders from Processing to Production"
    if role == "dispatch":
        return "You can only move orders from Production to Dispatch"
    return "You cannot change this stage"


def parse_phone(value):
    phone = (value or "").strip()
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) < 7 or len(phone) > 40:
        return None
    return phone


def parse_email(value):
    email = (value or "").strip().lower()
    if not email or "@" not in email or "." not in email.split("@")[-1]:
        return None
    if len(email) > 255:
        return None
    return email


def ensure_schema():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    statements = []
    if "orders" in tables:
        cols = {col["name"] for col in inspector.get_columns("orders")}
        if "garment" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN garment VARCHAR(80)")
        if "size_breakdown" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN size_breakdown TEXT")
        if "color" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN color VARCHAR(120)")
        if "rib" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN rib VARCHAR(120)")
        if "height" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN height VARCHAR(40)")
        if "fabric" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN fabric VARCHAR(200)")
        if "phone" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN phone VARCHAR(40)")
        if "fabric_id" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN fabric_id INTEGER")
        if "unit" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN unit VARCHAR(20)")
        if "items_json" not in cols:
            statements.append("ALTER TABLE orders ADD COLUMN items_json TEXT")
    if "inquiries" in tables:
        inq_cols = {col["name"] for col in inspector.get_columns("inquiries")}
        if "phone" not in inq_cols:
            statements.append("ALTER TABLE inquiries ADD COLUMN phone VARCHAR(40)")
    for sql in statements:
        db.session.execute(text(sql))
    if statements:
        db.session.commit()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        always_send=True,
        automatic_options=True,
    )

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin", "")
        if origin in app.config["CORS_ORIGINS"]:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
            response.headers["Vary"] = "Origin"
        return response

    @app.before_request
    def handle_cors_preflight():
        if request.method == "OPTIONS" and request.path.startswith("/api/"):
            return ("", 204)

    with app.app_context():
        db.create_all()
        ensure_schema()
        from seed import (
            ensure_client_catalogs,
            ensure_client_users,
            ensure_staff_users,
            ensure_textiles,
            seed_database,
        )

        seed_empty = os.environ.get("SEED_IF_EMPTY", "").lower() in ("1", "true", "yes")
        if seed_empty and User.query.count() == 0 and Order.query.count() == 0:
            seed_database()
        else:
            ensure_textiles()
            ensure_client_users()
            ensure_staff_users()
            ensure_client_catalogs()

    register_routes(app)
    register_cli(app)
    return app


def register_cli(app):
    @app.cli.command("seed")
    def seed_command():
        """Reset the database and load demo users, catalogs, and orders."""
        from seed import seed_database

        creds = seed_database()
        print("Seeded Cosine Create demo data.\n")
        print("Credentials:")
        for row in creds:
            print(f"  {row['email']}  /  {row['password']}  ({row['role']}"
                  f"{', ' + row['brand'] if row['brand'] else ''})")

    @app.cli.command("ensure-catalogs")
    def ensure_catalogs_command():
        """Add missing client catalogs without wiping orders."""
        from seed import ensure_client_catalogs, ensure_client_users, ensure_staff_users, ensure_textiles

        ensure_textiles()
        ensure_client_users()
        ensure_staff_users()
        mwotaji, groove = ensure_client_catalogs()
        print(f"MWOTAJI category products: {len(mwotaji)}")
        print(f"Groove products: {len(groove)}")


def textiles_catalog_product():
    from seed import ensure_textiles_catalog_product

    return ensure_textiles_catalog_product()


def parse_size_quantities(sizes, quantity_fallback):
    if sizes is None:
        try:
            quantity = int(quantity_fallback)
        except (TypeError, ValueError):
            return None, None, (jsonify({"error": "quantity must be a number"}), 400)
        if quantity < 1:
            return None, None, (jsonify({"error": "quantity must be at least 1"}), 400)
        return None, quantity, None
    if not isinstance(sizes, dict):
        return None, None, (jsonify({"error": "sizes must be an object of size to quantity"}), 400)
    cleaned = {}
    total = 0
    for size, qty in sizes.items():
        label = str(size).strip()[:8]
        try:
            n = int(qty)
        except (TypeError, ValueError):
            return None, None, (jsonify({"error": f"invalid quantity for size {size}"}), 400)
        if n < 0:
            return None, None, (jsonify({"error": "size quantities cannot be negative"}), 400)
        if n:
            cleaned[label] = n
            total += n
    if total < 1:
        return None, None, (jsonify({"error": "add a quantity for at least one size"}), 400)
    return cleaned, total, None


def build_apparel_line(user, item):
    raw_product_id = item.get("product_id")
    if raw_product_id is None or raw_product_id == "":
        return None, (jsonify({"error": "product_id is required"}), 400)
    try:
        product_id = int(raw_product_id)
    except (TypeError, ValueError):
        return None, (jsonify({"error": "product_id must be a number"}), 400)

    product = db.session.get(Product, product_id)
    if product is None:
        return None, (jsonify({"error": "Product not found"}), 404)
    if product.client_slug != user.client_slug:
        return None, (jsonify({"error": "You can only order products from your catalog"}), 403)

    sizes, quantity, err = parse_size_quantities(item.get("sizes"), item.get("quantity"))
    if err:
        return None, err

    garment = (item.get("garment") or "").strip() or None
    if garment and garment not in GARMENT_IDS:
        return None, (jsonify({"error": "Unknown garment"}), 400)

    color = (item.get("color") or "").strip() or None
    if not color:
        return None, (jsonify({"error": "A colour is required"}), 400)
    fabric = (item.get("fabric") or "").strip() or None
    if garment in GROOVE_TEE_GARMENTS and color not in GROOVE_TEE_COLORS:
        return None, (jsonify({"error": "Colour must be White, Black or Blue"}), 400)
    if garment == "groove-hats":
        if color not in GROOVE_HAT_OPTIONS:
            return None, (jsonify({"error": "Choose a bucket hat or baseball hat"}), 400)
        fabric = GROOVE_HAT_OPTIONS[color]
    if garment == "groove-tags":
        if color not in GROOVE_TAG_COLORS:
            return None, (jsonify({"error": "Colour must be Black, White or Green"}), 400)
        fabric = "Tag"
    if user.client_slug == "mwotaji":
        allowed = MWOTAJI_FABRICS_FOR_GARMENT.get(garment) or {
            **MWOTAJI_TSHIRT_FABRICS,
            **MWOTAJI_FLEECE_FABRICS,
        }
        if color not in allowed:
            return None, (jsonify({"error": "Choose a fabric from the MWOTAJI list"}), 400)
        fabric = allowed[color]
    height = (item.get("height") or "").strip() or None
    if garment in ("female-sweatpants", "male-sweatpants"):
        if not height:
            return None, (jsonify({"error": "Height is required"}), 400)
        if height not in HEIGHTS:
            return None, (jsonify({"error": "Height must be Short, Regular or Tall"}), 400)
    elif height and height not in HEIGHTS:
        return None, (jsonify({"error": "Height must be Short, Regular or Tall"}), 400)

    return {
        "product_id": product.id,
        "product_name": product.name,
        "garment": garment,
        "quantity": quantity,
        "sizes": sizes,
        "color": color,
        "height": height,
        "fabric": fabric,
    }, None


def create_garment_order(user, body):
    raw_items = body.get("items")
    if raw_items is not None:
        if not isinstance(raw_items, list) or not raw_items:
            return jsonify({"error": "Add at least one product to the order"}), 400
        sources = raw_items
    else:
        sources = [body]

    lines = []
    for item in sources:
        if not isinstance(item, dict):
            return jsonify({"error": "Each item must be an object"}), 400
        line, err = build_apparel_line(user, item)
        if err:
            return err
        lines.append(line)

    first = lines[0]
    product = db.session.get(Product, first["product_id"])
    quantity = sum(line["quantity"] for line in lines)

    stage = "processing"

    notes = (body.get("notes") or "").strip() or None
    phone = parse_phone(body.get("phone"))
    if not phone:
        return jsonify({"error": "A phone number is required"}), 400

    contact_name = (body.get("name") or user.name).strip()
    email = parse_email(body.get("email") or getattr(user, "session_email", None) or user.email)
    brand = (body.get("brand") or user.brand or "").strip()
    client_slug = user.client_slug
    if product and product.client_slug == GROOVE_SLUG:
        brand = (body.get("brand") or product.brand or user.brand or "The Groove Hangout").strip()
        client_slug = GROOVE_SLUG

    order = Order(
        user_id=user.id,
        product_id=product.id,
        client_slug=client_slug,
        contact_name=contact_name,
        brand=brand,
        email=email,
        phone=phone,
        making=(body.get("making") or "Apparel").strip() or "Apparel",
        quantity=quantity,
        stage=stage,
        notes=notes,
        garment=first["garment"],
        size_breakdown=json.dumps(first["sizes"]) if first["sizes"] else None,
        color=first["color"],
        height=first["height"],
        fabric=first["fabric"],
        items_json=json.dumps(lines),
        unit="pcs",
    )
    if not order.contact_name or not order.brand or not order.email:
        return jsonify({"error": "name, brand, and email are required"}), 400

    try:
        db.session.add(order)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Could not save the order")
        return jsonify({"error": "Could not save the order"}), 500
    return jsonify({"order": order.to_public()}), 201


def create_fabric_order(user, body):
    fabric_id = body.get("fabric_id")
    if fabric_id is None:
        return jsonify({"error": "Choose a fabric line"}), 400

    mill_line = db.session.get(Fabric, fabric_id)
    if mill_line is None:
        return jsonify({"error": "Fabric not found"}), 404

    try:
        quantity = int(body.get("quantity"))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be a number"}), 400
    if quantity < 1:
        return jsonify({"error": "quantity must be at least 1"}), 400

    if mill_line.kind == "THREAD":
        unit = "kg"
    else:
        unit = (body.get("unit") or "kg").strip().lower()
        if unit in ("kilo", "kilos", "kilogram", "kilograms"):
            unit = "kg"
        if unit in ("meter", "metre", "meters", "metres"):
            unit = "m"
        if unit not in FABRIC_UNITS:
            return jsonify({"error": "Quantity unit must be metres or kg"}), 400

    stage = "processing"

    color = (body.get("color") or "").strip() or None
    if not color:
        return jsonify({"error": "A colour is required"}), 400
    thread = mill_line.kind == "THREAD"
    rib = (body.get("rib") or "").strip() or None
    if not thread and not rib:
        return jsonify({"error": "Rib is required"}), 400
    if thread:
        rib = None
    notes = (body.get("notes") or "").strip() or None
    phone = parse_phone(body.get("phone"))
    if not phone:
        return jsonify({"error": "A phone number is required"}), 400

    product = textiles_catalog_product()
    if thread:
        snapshot = " · ".join(
            part for part in (mill_line.code, mill_line.composition_label()) if part and part != "—"
        )
    else:
        snapshot = mill_line.composition_label()
        if mill_line.gsm:
            snapshot = f"{snapshot} · {mill_line.gsm} GSM" if snapshot != "—" else f"{mill_line.gsm} GSM"

    order = Order(
        user_id=user.id,
        product_id=product.id,
        fabric_id=mill_line.id,
        client_slug=user.client_slug or "cosine-textiles",
        contact_name=(body.get("name") or user.name).strip(),
        brand=(body.get("brand") or user.brand or "Cosine Textiles").strip(),
        email=(body.get("email") or getattr(user, "session_email", None) or user.email).strip().lower(),
        phone=phone,
        making="Textiles",
        quantity=quantity,
        stage=stage,
        notes=notes,
        color=color,
        rib=rib,
        fabric=snapshot,
        unit=unit,
    )
    if not order.contact_name or not order.brand or not order.email:
        return jsonify({"error": "name, brand, and email are required"}), 400

    try:
        db.session.add(order)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Could not save the order")
        return jsonify({"error": "Could not save the order"}), 500
    return jsonify({"order": order.to_public()}), 201


def register_routes(app):
    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    @app.post("/api/auth/login")
    def login():
        body = request.get_json(silent=True) or {}
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = find_user_by_email(email)
        if user is None or not check_password(password, user.password_hash):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify(
            {"token": make_token(user, login_email=email), "user": user.to_public(login_email=email)}
        )

    @app.get("/api/me")
    @require_auth
    def me():
        return jsonify({"user": g.current_user.to_public()})

    @app.get("/api/products")
    @require_auth
    @require_role("client", "admin")
    def products():
        user = g.current_user
        query = Product.query.order_by(Product.client_slug, Product.sku_kind, Product.name)
        if user.role == "client":
            query = query.filter_by(client_slug=user.client_slug)
        return jsonify({"products": [p.to_public() for p in query.all()]})

    @app.get("/api/fabrics")
    def fabrics():
        rows = Fabric.query.order_by(Fabric.kind, Fabric.gsm, Fabric.code, Fabric.id).all()
        seen = set()
        unique = []
        for row in rows:
            key = (row.kind, row.composition_json, row.gsm)
            if key in seen:
                continue
            seen.add(key)
            unique.append(row.to_buyer())
        return jsonify({"fabrics": unique})

    @app.get("/api/orders")
    @require_auth
    @require_role("client", "admin", "buyer", "produce", "dispatch")
    def list_orders():
        user = g.current_user
        query = Order.query.order_by(Order.created_at.desc())
        include_user = user.role in STAFF_ROLES
        if user.role in ("client", "buyer"):
            if user.client_slug:
                query = query.filter_by(client_slug=user.client_slug)
            else:
                query = query.filter_by(user_id=user.id)
        return jsonify(
            {"orders": [o.to_public(include_user=include_user) for o in query.all()]}
        )

    @app.post("/api/orders")
    @require_auth
    @require_role("client", "buyer")
    def create_order():
        user = g.current_user
        body = request.get_json(silent=True) or {}
        if user.role == "buyer":
            return create_fabric_order(user, body)
        return create_garment_order(user, body)

    @app.patch("/api/orders/<int:order_id>/stage")
    @require_auth
    @require_role("admin", "produce", "dispatch")
    def update_order_stage(order_id):
        order = db.session.get(Order, order_id)
        if order is None:
            return jsonify({"error": "Order not found"}), 404

        body = request.get_json(silent=True) or {}
        stage = canonical_stage(body.get("stage"))
        if stage not in ADMIN_MOVE_STAGES:
            return jsonify({"error": "Stage must be processing, production, or dispatch"}), 400

        previous = canonical_stage(order.stage)
        if not allowed_stage_move(g.current_user.role, previous, stage):
            return jsonify({"error": stage_move_error(g.current_user.role)}), 403

        order.stage = stage
        db.session.commit()
        mail = None
        if previous != stage:
            mail = send_stage_email(order, stage)
        return jsonify({"order": order.to_public(include_user=True), "mail": mail})

    @app.delete("/api/orders/<int:order_id>")
    @require_auth
    @require_role("admin")
    def delete_order(order_id):
        order = db.session.get(Order, order_id)
        if order is None:
            return jsonify({"error": "Order not found"}), 404

        pdf_bytes, filename = build_completion_pdf(order)
        completed_dir = Path(app.instance_path) / "completed"
        completed_dir.mkdir(parents=True, exist_ok=True)
        (completed_dir / filename).write_bytes(pdf_bytes)

        db.session.delete(order)
        db.session.commit()

        return send_file(
            BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )

    @app.post("/api/inquiries")
    def create_inquiry():
        body = request.get_json(silent=True) or {}
        name = (body.get("name") or "").strip()
        brand = (body.get("brand") or "").strip()
        email = (body.get("email") or "").strip().lower()
        phone = parse_phone(body.get("phone"))
        making = (body.get("making") or body.get("product") or "").strip()
        quantity = (body.get("quantity") or body.get("qty") or "").strip()
        stage = (body.get("stage") or "").strip()
        notes = (body.get("notes") or "").strip() or None

        if not name or not brand or not email or not phone:
            return jsonify({"error": "name, brand, email, and phone are required"}), 400
        if not making or making not in INQUIRY_MAKING:
            return jsonify({"error": "What you are making must be Apparel, Accessories or Other"}), 400
        if not quantity:
            return jsonify({"error": "Approximate quantity is required"}), 400
        if len(quantity) > 80:
            return jsonify({"error": "quantity is too long"}), 400
        if not stage or stage not in INQUIRY_STAGES:
            return jsonify({"error": "Unknown project stage"}), 400

        inquiry = Inquiry(
            contact_name=name,
            brand=brand,
            email=email,
            phone=phone,
            making=making,
            quantity=quantity,
            stage=stage,
            notes=notes,
        )
        db.session.add(inquiry)
        db.session.commit()
        return jsonify({"inquiry": inquiry.to_public()}), 201

    @app.get("/api/inquiries")
    @require_auth
    @require_role("admin")
    def list_inquiries():
        rows = Inquiry.query.order_by(Inquiry.created_at.desc()).all()
        return jsonify({"inquiries": [row.to_public() for row in rows]})

    @app.delete("/api/inquiries/<int:inquiry_id>")
    @require_auth
    @require_role("admin")
    def delete_inquiry(inquiry_id):
        inquiry = db.session.get(Inquiry, inquiry_id)
        if inquiry is None:
            return jsonify({"error": "Enquiry not found"}), 404
        db.session.delete(inquiry)
        db.session.commit()
        return jsonify({"ok": True})


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
