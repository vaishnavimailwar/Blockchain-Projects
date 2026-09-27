"""
app.py
------
Flask web application for the "Certificate Verification Using Blockchain"
mini project (Blockchain Technology - Module 1 Activity).

Includes:
    - Certificate issuance (creates a new block)
    - Certificate ID verification
    - Optional certificate FILE upload + SHA-256 file-hash verification
    - Blockchain explorer
    - Tampering demo with restore
    - Module 1 concepts page
"""

import hashlib
import os
from datetime import date

from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename

from blockchain import Blockchain

app = Flask(__name__)
app.secret_key = "blockchain-cert-demo-secret-key"  # fine for a local college demo

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB upload limit

bc = Blockchain()


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def hash_file_bytes(file_storage):
    """Compute SHA-256 of the actual bytes of an uploaded file."""
    file_storage.stream.seek(0)
    file_bytes = file_storage.read()
    file_storage.stream.seek(0)
    return hashlib.sha256(file_bytes).hexdigest()


@app.context_processor
def inject_stats():
    """Make chain stats available to every template (used in the navbar)."""
    return {"nav_stats": bc.get_stats()}


# ----------------------------------------------------------------------
# Home / Dashboard
# ----------------------------------------------------------------------
@app.route("/")
def index():
    stats = bc.get_stats()
    recent_blocks = list(reversed(bc.get_chain()))[:5]
    return render_template("index.html", stats=stats, recent_blocks=recent_blocks)


# ----------------------------------------------------------------------
# Issue Certificate
# ----------------------------------------------------------------------
@app.route("/issue", methods=["GET", "POST"])
def issue():
    result = None

    if request.method == "POST":
        student_name = request.form.get("student_name", "").strip()
        usn = request.form.get("usn", "").strip()
        course = request.form.get("course", "").strip()
        title = request.form.get("title", "").strip()
        issue_date = request.form.get("issue_date", "").strip() or str(date.today())

        if not all([student_name, usn, course, title]):
            flash("Please fill in all fields before issuing a certificate.", "error")
            return render_template("issue.html", result=None)

        certificate_id = bc.generate_certificate_id()

        certificate_data = {
            "certificate_id": certificate_id,
            "student_name": student_name,
            "usn": usn,
            "course": course,
            "title": title,
            "issue_date": issue_date,
        }

        # --- Optional certificate file upload ---
        uploaded_file = request.files.get("certificate_file")
        if uploaded_file and uploaded_file.filename:
            if not allowed_file(uploaded_file.filename):
                flash("Only PDF, PNG, JPG, JPEG files are allowed for the certificate file.", "error")
                return render_template("issue.html", result=None)

            file_hash = hash_file_bytes(uploaded_file)

            safe_name = secure_filename(uploaded_file.filename)
            stored_filename = f"{certificate_id}_{safe_name}"
            uploaded_file.save(os.path.join(app.config["UPLOAD_FOLDER"], stored_filename))

            certificate_data["file_name"] = stored_filename
            certificate_data["file_hash"] = file_hash

        new_block = bc.add_certificate(certificate_data)
        result = new_block

    return render_template("issue.html", result=result)


# ----------------------------------------------------------------------
# Verify Certificate
# ----------------------------------------------------------------------
@app.route("/verify", methods=["GET", "POST"])
def verify():
    result = None
    searched_id = None
    file_check = None

    if request.method == "POST":
        searched_id = request.form.get("certificate_id", "").strip()
        block = bc.find_certificate(searched_id)

        if block:
            _, report = bc.validate_chain()
            block_report = next((r for r in report if r["index"] == block["index"]), None)
            chain_valid, _ = bc.validate_chain()
            result = {
                "found": True,
                "block": block,
                "block_valid": block_report["valid"] if block_report else False,
                "block_errors": block_report["errors"] if block_report else [],
                "chain_valid": chain_valid,
            }

            # --- Optional certificate file verification ---
            uploaded_file = request.files.get("certificate_file")
            if uploaded_file and uploaded_file.filename:
                stored_hash = block["certificate_data"].get("file_hash")

                if not stored_hash:
                    file_check = {
                        "checked": True,
                        "has_stored_file": False,
                    }
                else:
                    uploaded_hash = hash_file_bytes(uploaded_file)
                    file_check = {
                        "checked": True,
                        "has_stored_file": True,
                        "match": uploaded_hash == stored_hash,
                        "uploaded_hash": uploaded_hash,
                        "stored_hash": stored_hash,
                    }
        else:
            result = {"found": False}

    return render_template("verify.html", result=result, searched_id=searched_id, file_check=file_check)


# ----------------------------------------------------------------------
# Blockchain Explorer
# ----------------------------------------------------------------------
@app.route("/explorer")
def explorer():
    is_valid, report = bc.validate_chain()
    chain = bc.get_chain()
    report_by_index = {r["index"]: r for r in report}
    return render_template(
        "explorer.html",
        chain=chain,
        report_by_index=report_by_index,
        is_valid=is_valid,
    )


# ----------------------------------------------------------------------
# Tampering Demo
# ----------------------------------------------------------------------
@app.route("/tamper", methods=["GET", "POST"])
def tamper():
    chain = bc.get_chain()
    certificate_blocks = [b for b in chain if b["index"] != 0]

    if request.method == "POST":
        action = request.form.get("action")

        if action == "tamper":
            index = int(request.form.get("index"))
            block = next((b for b in chain if b["index"] == index), None)
            if block:
                tampered_data = dict(block["certificate_data"])
                tampered_data["student_name"] = request.form.get("new_student_name") or (
                    tampered_data.get("student_name", "") + " (TAMPERED)"
                )
                tampered_data["title"] = request.form.get("new_title") or tampered_data.get("title")
                bc.tamper_block(index, tampered_data)
                flash(f"Block #{index} was tampered with. Run validation to see the result.", "warning")

        elif action == "restore":
            bc.restore_from_backup()
            flash("Blockchain restored from the last valid backup.", "success")

        return redirect(url_for("tamper"))

    is_valid, report = bc.validate_chain()
    report_by_index = {r["index"]: r for r in report}

    return render_template(
        "tamper.html",
        certificate_blocks=certificate_blocks,
        is_valid=is_valid,
        report_by_index=report_by_index,
        chain=chain,
    )


# ----------------------------------------------------------------------
# Concepts Page
# ----------------------------------------------------------------------
@app.route("/concepts")
def concepts():
    return render_template("concepts.html")


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
