import json
import os

from fabrics_data import BUYER_CREDENTIAL, FABRIC_ROWS
from models import Fabric, Order, Product, User, UserEmail, db
from security import hash_password

STAFF_CREDENTIALS = [
    {
        "email": "production@cosinecreate.com",
        "password": "Produce123!",
        "name": "Production",
        "role": "produce",
        "brand": "Cosine Create",
        "client_slug": None,
    },
    {
        "email": "dispatch@cosinecreate.com",
        "password": "Dispatch123!",
        "name": "Dispatch",
        "role": "dispatch",
        "brand": "Cosine Create",
        "client_slug": None,
    },
]

SEED_CREDENTIALS = [
    {
        "email": "admin@cosinecreate.com",
        "password": "Admin123!",
        "name": "Studio Admin",
        "role": "admin",
        "brand": "Cosine Create",
        "client_slug": None,
    },
    *STAFF_CREDENTIALS,
    {
        "email": "mwotaji@cosinecreate.com",
        "password": "Mwotaji123!",
        "name": "Muli Nguta",
        "role": "client",
        "brand": "MWOTAJI",
        "client_slug": "mwotaji",
    },
    {
        "email": "groove@cosinecreate.com",
        "password": "Groove123!",
        "name": "Lincoln Mawira Kiogora",
        "role": "client",
        "brand": "The Groove Hangout",
        "client_slug": "the-groove-hangout",
    },
    BUYER_CREDENTIAL,
]

LOGIN_ALIASES = [
    {
        "email": "mwotajitribeofdreamers@gmail.com",
        "primary": "mwotaji@cosinecreate.com",
    },
]

MWOTAJI_CATEGORIES = [
    ("men-bottoms", "Men Bottoms", "bottoms", "men", "#/work/mwotaji/men/bottoms"),
    ("men-tops", "Men Tops", "tops", "men", "#/work/mwotaji/men/tops"),
    ("women-bottoms", "Women Bottoms", "bottoms", "women", "#/work/mwotaji/women/bottoms"),
    ("women-tops", "Women Tops", "tops", "women", "#/work/mwotaji/women/tops"),
    ("hoodies", "Hoodies", "hoodies", "shared", "#/work/mwotaji/hoodies"),
    ("sweatshirts", "Sweatshirts", "sweatshirts", "shared", "#/work/mwotaji/sweatshirts"),
]

# Matches lookbook items on the public MWOTAJI work pages.
MWOTAJI_LOOKS = [
    ("men", "bottoms", [1, 2, 3]),
    ("men", "tops", [1, 2, 3]),
    ("women", "bottoms", [1, 2, 3]),
    ("women", "tops", [1, 2, 3]),
    (None, "hoodies", [1, 2, 3]),
    (None, "sweatshirts", [2, 3, 4]),
]

GROOVE_PRODUCTS = [
    (
        "groove-oversized-t-shirt",
        "Oversized T-shirt",
        "t-shirts",
        "shared",
        "#/work/the-groove-hangout/t-shirts",
    ),
    (
        "groove-crop-top",
        "Crop turn-up",
        "crop-top",
        "shared",
        "#/work/the-groove-hangout/crop-top",
    ),
    ("groove-hats", "Hats", "hats", "shared", "#/work/the-groove-hangout/hats"),
    ("groove-tags", "Tags", "tags", "shared", "#/work/the-groove-hangout/tags"),
]


def _add_product(**kwargs):
    product = Product(**kwargs)
    db.session.add(product)
    return product


def _ensure_product(**kwargs):
    """Create or update a catalog product. Never reads or writes orders."""
    product = Product.query.filter_by(
        client_slug=kwargs["client_slug"], slug=kwargs["slug"]
    ).first()
    if product is None:
        return _add_product(**kwargs)
    for key, value in kwargs.items():
        setattr(product, key, value)
    return product


def ensure_client_catalogs():
    """Add MWOTAJI and Groove catalogs without wiping existing orders."""
    mwotaji_products = {}
    for slug, name, category, gender, look_ref in MWOTAJI_CATEGORIES:
        mwotaji_products[slug] = _ensure_product(
            client_slug="mwotaji",
            brand="MWOTAJI",
            slug=slug,
            name=name,
            category=category,
            gender=gender,
            look_ref=look_ref,
            sku_kind="category",
        )

    for gender, category, looks in MWOTAJI_LOOKS:
        for n in looks:
            if gender:
                slug = f"{gender}-{category}-{n:02d}"
                name = f"{gender.title()} {category.title()} — Look {n:02d}"
                look_ref = f"#/work/mwotaji/{gender}/{category}"
            else:
                slug = f"{category}-{n:02d}"
                name = f"{category.title()} — Look {n:02d}"
                look_ref = f"#/work/mwotaji/{category}"
            _ensure_product(
                client_slug="mwotaji",
                brand="MWOTAJI",
                slug=slug,
                name=name,
                category=category,
                gender=gender or "shared",
                look_ref=look_ref,
                sku_kind="look",
            )

    groove_products = {}
    for slug, name, category, gender, look_ref in GROOVE_PRODUCTS:
        groove_products[slug] = _ensure_product(
            client_slug="the-groove-hangout",
            brand="The Groove Hangout",
            slug=slug,
            name=name,
            category=category,
            gender=gender,
            look_ref=look_ref,
            sku_kind="category",
        )

    keep = {slug for slug, *_ in GROOVE_PRODUCTS}
    for product in Product.query.filter_by(client_slug="the-groove-hangout"):
        if product.slug not in keep:
            product.sku_kind = "retired"

    db.session.commit()
    return mwotaji_products, groove_products


def load_fabrics():
    for row in FABRIC_ROWS:
        db.session.add(_fabric_from_row(row))


def _fabric_from_row(row):
    return Fabric(
        supplier=row["supplier"],
        code=row["code"],
        kind=row["kind"],
        composition_json=json.dumps(row["fibres"]),
        gsm=row["gsm"],
        price_kg_cny=row["price_kg_cny"],
        price_kg_kes=row["price_kg_kes"],
        price_kg_cosintex=row["price_kg_cosintex"],
        price_m_cny=row["price_m_cny"],
        price_m_kes=row["price_m_kes"],
        price_m_cosintex=row["price_m_cosintex"],
        usage=row["usage"] or None,
        colors_json=json.dumps(row["colors"]),
    )


def ensure_fabric_rows():
    for row in Fabric.query.filter(Fabric.kind.in_(("POLYESTER THREAD", "NYLON THREAD"))):
        row.kind = "THREAD"
    if Fabric.query.count() == 0:
        load_fabrics()
        return
    for row in FABRIC_ROWS:
        exists = Fabric.query.filter_by(kind=row["kind"], code=row["code"]).first()
        if exists is None:
            db.session.add(_fabric_from_row(row))


def ensure_textiles_catalog_product():
    product = Product.query.filter_by(client_slug="cosine-textiles", slug="fabric").first()
    if product is None:
        product = Product(
            client_slug="cosine-textiles",
            brand="Cosine Textiles",
            slug="fabric",
            name="Fabric",
            category="textiles",
            gender="shared",
            sku_kind="category",
        )
        db.session.add(product)
        db.session.flush()
    return product


def ensure_client_users():
    """Keep founder names on existing accounts without wiping passwords or orders."""
    for row in SEED_CREDENTIALS:
        if row["role"] != "client":
            continue
        user = User.query.filter_by(email=row["email"].lower()).first()
        if user is None:
            db.session.add(
                User(
                    email=row["email"].lower(),
                    password_hash=hash_password(row["password"]),
                    name=row["name"],
                    role=row["role"],
                    brand=row["brand"],
                    client_slug=row["client_slug"],
                )
            )
        else:
            user.name = row["name"]
            user.brand = row["brand"]
            user.role = row["role"]
            user.client_slug = row["client_slug"]
    db.session.flush()
    for alias in LOGIN_ALIASES:
        email = alias["email"].lower()
        if User.query.filter_by(email=email).first() or UserEmail.query.filter_by(email=email).first():
            continue
        owner = User.query.filter_by(email=alias["primary"].lower()).first()
        if owner is None:
            continue
        db.session.add(UserEmail(user_id=owner.id, email=email))
    db.session.commit()


STAFF_EMAIL_RENAMES = {
    "production@cosinecreate.com": "produce@cosinecreate.com",
}


def ensure_staff_users():
    """Create production/dispatch staff without overwriting existing passwords."""
    for row in STAFF_CREDENTIALS:
        email = row["email"].lower()
        user = User.query.filter_by(email=email).first()
        if user is None:
            previous = STAFF_EMAIL_RENAMES.get(email)
            if previous:
                user = User.query.filter_by(email=previous).first()
                if user is not None:
                    user.email = email
        if user is None:
            db.session.add(
                User(
                    email=email,
                    password_hash=hash_password(row["password"]),
                    name=row["name"],
                    role=row["role"],
                    brand=row["brand"],
                    client_slug=row["client_slug"],
                )
            )
        else:
            user.name = row["name"]
            user.role = row["role"]
            user.brand = row["brand"]
            user.client_slug = row["client_slug"]
    db.session.commit()


def ensure_textiles():
    """Add buyer + mill list without wiping existing orders."""
    buyer = User.query.filter_by(email=BUYER_CREDENTIAL["email"]).first()
    if buyer is None:
        db.session.add(
            User(
                email=BUYER_CREDENTIAL["email"].lower(),
                password_hash=hash_password(BUYER_CREDENTIAL["password"]),
                name=BUYER_CREDENTIAL["name"],
                role="buyer",
                brand=BUYER_CREDENTIAL["brand"],
                client_slug=BUYER_CREDENTIAL["client_slug"],
            )
        )
    else:
        buyer.name = BUYER_CREDENTIAL["name"]
        buyer.brand = BUYER_CREDENTIAL["brand"]
        buyer.role = "buyer"
        buyer.client_slug = BUYER_CREDENTIAL["client_slug"]
    ensure_textiles_catalog_product()
    ensure_fabric_rows()
    db.session.commit()


def seed_database():
    """Wipe and reload demo data. Refuses if orders already exist unless FORCE_SEED=1."""
    if Order.query.count() > 0 and os.environ.get("FORCE_SEED", "").lower() not in (
        "1",
        "true",
        "yes",
    ):
        raise RuntimeError(
            "Refusing to seed because orders already exist. Set FORCE_SEED=1 only if you mean to wipe them."
        )
    db.drop_all()
    db.create_all()

    users = {}
    for row in SEED_CREDENTIALS:
        user = User(
            email=row["email"].lower(),
            password_hash=hash_password(row["password"]),
            name=row["name"],
            role=row["role"],
            brand=row["brand"],
            client_slug=row["client_slug"],
        )
        db.session.add(user)
        users[row["email"]] = user

    db.session.flush()
    for alias in LOGIN_ALIASES:
        owner = users.get(alias["primary"])
        if owner:
            db.session.add(UserEmail(user_id=owner.id, email=alias["email"].lower()))

    mwotaji_products, groove_products = ensure_client_catalogs()
    load_fabrics()
    ensure_textiles_catalog_product()
    db.session.flush()

    mwotaji = users["mwotaji@cosinecreate.com"]
    groove = users["groove@cosinecreate.com"]

    db.session.add(
        Order(
            user_id=mwotaji.id,
            product_id=mwotaji_products["women-tops"].id,
            client_slug="mwotaji",
            contact_name=mwotaji.name,
            brand="MWOTAJI",
            email=mwotaji.email,
            making="Apparel",
            quantity=120,
            stage="sample",
            notes="Essential Collection women tops. Fit comments on look 02; second sample in work.",
        )
    )
    db.session.add(
        Order(
            user_id=groove.id,
            product_id=groove_products["groove-oversized-t-shirt"].id,
            client_slug="the-groove-hangout",
            contact_name=groove.name,
            brand="The Groove Hangout",
            email=groove.email,
            making="Apparel",
            quantity=80,
            stage="produce",
            notes="7th edition merch tees. First sample approved. Line set for the run.",
        )
    )

    db.session.commit()
    return SEED_CREDENTIALS
