import csv
import io
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.publication import Publication
from models.researcher import Researcher
from models.department import Department
from models.institution import Institution
from models.collaboration import Collaboration
from models.report import SavedReport
from schemas.report import SavedReportCreate

def get_publication_report(db: Session):
    total = db.query(Publication).count()
    
    types = db.query(Publication.type, func.count(Publication.id)).group_by(Publication.type).all()
    type_counts = {t or "Unknown": count for t, count in types}
    
    statuses = db.query(Publication.status, func.count(Publication.id)).group_by(Publication.status).all()
    status_counts = {s or "Unknown": count for s, count in statuses}
    
    return {
        "total_publications": total,
        "type_counts": type_counts,
        "status_counts": status_counts
    }

def get_research_report(db: Session):
    total = db.query(Researcher).count()
    
    deps = db.query(Department.name, func.count(Researcher.id)).join(
        Researcher, Researcher.department_id == Department.id, isouter=True
    ).group_by(Department.name).all()
    department_counts = {d or "Unassigned": count for d, count in deps if count > 0}
    
    all_skills = db.query(Researcher.skills).filter(Researcher.skills.isnot(None)).all()
    unique_skills = set()
    for row in all_skills:
        for skill in row[0].split(","):
            skill_clean = skill.strip()
            if skill_clean:
                unique_skills.add(skill_clean)
                
    return {
        "total_researchers": total,
        "department_counts": department_counts,
        "skills_summary": sorted(list(unique_skills))[:20]  # top 20 skills
    }

def get_collaboration_report(db: Session):
    total = db.query(Collaboration).count()
    types = db.query(Collaboration.type, func.count(Collaboration.id)).group_by(Collaboration.type).all()
    type_counts = {t or "General": count for t, count in types}
    
    return {
        "total_collaborations": total,
        "type_counts": type_counts
    }

def get_institution_report(db: Session):
    total_inst = db.query(Institution).count()
    total_dep = db.query(Department).count()
    
    insts = db.query(Institution.name, func.count(Researcher.id)).join(
        Researcher, Researcher.institution_id == Institution.id, isouter=True
    ).group_by(Institution.name).all()
    researcher_counts_by_institution = {i or "External": count for i, count in insts if count > 0}
    
    return {
        "total_institutions": total_inst,
        "total_departments": total_dep,
        "researcher_counts_by_institution": researcher_counts_by_institution
    }

def generate_csv_export(db: Session, report_type: str) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    if report_type == "publications":
        writer.writerow(["ID", "Title", "Type", "Status", "DOI", "Uploaded By", "Created At"])
        pubs = db.query(Publication).all()
        for p in pubs:
            writer.writerow([p.id, p.title, p.type, p.status, p.doi or "", p.uploaded_by, p.created_at])
            
    elif report_type == "researchers":
        writer.writerow(["ID", "Full Name", "ORCID ID", "Institution ID", "Department ID", "Skills", "Interests"])
        res = db.query(Researcher).all()
        for r in res:
            writer.writerow([r.id, r.full_name, r.orcid_id or "", r.institution_id or "", r.department_id or "", r.skills or "", r.research_interests or ""])
            
    elif report_type == "collaborations":
        writer.writerow(["ID", "Title", "Type", "Status", "Institution 1 ID", "Institution 2 ID", "Start Date", "End Date"])
        cols = db.query(Collaboration).all()
        for c in cols:
            writer.writerow([c.id, c.title, c.type or "", c.status, c.institution_1_id, c.institution_2_id, c.start_date or "", c.end_date or ""])
            
    elif report_type == "institutions":
        writer.writerow(["ID", "Name", "Type", "Address", "Website"])
        insts = db.query(Institution).all()
        for i in insts:
            writer.writerow([i.id, i.name, i.type or "", i.address or "", i.website or ""])
            
    else:
        writer.writerow(["Unsupported report type"])
        
    return output.getvalue()

def generate_pdf_export(db: Session, report_type: str) -> str:
    # A simple text-based report structure representing a PDF printout
    pdf_text = f"=========================================\n"
    pdf_text += f"   SCIENTIFIC COLLABORATION NETWORK       \n"
    pdf_text += f"            REPORT OUTLINE                \n"
    pdf_text += f"=========================================\n\n"
    pdf_text += f"Report Type: {report_type.upper()}\n"
    
    if report_type == "publications":
        rep = get_publication_report(db)
        pdf_text += f"Total Publications: {rep['total_publications']}\n\n"
        pdf_text += "Publications by Type:\n"
        for t, c in rep["type_counts"].items():
            pdf_text += f"  - {t}: {c}\n"
        pdf_text += "\nPublications by Status:\n"
        for s, c in rep["status_counts"].items():
            pdf_text += f"  - {s}: {c}\n"
            
    elif report_type == "researchers":
        rep = get_research_report(db)
        pdf_text += f"Total Researchers: {rep['total_researchers']}\n\n"
        pdf_text += "Researchers by Department:\n"
        for d, c in rep["department_counts"].items():
            pdf_text += f"  - {d}: {c}\n"
        pdf_text += "\nTop Skills Identified:\n"
        for s in rep["skills_summary"]:
            pdf_text += f"  * {s}\n"
            
    elif report_type == "collaborations":
        rep = get_collaboration_report(db)
        pdf_text += f"Total Institutional Collaborations: {rep['total_collaborations']}\n\n"
        pdf_text += "Collaborations by Type:\n"
        for t, c in rep["type_counts"].items():
            pdf_text += f"  - {t}: {c}\n"
            
    elif report_type == "institutions":
        rep = get_institution_report(db)
        pdf_text += f"Total Institutions: {rep['total_institutions']}\n"
        pdf_text += f"Total Departments: {rep['total_departments']}\n\n"
        pdf_text += "Researchers count by Institution:\n"
        for i, c in rep["researcher_counts_by_institution"].items():
            pdf_text += f"  - {i}: {c}\n"
            
    else:
        pdf_text += "Unknown report type requested."
        
    pdf_text += "\n\n=========================================\n"
    pdf_text += "Report Generated Automatically. End of Document.\n"
    pdf_text += "=========================================\n"
    return pdf_text

def create_saved_report(db: Session, data: SavedReportCreate, user_id: int) -> SavedReport:
    new_report = SavedReport(**data.model_dump(), created_by=user_id)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

def get_saved_reports(db: Session):
    return db.query(SavedReport).all()
