import { useDropzone } from 'react-dropzone';

export default function UploadZone({ onTextExtracted, isLoading }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        disabled: isLoading,
        onDrop: async ([file]) => {
            if (!file) return;
            await extractText(file);
        },
    });

    async function extractText(file) {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map((item) => item.str).join(' ') + '\n';
        }

        onTextExtracted(fullText.trim(), file.name);
    }

    return (
        <div className="upload-screen">
            <div {...getRootProps()} className={`upload-zone${isDragActive ? ' dragging' : ''}`}>
                <input {...getInputProps()} />
                <span className="upload-icon">📄</span>
                <div className="upload-title">
                    {isDragActive ? 'Drop your PDF here' : 'Upload a PDF'}
                </div>
                <div className="upload-sub">
                    Drag & drop any PDF, or click to browse
                </div>
                <span className="upload-badge">PDF</span>
            </div>
            <p className="upload-hint">
                Synapse will extract the key concepts &amp; relationships from your document and
                render them as an interactive knowledge graph.
            </p>
        </div>
    );
}
