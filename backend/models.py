from datetime import datetime, timezone
import json

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    client_slug = db.Column(db.String(80), nullable=True, index=True)
    brand = db.Column(db.String(120), nullable=True)

    orders = db.relationship("Order", back_populates="user")

    def to_public(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "brand": self.brand,
            "client_slug": self.client_slug,
        }


class Product(db.Model):
    __tablename__ = "products"
    __table_args__ = (db.UniqueConstraint("client_slug", "slug", name="uq_product_client_slug"),)

    id = db.Column(db.Integer, primary_key=True)
    client_slug = db.Column(db.String(80), nullable=False, index=True)
    brand = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(20), nullable=True)
    look_ref = db.Column(db.String(200), nullable=True)
    sku_kind = db.Column(db.String(20), nullable=False, default="category")

    def to_public(self):
        return {
            "id": self.id,
            "client_slug": self.client_slug,
            "brand": self.brand,
            "slug": self.slug,
            "name": self.name,
            "category": self.category,
            "gender": self.gender,
            "look_ref": self.look_ref,
            "sku_kind": self.sku_kind,
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    client_slug = db.Column(db.String(80), nullable=False, index=True)
    contact_name = db.Column(db.String(120), nullable=False)
    brand = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(40), nullable=True)
    making = db.Column(db.String(80), nullable=False, default="Apparel")
    quantity = db.Column(db.Integer, nullable=False)
    stage = db.Column(db.String(40), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    garment = db.Column(db.String(80), nullable=True)
    size_breakdown = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(120), nullable=True)
    rib = db.Column(db.String(120), nullable=True)
    height = db.Column(db.String(40), nullable=True)
    fabric = db.Column(db.String(200), nullable=True)
    fabric_id = db.Column(db.Integer, db.ForeignKey("fabrics.id"), nullable=True)
    unit = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    user = db.relationship("User", back_populates="orders")
    product = db.relationship("Product")
    mill_line = db.relationship("Fabric")

    def parsed_sizes(self):
        if not self.size_breakdown:
            return None
        try:
            data = json.loads(self.size_breakdown)
        except (TypeError, ValueError):
            return None
        return data if isinstance(data, dict) else None

    def to_public(self, include_user=False):
        created = self.created_at
        if created and created.tzinfo is None:
            iso = created.replace(tzinfo=timezone.utc).isoformat()
        else:
            iso = created.isoformat() if created else None

        payload = {
            "id": self.id,
            "ref": f"CC-{self.id:04d}",
            "product": self.product.to_public() if self.product else None,
            "client_slug": self.client_slug,
            "brand": self.brand,
            "contact_name": self.contact_name,
            "email": self.email,
            "phone": self.phone,
            "making": self.making,
            "quantity": self.quantity,
            "stage": self.stage,
            "notes": self.notes,
            "garment": self.garment,
            "sizes": self.parsed_sizes(),
            "color": self.color,
            "rib": self.rib,
            "height": self.height,
            "fabric": self.fabric,
            "fabric_id": self.fabric_id,
            "fabric_line": (
                self.mill_line.to_admin()
                if include_user and self.mill_line
                else self.mill_line.to_buyer()
                if self.mill_line
                else None
            ),
            "unit": self.unit or ("m" if self.fabric_id else "pcs"),
            "created_at": iso,
        }
        if include_user and self.user:
            payload["user"] = self.user.to_public()
        return payload


class Fabric(db.Model):
    __tablename__ = "fabrics"

    id = db.Column(db.Integer, primary_key=True)
    supplier = db.Column(db.String(120), nullable=False, default="")
    code = db.Column(db.String(80), nullable=False, index=True)
    kind = db.Column(db.String(80), nullable=False, index=True)
    composition_json = db.Column(db.Text, nullable=False, default="{}")
    gsm = db.Column(db.Integer, nullable=True)
    price_kg_cny = db.Column(db.Float, nullable=True)
    price_kg_kes = db.Column(db.Float, nullable=True)
    price_kg_cosintex = db.Column(db.Float, nullable=True)
    price_m_cny = db.Column(db.Float, nullable=True)
    price_m_kes = db.Column(db.Float, nullable=True)
    price_m_cosintex = db.Column(db.Float, nullable=True)
    usage = db.Column(db.String(200), nullable=True)
    colors_json = db.Column(db.Text, nullable=False, default="[]")

    def fibres(self):
        try:
            data = json.loads(self.composition_json or "{}")
        except (TypeError, ValueError):
            return {}
        return data if isinstance(data, dict) else {}

    def colors(self):
        try:
            data = json.loads(self.colors_json or "[]")
        except (TypeError, ValueError):
            return []
        return data if isinstance(data, list) else []

    def composition_label(self):
        labels = {
            "cotton": "cotton",
            "polyester": "polyester",
            "spandex": "spandex",
            "nylon": "nylon",
            "modal": "modal",
            "linen": "linen",
            "tencel": "tencel",
            "wool": "wool",
            "other": "other",
        }
        parts = []
        for key, name in labels.items():
            value = self.fibres().get(key)
            if value:
                parts.append(f"{int(value)}% {name}")
        return " · ".join(parts) if parts else "—"

    def to_buyer(self):
        return {
            "id": self.id,
            "kind": self.kind,
            "composition": self.composition_label(),
            "fibres": self.fibres(),
            "gsm": self.gsm,
            "colors": self.colors(),
        }

    def to_admin(self):
        payload = self.to_buyer()
        payload.update(
            {
                "supplier": self.supplier or None,
                "code": self.code,
                "price_kg_cny": self.price_kg_cny,
                "price_kg_kes": self.price_kg_kes,
                "price_kg_cosintex": self.price_kg_cosintex,
                "price_m_cny": self.price_m_cny,
                "price_m_kes": self.price_m_kes,
                "price_m_cosintex": self.price_m_cosintex,
                "usage": self.usage or None,
            }
        )
        return payload


class Inquiry(db.Model):
    __tablename__ = "inquiries"

    id = db.Column(db.Integer, primary_key=True)
    contact_name = db.Column(db.String(120), nullable=False)
    brand = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(40), nullable=True)
    making = db.Column(db.String(80), nullable=False, default="Apparel")
    quantity = db.Column(db.String(80), nullable=True)
    stage = db.Column(db.String(40), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    def to_public(self):
        created = self.created_at
        if created and created.tzinfo is None:
            iso = created.replace(tzinfo=timezone.utc).isoformat()
        else:
            iso = created.isoformat() if created else None
        return {
            "id": self.id,
            "contact_name": self.contact_name,
            "brand": self.brand,
            "email": self.email,
            "phone": self.phone,
            "making": self.making,
            "quantity": self.quantity,
            "stage": self.stage,
            "notes": self.notes,
            "created_at": iso,
        }
