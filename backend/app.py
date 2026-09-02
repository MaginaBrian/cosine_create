from flask import Flask, g, jsonify, request, send_file
from flask_cors import CORS
from sqlalchemy import inspect, text
from io import BytesIO
from pathlib import Path
import json

from completion_pdf import build_completion_pdf
from config import Config
from models import Fabric, Inquiry, Order, Product, User, db
from security import check_password, make_token, require_auth, require_role

ADMIN_MOVE_STAGES = ("produce", "distribute")
STAGE_ALIASES = {
    "idea": "produce",
    "reorder": "produce",
    "brief": "produce",
    "source": "produce",
    "sample": "produce",
    "production": "produce",
    "dispatch": "distribute",
}
GARMENT_IDS = {
    "oversized-t-shirt",
    "hoodie",
    "sweatshirt",
    "female-sweatpants",
    "male-sweatpants",
    "vest",
}
HEIGHTS = {"Short", "Regular", "Tall"}
INQUIRY_MAKING = {"Apparel", "Accessories", "Other"}
INQUIRY_STAGES = {"idea", "sample", "produce", "buy", "reorder"}
FABRIC_UNITS = {"m", "kg"}


def canonical_stage(value):
    key = (value or "").strip()
    return STAGE_ALIASES.get(key, key)


def parse_phone(value):
    phone = (value or "").strip()
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) < 7 or len(phone) > 40:
        return None
    return phone


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
    if "inquiries" in tables:
        inq_cols = {col["name"] for col in inspector.get_columns("inquiries")}
        if "phone" not in inq_cols:
            statements.append("ALTER TABLE inquiries ADD COLUMN phone VARCHAR(40)")
    for sql in statements:
        db.session.execute(text(sql))
    if statements:
        db.session.commit()
    if "orders" not in tables:
        return
    db.session.execute(
        text(
            "UPDATE orders SET stage = 'produce' "
            "WHERE stage IN ('brief', 'source', 'sample', 'idea', 'reorder', 'production')"
        )
    )
    db.session.execute(
        text("UPDATE orders SET stage = 'distribute' WHERE stage IN ('dispatch')")
    )
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
    )

    with app.app_context():
        db.create_all()
        ensure_schema()
        from seed import ensure_textiles

        ensure_textiles()

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


def textiles_catalog_product():
    from seed import ensure_textiles_catalog_product

    return ensure_textiles_catalog_product()


def create_garment_order(user, body):
    product_id = body.get("product_id")
    if product_id is None:
        return jsonify({"error": "product_id is required"}), 400

    product = db.session.get(Product, product_id)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    if product.client_slug != user.client_slug:
        return jsonify({"error": "You can only order products from your catalog"}), 403

    try:
        quantity = int(body.get("quantity"))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be a number"}), 400
    if quantity < 1:
        return jsonify({"error": "quantity must be at least 1"}), 400

    sizes = body.get("sizes")
    size_breakdown = None
    if sizes is not None:
        if not isinstance(sizes, dict):
            return jsonify({"error": "sizes must be an object of size to quantity"}), 400
        cleaned = {}
        total = 0
        for size, qty in sizes.items():
            label = str(size).strip()[:8]
            try:
                n = int(qty)
            except (TypeError, ValueError):
                return jsonify({"error": f"invalid quantity for size {size}"}), 400
            if n < 0:
                return jsonify({"error": "size quantities cannot be negative"}), 400
            if n:
                cleaned[label] = n
                total += n
        if total < 1:
            return jsonify({"error": "add a quantity for at least one size"}), 400
        quantity = total
        size_breakdown = json.dumps(cleaned)

    garment = (body.get("garment") or "").strip() or None
    if garment and garment not in GARMENT_IDS:
        return jsonify({"error": "Unknown garment"}), 400

    stage = canonical_stage(body.get("stage") or "produce")
    if stage not in ADMIN_MOVE_STAGES:
        return jsonify({"error": "Stage must be production or dispatch"}), 400

    color = (body.get("color") or "").strip() or None
    height = (body.get("height") or "").strip() or None
    if height and height not in HEIGHTS:
        return jsonify({"error": "Height must be Short, Regular or Tall"}), 400
    fabric = (body.get("fabric") or "").strip() or None
    notes = (body.get("notes") or "").strip() or None
    phone = parse_phone(body.get("phone"))
    if not phone:
        return jsonify({"error": "A phone number is required"}), 400

    order = Order(
        user_id=user.id,
        product_id=product.id,
        client_slug=user.client_slug,
        contact_name=(body.get("name") or user.name).strip(),
        brand=(body.get("brand") or user.brand or "").strip(),
        email=(body.get("email") or user.email).strip().lower(),
        phone=phone,
        making=(body.get("making") or "Apparel").strip() or "Apparel",
        quantity=quantity,
        stage=stage,
        notes=notes,
        garment=garment,
        size_breakdown=size_breakdown,
        color=color,
        height=height,
        fabric=fabric,
        unit="pcs",
    )
    if not order.contact_name or not order.brand or not order.email:
        return jsonify({"error": "name, brand, and email are required"}), 400

    db.session.add(order)
    db.session.commit()
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

    unit = (body.get("unit") or "m").strip().lower()
    if unit in ("meter", "metre", "meters", "metres"):
        unit = "m"
    if unit not in FABRIC_UNITS:
        return jsonify({"error": "Quantity unit must be metres or kg"}), 400

    stage = canonical_stage(body.get("stage") or "produce")
    if stage not in ADMIN_MOVE_STAGES:
        return jsonify({"error": "Stage must be production or dispatch"}), 400

    color = (body.get("color") or "").strip() or None
    notes = (body.get("notes") or "").strip() or None
    phone = parse_phone(body.get("phone"))
    if not phone:
        return jsonify({"error": "A phone number is required"}), 400

    product = textiles_catalog_product()
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
        email=(body.get("email") or user.email).strip().lower(),
        phone=phone,
        making="Textiles",
        quantity=quantity,
        stage=stage,
        notes=notes,
        color=color,
        fabric=snapshot,
        unit=unit,
    )
    if not order.contact_name or not order.brand or not order.email:
        return jsonify({"error": "name, brand, and email are required"}), 400

    db.session.add(order)
    db.session.commit()
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

        user = User.query.filter_by(email=email).first()
        if user is None or not check_password(password, user.password_hash):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({"token": make_token(user), "user": user.to_public()})

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
    @require_auth
    @require_role("buyer", "admin")
    def fabrics():
        user = g.current_user
        rows = Fabric.query.order_by(Fabric.kind, Fabric.gsm, Fabric.code, Fabric.id).all()
        if user.role == "admin":
            return jsonify({"fabrics": [row.to_admin() for row in rows]})

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
    @require_role("client", "admin", "buyer")
    def list_orders():
        user = g.current_user
        query = Order.query.order_by(Order.created_at.desc())
        include_user = user.role == "admin"
        if user.role in ("client", "buyer"):
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
    @require_role("admin")
    def update_order_stage(order_id):
        order = db.session.get(Order, order_id)
        if order is None:
            return jsonify({"error": "Order not found"}), 404

        body = request.get_json(silent=True) or {}
        stage = canonical_stage(body.get("stage"))
        if stage not in ADMIN_MOVE_STAGES:
            return jsonify({"error": "Stage must be production or dispatch"}), 400

        order.stage = stage
        db.session.commit()
        return jsonify({"order": order.to_public(include_user=True)})

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
