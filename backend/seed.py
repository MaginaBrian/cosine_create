from models import Order, Product, User, db
from security import hash_password

SEED_CREDENTIALS = [
    {
        "email": "admin@cosine.create",
        "password": "Admin123!",
        "name": "Studio Admin",
        "role": "admin",
        "brand": "Cosine Create",
        "client_slug": None,
    },
    {
        "email": "mwotaji@mwotaji.com",
        "password": "Mwotaji123!",
        "name": "Amina Mwotaji",
        "role": "client",
        "brand": "MWOTAJI",
        "client_slug": "mwotaji",
    },
    {
        "email": "atelier@example.com",
        "password": "Atelier123!",
        "name": "Jules Atelier",
        "role": "client",
        "brand": "Atelier",
        "client_slug": "atelier",
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

ATELIER_PRODUCTS = [
    ("atelier-tee", "Atelier Tee", "tops", "unisex", None),
    ("atelier-overshirt", "Atelier Overshirt", "tops", "unisex", None),
]


def _add_product(**kwargs):
    product = Product(**kwargs)
    db.session.add(product)
    return product


def seed_database():
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

    mwotaji_products = {}
    for slug, name, category, gender, look_ref in MWOTAJI_CATEGORIES:
        product = _add_product(
            client_slug="mwotaji",
            brand="MWOTAJI",
            slug=slug,
            name=name,
            category=category,
            gender=gender,
            look_ref=look_ref,
            sku_kind="category",
        )
        mwotaji_products[slug] = product

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
            _add_product(
                client_slug="mwotaji",
                brand="MWOTAJI",
                slug=slug,
                name=name,
                category=category,
                gender=gender or "shared",
                look_ref=look_ref,
                sku_kind="look",
            )

    atelier_products = {}
    for slug, name, category, gender, look_ref in ATELIER_PRODUCTS:
        product = _add_product(
            client_slug="atelier",
            brand="Atelier",
            slug=slug,
            name=name,
            category=category,
            gender=gender,
            look_ref=look_ref,
            sku_kind="category",
        )
        atelier_products[slug] = product

    db.session.flush()

    mwotaji = users["mwotaji@mwotaji.com"]
    atelier = users["atelier@example.com"]

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
            user_id=atelier.id,
            product_id=atelier_products["atelier-tee"].id,
            client_slug="atelier",
            contact_name=atelier.name,
            brand="Atelier",
            email=atelier.email,
            making="Apparel",
            quantity=48,
            stage="produce",
            notes="First sample approved. Line set for a run under fifty.",
        )
    )

    db.session.commit()
    return SEED_CREDENTIALS
