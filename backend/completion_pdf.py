from datetime import timezone

from fpdf import FPDF

from models import utcnow

GARMENT_NAMES = {
    "oversized-t-shirt": "Oversized T-shirt",
    "hoodie": "Hoodie",
    "sweatshirt": "Sweatshirt",
    "female-sweatpants": "Female sweatpants",
    "male-sweatpants": "Male sweatpants",
    "vest": "Vest",
}
SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL"]


def _text(value, fallback="-"):
    if value is None:
        return fallback
    text = str(value).strip()
    if not text:
        return fallback
    return text.encode("latin-1", "replace").decode("latin-1")


def _format_when(value):
    if not value:
        return "-"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).strftime("%d %b %Y, %H:%M UTC")


def _size_run(order):
    sizes = order.parsed_sizes() or {}
    parts = []
    for size in SIZE_ORDER:
        qty = sizes.get(size)
        if qty:
            parts.append(f"{size} {qty}")
    for size, qty in sizes.items():
        if size not in SIZE_ORDER and qty:
            parts.append(f"{size} {qty}")
    return " / ".join(parts) if parts else "-"


def _product_name(order):
    if order.garment and order.garment in GARMENT_NAMES:
        return GARMENT_NAMES[order.garment]
    if order.product:
        return order.product.name
    return "-"


def build_completion_pdf(order):
    ref = f"CC-{order.id:04d}"
    pdf = FPDF(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=22)
    pdf.add_page()
    pdf.set_fill_color(0, 0, 0)
    pdf.rect(0, 0, 210, 297, "F")

    pdf.set_text_color(255, 255, 255)
    pdf.set_draw_color(255, 255, 255)

    pdf.set_xy(20, 22)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "COSINE CREATE")

    pdf.set_xy(20, 36)
    pdf.set_font("Helvetica", "B", 28)
    pdf.cell(0, 12, "Order completed.")

    pdf.set_xy(20, 52)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, _text(ref))

    pdf.set_line_width(0.2)
    pdf.line(20, 66, 190, 66)

    rows = [
        ("Brand", order.brand),
        ("Contact", order.contact_name),
        ("Email", order.email),
        ("Phone", getattr(order, "phone", None)),
        ("Product", _product_name(order)),
        ("Quantity", f"{order.quantity} pcs"),
        ("Size", _size_run(order)),
        ("Color", order.color),
        ("Height", order.height),
        ("Notes", order.notes),
        ("Ordered", _format_when(order.created_at)),
        ("Completed", _format_when(utcnow())),
    ]

    y = 76
    for label, value in rows:
        pdf.set_xy(20, y)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(180, 180, 180)
        pdf.cell(38, 7, _text(label).upper())
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "", 11)
        pdf.set_xy(58, y)
        pdf.multi_cell(132, 7, _text(value))
        y = pdf.get_y() + 4
        if y > 250:
            pdf.add_page()
            pdf.set_fill_color(0, 0, 0)
            pdf.rect(0, 0, 210, 297, "F")
            pdf.set_text_color(255, 255, 255)
            y = 24
            pdf.set_y(y)

    pdf.set_y(max(y + 8, 260))
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(180, 180, 180)
    pdf.set_x(20)
    pdf.multi_cell(
        170,
        5,
        "This record confirms the order was completed and closed by Cosine Create.",
    )

    return bytes(pdf.output()), f"{ref}-completed.pdf"
