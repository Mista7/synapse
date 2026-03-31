export default function NodeDetail({ node, onClose }) {
    if (!node) return null;

    return (
        <aside className="detail-panel">
            <div className="detail-header">
                <div className="detail-icon">🔮</div>
                <div className="detail-label">{node.label}</div>
                <button className="detail-close" onClick={onClose} title="Close">✕</button>
            </div>
            <div className="detail-body">
                <div>
                    <div className="detail-section-label">Summary</div>
                    <p className="detail-summary-text">{node.summary}</p>
                </div>
                <div>
                    <div className="detail-section-label">Source</div>
                    <blockquote className="detail-source-box">"{node.source}"</blockquote>
                </div>
            </div>
        </aside>
    );
}
