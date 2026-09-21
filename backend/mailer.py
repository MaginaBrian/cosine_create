import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from flask import current_app

from completion_pdf import GARMENT_NAMES
from models import utcnow


STAGE_COPY = {
    "processing": {
        "name": "Processing",
        "body": "Your project is being processed. We are reviewing the order and lining up the next step.",
    },
    "brief": {
        "name": "Brief",
        "body": "Your project is in brief. We are shaping the spec with you before anything is sourced.",
    },
    "source": {
        "name": "Source",
        "body": "Your project has moved to sourcing. Fabric and trims are being matched to the order.",
    },
    "sample": {
        "name": "Sample",
        "body": "Your project is in sampling. Fit and construction are being proven in the hand.",
    },
    "produce": {
        "name": "Production",
        "body": "Your project is in production. The line is set around this order.",
    },
    "distribute": {
        "name": "Dispatch",
        "body": "Your project is in dispatch. Finishing, QC and packing are underway.",
    },
}


def _item_label(item):
    garment = (item or {}).get("garment")
    if garment and garment in GARMENT_NAMES:
        return GARMENT_NAMES[garment]
    return (item or {}).get("product_name") or "Item"


def _outbox_dir():
    path = Path(current_app.instance_path) / "outbox"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _compose(order, stage):
    copy = STAGE_COPY.get(stage, {"name": stage, "body": f"Your project is now at {stage}."})
    ref = f"CC-{order.id:04d}"
    name = order.contact_name or "there"
    subject = f"{ref} — {copy['name']}"
    details = [f"Current stage: {copy['name']}", f"Quantity: {order.quantity} pcs"]
    items = order.parsed_items() if hasattr(order, "parsed_items") else []
    if len(items) > 1:
        for item in items:
            bits = [
                _item_label(item),
                f"{item.get('quantity') or 0} pcs",
                item.get("color"),
                item.get("height"),
            ]
            details.append(" · ".join(str(bit) for bit in bits if bit))
    else:
        if order.color:
            details.append(f"Color: {order.color}")
        if order.height:
            details.append(f"Height: {order.height}")
        if order.fabric:
            details.append(f"Apparel fabric: {order.fabric}")
    detail_text = "\n".join(details)
    text = (
        f"Hello {name},\n\n"
        f"An update on order {ref} for {order.brand}.\n\n"
        f"Your order has moved on to the next stage: {copy['name']}.\n\n"
        f"{copy['body']}\n\n"
        f"{detail_text}\n\n"
        "— Cosine Create\n"
    )
    extra_html = ""
    if len(items) > 1:
        extra_html = "<br>" + "<br>".join(
            " · ".join(
                str(bit)
                for bit in (
                    _item_label(item),
                    f"{item.get('quantity') or 0} pcs",
                    item.get("color"),
                    item.get("height"),
                )
                if bit
            )
            for item in items
        )
    else:
        if order.color:
            extra_html += f"<br><strong>Color:</strong> {order.color}"
        if order.height:
            extra_html += f"<br><strong>Height:</strong> {order.height}"
        if order.fabric:
            extra_html += f"<br><strong>Apparel fabric:</strong> {order.fabric}"
    html = f"""<!doctype html>
<html><body style="font-family:Helvetica,Arial,sans-serif;background:#000;color:#fff;padding:32px;">
  <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;opacity:.6;">Cosine Create</p>
  <h1 style="font-weight:500;letter-spacing:-.03em;">Order {ref}</h1>
  <p>Hello {name},</p>
  <p>Your order has moved on to the next stage: <strong>{copy['name']}</strong>.</p>
  <p>{copy['body']}</p>
  <p><strong>Current stage:</strong> {copy['name']}<br>
  <strong>Quantity:</strong> {order.quantity} pcs{extra_html}</p>
  <p style="opacity:.6;">— Cosine Create</p>
</body></html>"""
    return subject, text, html


def _recipients(order):
    emails = set()
    if order.email:
        emails.add(order.email.strip().lower())
    user = getattr(order, "user", None)
    if user and hasattr(user, "notify_emails"):
        emails.update(user.notify_emails())
    elif user and user.email:
        emails.add(user.email.lower())
    return sorted(email for email in emails if email and "@" in email)


def send_stage_email(order, stage):
    subject, text, html = _compose(order, stage)
    to_addrs = _recipients(order)
    if not to_addrs:
        return {"sent": False, "reason": "No recipient email"}

    msg = EmailMessage()
    sender = current_app.config.get("MAIL_FROM") or "hello@cosinecreate.com"
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(to_addrs)
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    server = (current_app.config.get("MAIL_SERVER") or "").strip()
    if not server:
        stamp = utcnow().strftime("%Y%m%d-%H%M%S")
        path = _outbox_dir() / f"{stamp}-{order.id}-{stage}.txt"
        path.write_text(f"To: {', '.join(to_addrs)}\nSubject: {subject}\n\n{text}", encoding="utf-8")
        current_app.logger.info("Stage email logged to %s (no MAIL_SERVER)", path)
        return {"sent": False, "logged": True, "path": str(path), "to": to_addrs}

    try:
        port = int(current_app.config.get("MAIL_PORT") or 587)
        use_tls = bool(current_app.config.get("MAIL_USE_TLS", True))
        with smtplib.SMTP(server, port, timeout=20) as smtp:
            if use_tls:
                smtp.starttls()
            user = current_app.config.get("MAIL_USERNAME")
            password = current_app.config.get("MAIL_PASSWORD")
            if user:
                smtp.login(user, password or "")
            smtp.send_message(msg)
        return {"sent": True, "to": to_addrs}
    except OSError as err:
        current_app.logger.exception("Stage email failed")
        return {"sent": False, "reason": str(err), "to": to_addrs}
