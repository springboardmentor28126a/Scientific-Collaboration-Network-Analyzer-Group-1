import csv
import io
from collections import Counter

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.publication import Publication
from models.researcher import Researcher
from models.department import Department
from models.institution import Institution
from models.collaboration import Collaboration
from models.report import SavedReport

from schemas.report import SavedReportCreate


# =========================================================
# PUBLICATIONS REPORT
# =========================================================

def get_publication_report(db: Session):

    total = db.query(Publication).count()

    types = (
        db.query(
            Publication.type,
            func.count(Publication.id)
        )
        .group_by(Publication.type)
        .all()
    )

    type_counts = {
        publication_type or "Unknown": int(count)
        for publication_type, count in types
    }

    statuses = (
        db.query(
            Publication.status,
            func.count(Publication.id)
        )
        .group_by(Publication.status)
        .all()
    )

    status_counts = {
        status or "Unknown": int(count)
        for status, count in statuses
    }

    return {
        "total_publications": int(total),
        "type_counts": type_counts,
        "status_counts": status_counts,
    }


# =========================================================
# RESEARCHERS REPORT
# =========================================================

def get_research_report(db: Session):

    total = db.query(Researcher).count()

    department_rows = (
        db.query(
            Researcher.department,
            func.count(Researcher.id)
        )
        .group_by(Researcher.department)
        .all()
    )

    department_counts = {}

    for department_name, count in department_rows:

        if (
            isinstance(department_name, str)
            and department_name.strip()
        ):
            department_label = department_name.strip()
        else:
            department_label = "Unassigned"

        department_counts[department_label] = int(count)

    # -----------------------------------------------------
    # Researcher skills
    # -----------------------------------------------------

    skill_counter = Counter()

    researcher_rows = (
        db.query(Researcher.skills)
        .filter(Researcher.skills.isnot(None))
        .all()
    )

    for row in researcher_rows:

        skills_value = row[0]

        if not skills_value:
            continue

        if isinstance(skills_value, (list, tuple, set)):

            for skill in skills_value:

                if skill is None:
                    continue

                skill_clean = str(skill).strip()

                if skill_clean:
                    skill_counter[skill_clean] += 1

        elif isinstance(skills_value, str):

            for skill in skills_value.split(","):

                skill_clean = skill.strip()

                if skill_clean:
                    skill_counter[skill_clean] += 1

        else:

            skill_clean = str(skills_value).strip()

            if skill_clean:
                skill_counter[skill_clean] += 1

    skills_summary = [
        skill
        for skill, count in skill_counter.most_common(20)
    ]

    return {
        "total_researchers": int(total),
        "department_counts": department_counts,
        "skills_summary": skills_summary,
    }


# =========================================================
# COLLABORATION REPORT
# =========================================================

def get_collaboration_report(db: Session):

    total = db.query(Collaboration).count()

    types = (
        db.query(
            Collaboration.type,
            func.count(Collaboration.id)
        )
        .group_by(Collaboration.type)
        .all()
    )

    type_counts = {
        collaboration_type or "General": int(count)
        for collaboration_type, count in types
    }

    return {
        "total_collaborations": int(total),
        "type_counts": type_counts,
    }


# =========================================================
# INSTITUTION REPORT
# =========================================================

def get_institution_report(db: Session):

    total_inst = db.query(Institution).count()

    total_dep = db.query(Department).count()

    institution_rows = (
        db.query(
            Institution.name,
            func.count(Researcher.id)
        )
        .join(
            Researcher,
            Researcher.institution_id == Institution.id,
            isouter=True,
        )
        .group_by(Institution.name)
        .all()
    )

    researcher_counts_by_institution = {}

    for institution_name, count in institution_rows:

        if count > 0:

            researcher_counts_by_institution[
                institution_name or "External"
            ] = int(count)

    return {
        "total_institutions": int(total_inst),
        "total_departments": int(total_dep),
        "researcher_counts_by_institution":
            researcher_counts_by_institution,
    }


# =========================================================
# CSV EXPORT
# =========================================================

def generate_csv_export(
    db: Session,
    report_type: str
) -> str:

    output = io.StringIO()

    writer = csv.writer(output)

    # -----------------------------------------------------
    # Publications
    # -----------------------------------------------------

    if report_type == "publications":

        writer.writerow([
            "ID",
            "Title",
            "Type",
            "Status",
            "DOI",
            "Uploaded By",
            "Created At",
        ])

        publications = db.query(Publication).all()

        for publication in publications:

            writer.writerow([
                publication.id,
                publication.title,
                publication.type or "",
                publication.status or "",
                publication.doi or "",
                publication.uploaded_by or "",
                publication.created_at or "",
            ])

    # -----------------------------------------------------
    # Researchers
    # -----------------------------------------------------

    elif report_type == "researchers":

        writer.writerow([
            "ID",
            "Full Name",
            "ORCID ID",
            "Institution ID",
            "Department",
            "Skills",
            "Interests",
        ])

        researchers = db.query(Researcher).all()

        for researcher in researchers:

            skills = researcher.skills or ""

            if isinstance(skills, (list, tuple, set)):

                skills = ", ".join(
                    str(skill)
                    for skill in skills
                )

            writer.writerow([
                researcher.id,
                researcher.full_name,
                researcher.orcid_id or "",
                researcher.institution_id or "",
                researcher.department or "",
                skills,
                researcher.research_interests or "",
            ])

    # -----------------------------------------------------
    # Collaborations
    # -----------------------------------------------------

    elif report_type == "collaborations":

        writer.writerow([
            "ID",
            "Title",
            "Type",
            "Status",
            "Institution 1 ID",
            "Institution 2 ID",
            "Start Date",
            "End Date",
        ])

        collaborations = db.query(Collaboration).all()

        for collaboration in collaborations:

            writer.writerow([
                collaboration.id,
                collaboration.title,
                collaboration.type or "",
                collaboration.status or "",
                collaboration.institution_1_id or "",
                collaboration.institution_2_id or "",
                collaboration.start_date or "",
                collaboration.end_date or "",
            ])

    # -----------------------------------------------------
    # Institutions
    # -----------------------------------------------------

    elif report_type == "institutions":

        writer.writerow([
            "ID",
            "Name",
            "Type",
            "Address",
            "Website",
        ])

        institutions = db.query(Institution).all()

        for institution in institutions:

            writer.writerow([
                institution.id,
                institution.name,
                institution.type or "",
                institution.address or "",
                institution.website or "",
            ])

    else:

        writer.writerow([
            "Unsupported report type"
        ])

    return output.getvalue()


# =========================================================
# REAL PDF EXPORT
# =========================================================

def generate_pdf_export(
    db: Session,
    report_type: str
) -> bytes:

    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import (
        getSampleStyleSheet,
        ParagraphStyle,
    )
    from reportlab.lib.enums import TA_CENTER
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
    )
    from reportlab.lib.units import mm

    output = io.BytesIO()

    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=f"{report_type.title()} Report",
        author="Scientific Collaboration Network Analyzer",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=8,
        textColor=colors.HexColor("#6b1f36"),
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        alignment=TA_CENTER,
        spaceAfter=18,
        textColor=colors.HexColor("#666666"),
    )

    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        spaceBefore=12,
        spaceAfter=8,
        textColor=colors.HexColor("#6b1f36"),
    )

    normal_style = ParagraphStyle(
        "ReportNormal",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#333333"),
    )

    story = []

    # -----------------------------------------------------
    # Header
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "SCIENTIFIC COLLABORATION NETWORK",
            title_style,
        )
    )

    story.append(
        Paragraph(
            f"{report_type.upper()} REPORT",
            subtitle_style,
        )
    )

    # -----------------------------------------------------
    # Table helper
    # -----------------------------------------------------

    def add_table(rows):

        if not rows:
            return

        table = Table(
            rows,
            colWidths=[
                125 * mm,
                35 * mm
            ],
            repeatRows=1,
        )

        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#6b1f36"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8.5,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#d8c8ce"),
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        colors.HexColor("#f8f3f5"),
                    ],
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ])
        )

        story.append(table)
        story.append(Spacer(1, 10))

    # =====================================================
    # PUBLICATIONS
    # =====================================================

    if report_type == "publications":

        data = get_publication_report(db)

        story.append(
            Paragraph(
                f"Total Publications: "
                f"{data['total_publications']}",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                "Publications by Type",
                heading_style,
            )
        )

        rows = [
            ["Publication Type", "Count"]
        ]

        for publication_type, count in data[
            "type_counts"
        ].items():

            rows.append([
                str(publication_type),
                str(count),
            ])

        add_table(rows)

        story.append(
            Paragraph(
                "Publications by Status",
                heading_style,
            )
        )

        rows = [
            ["Status", "Count"]
        ]

        for status, count in data[
            "status_counts"
        ].items():

            rows.append([
                str(status),
                str(count),
            ])

        add_table(rows)

    # =====================================================
    # RESEARCHERS
    # =====================================================

    elif report_type == "researchers":

        data = get_research_report(db)

        story.append(
            Paragraph(
                f"Total Researchers: "
                f"{data['total_researchers']}",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                "Researchers by Department",
                heading_style,
            )
        )

        rows = [
            ["Department", "Researchers"]
        ]

        if data["department_counts"]:

            for department, count in data[
                "department_counts"
            ].items():

                rows.append([
                    str(department),
                    str(count),
                ])

        else:

            rows.append([
                "No departmental assignments",
                "0",
            ])

        add_table(rows)

        story.append(
            Paragraph(
                "Top Research Skills",
                heading_style,
            )
        )

        if data["skills_summary"]:

            for skill in data["skills_summary"]:

                story.append(
                    Paragraph(
                        f"• {skill}",
                        normal_style,
                    )
                )

        else:

            story.append(
                Paragraph(
                    "No researcher skills have been recorded.",
                    normal_style,
                )
            )

    # =====================================================
    # COLLABORATIONS
    # =====================================================

    elif report_type == "collaborations":

        data = get_collaboration_report(db)

        story.append(
            Paragraph(
                f"Total Institutional Collaborations: "
                f"{data['total_collaborations']}",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                "Collaborations by Type",
                heading_style,
            )
        )

        rows = [
            ["Collaboration Type", "Count"]
        ]

        for collaboration_type, count in data[
            "type_counts"
        ].items():

            rows.append([
                str(collaboration_type),
                str(count),
            ])

        add_table(rows)

    # =====================================================
    # INSTITUTIONS
    # =====================================================

    elif report_type == "institutions":

        data = get_institution_report(db)

        story.append(
            Paragraph(
                f"Total Institutions: "
                f"{data['total_institutions']}",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                f"Total Departments: "
                f"{data['total_departments']}",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                "Researchers by Institution",
                heading_style,
            )
        )

        rows = [
            ["Institution", "Researchers"]
        ]

        if data[
            "researcher_counts_by_institution"
        ]:

            for institution, count in data[
                "researcher_counts_by_institution"
            ].items():

                rows.append([
                    str(institution),
                    str(count),
                ])

        else:

            rows.append([
                "No researcher assignments found",
                "0",
            ])

        add_table(rows)

    else:

        story.append(
            Paragraph(
                "Unknown report type requested.",
                normal_style,
            )
        )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "Report generated automatically by "
            "Scientific Collaboration Network Analyzer.",
            subtitle_style,
        )
    )

    document.build(story)

    return output.getvalue()


# =========================================================
# SAVED REPORTS - CREATE
# =========================================================

def create_saved_report(
    db: Session,
    data: SavedReportCreate,
    user_id: int
) -> SavedReport:

    new_report = SavedReport(
        title=data.title,
        type=data.type,
        query_params=data.query_params,
        created_by=user_id,
    )

    db.add(new_report)

    db.commit()

    db.refresh(new_report)

    return new_report


# =========================================================
# SAVED REPORTS - GET
# =========================================================

def get_saved_reports(db: Session):

    return (
        db.query(SavedReport)
        .order_by(
            SavedReport.created_at.desc()
        )
        .all()
    )


# =========================================================
# SAVED REPORTS - UPDATE
# =========================================================

def update_saved_report(
    db: Session,
    report_id: int,
    data: SavedReportCreate
):

    saved_report = (
        db.query(SavedReport)
        .filter(
            SavedReport.id == report_id
        )
        .first()
    )

    if not saved_report:
        return None

    saved_report.title = data.title
    saved_report.type = data.type
    saved_report.query_params = data.query_params

    db.commit()

    db.refresh(saved_report)

    return saved_report


# =========================================================
# SAVED REPORTS - DELETE
# =========================================================

def delete_saved_report(
    db: Session,
    report_id: int
):

    saved_report = (
        db.query(SavedReport)
        .filter(
            SavedReport.id == report_id
        )
        .first()
    )

    if not saved_report:
        return None

    db.delete(saved_report)

    db.commit()

    return saved_report