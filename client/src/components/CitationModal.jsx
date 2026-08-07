import { useEffect, useState } from "react";
import { FaCheck, FaClipboard, FaDownload, FaTimes } from "react-icons/fa";

const STYLES = ["APA", "IEEE", "MLA", "Chicago", "BibTeX"];

function CitationModal({ open, onClose, publicationId, citation, style, onStyleChange, onGenerate, loading }) {
    const [copied, setCopied] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    useEffect(() => {
        if (!open) {
            setCopied(false);
            setHasGenerated(false);
        }
    }, [open]);

    if (!open) return null;

    const copy = async () => {
        if (!citation) return;
        await navigator.clipboard.writeText(citation);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
    };

    const download = () => {
        if (!citation) return;
        const blob = new Blob([citation], { type: style === "BibTeX" ? "application/x-bibtex" : "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `citation-${publicationId}.${style === "BibTeX" ? "bib" : "txt"}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const generate = async () => {
        await onGenerate();
        setHasGenerated(true);
    };

    return <div className="citation-modal-backdrop" role="presentation" onClick={onClose}>
        <section className="citation-modal" role="dialog" aria-modal="true" aria-labelledby="citation-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="citation-modal-header">
                <div><span className="citation-modal-kicker">ACADEMIC TOOLKIT</span><h2 id="citation-modal-title">Generate Citation</h2><p>Generate a citation for this publication in your preferred academic format.</p></div>
                <button className="citation-close" type="button" onClick={onClose} aria-label="Close citation dialog"><FaTimes /></button>
            </div>
            {!hasGenerated && <div className="citation-modal-intro">
                <div className="citation-intro-icon">✦</div>
                <h3>Ready to create your citation?</h3>
                <p>Choose your preferred academic format, then generate a polished citation for this publication.</p>
            </div>}
            <div className="citation-modal-tabs" role="tablist" aria-label="Citation styles">
                {STYLES.map((option) => <button key={option} type="button" role="tab" aria-selected={style === option} className={style === option ? "is-selected" : ""} onClick={() => onStyleChange(option)}>{option}</button>)}
            </div>
            {hasGenerated && !citation && !loading && <div className="citation-preview citation-preview-empty"><span>Choose a format to preview your citation.</span></div>}
            {hasGenerated && loading && <div className="citation-preview citation-preview-loading"><span className="citation-loading-dot" /> Preparing your {style} citation…</div>}
            {hasGenerated && citation && !loading && <div className={`citation-preview ${style === "BibTeX" ? "is-bibtex" : ""}`}><div className="citation-preview-label">Preview · {style}</div><p>{citation}</p></div>}
            {copied && <div className="citation-success" role="status"><FaCheck /> Citation copied successfully</div>}
            <div className="citation-modal-actions">
                <button type="button" className="citation-secondary" onClick={onClose}>Cancel</button>
                {citation && <><button type="button" className="citation-secondary" onClick={copy}><FaClipboard /> Copy</button><button type="button" className="citation-secondary" onClick={download}><FaDownload /> Download</button></>}
                <button type="button" className="citation-primary" onClick={generate} disabled={loading || !publicationId}>{loading ? "Generating…" : "Generate Citation"}</button>
            </div>
        </section>
    </div>;
}

export default CitationModal;
