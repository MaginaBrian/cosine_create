from flask import Flask, g, jsonify, request
from flask_cors import CORS

from config import Config
from models import Order, Product, User, db
from security import check_password, make_token, require_auth, require_role

STAGES = {"idea", "sample", "produce", "reorder"}


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "OPTIONS"],
    )

    with app.app_context():
        db.create_all()

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
    def products():
        user = g.current_user
        query = Product.query.order_by(Product.client_slug, Product.sku_kind, Product.name)
        if user.role == "client":
            query = query.filter_by(client_slug=user.client_slug)
        return jsonify({"products": [p.to_public() for p in query.all()]})

    @app.get("/api/orders")
    @require_auth
    def list_orders():
        user = g.current_user
        query = Order.query.order_by(Order.created_at.desc())
        include_user = user.role == "admin"
        if user.role == "client":
            query = query.filter_by(user_id=user.id)
        return jsonify(
            {"orders": [o.to_public(include_user=include_user) for o in query.all()]}
        )

    @app.post("/api/orders")
    @require_auth
    @require_role("client")
    def create_order():
        user = g.current_user
        body = request.get_json(silent=True) or {}

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

        stage = (body.get("stage") or "idea").strip()
        if stage not in STAGES:
            return jsonify({"error": "Invalid stage"}), 400

        order = Order(
            user_id=user.id,
            product_id=product.id,
            client_slug=user.client_slug,
            contact_name=(body.get("name") or user.name).strip(),
            brand=(body.get("brand") or user.brand or "").strip(),
            email=(body.get("email") or user.email).strip().lower(),
            making=(body.get("making") or "Apparel").strip() or "Apparel",
            quantity=quantity,
            stage=stage,
            notes=(body.get("notes") or "").strip() or None,
        )
        if not order.contact_name or not order.brand or not order.email:
            return jsonify({"error": "name, brand, and email are required"}), 400

        db.session.add(order)
        db.session.commit()
        return jsonify({"order": order.to_public()}), 201


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
