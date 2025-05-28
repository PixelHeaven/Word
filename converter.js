let currentFile = null;
let currentFileData = null;

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('converterFileInput');
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop functionality
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
});

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    currentFile = file;
    const fileName = file.name.toLowerCase();
    
    // Show file info
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileDetails').innerHTML = `
        <p><strong>Name:</strong> ${file.name}</p>
        <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        <p><strong>Type:</strong> ${file.type || 'Unknown'}</p>
        <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
    `;
    
    // Read file content
    const reader = new FileReader();
    
    if (fileName.endsWith('.askr') || fileName.endsWith('.askansz')) {
        reader.onload = function(e) {
            try {
                currentFileData = JSON.parse(e.target.result);
                showAskrPreview(currentFileData);
                showConversionOptions();
            } catch (error) {
                alert('Error: Invalid ASKR/ASKANSZ file format');
            }
        };
        reader.readAsText(file);
    } else if (fileName.endsWith('.txt')) {
        reader.onload = function(e) {
            currentFileData = {
                format: 'TEXT',
                content: e.target.result,
                metadata: {
                    title: file.name.replace('.txt', ''),
                    created: new Date(file.lastModified),
                    wordCount: countWords(e.target.result)
                }
            };
            showTextPreview(e.target.result);
            showConversionOptions();
        };
        reader.readAsText(file);
    } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        reader.onload = function(e) {
            currentFileData = {
                format: 'HTML',
                content: e.target.result,
                metadata: {
                    title: file.name.replace(/\.(html|htm)$/, ''),
                    created: new Date(file.lastModified)
                }
            };
            showHtmlPreview(e.target.result);
            showConversionOptions();
        };
        reader.readAsText(file);
    } else if (fileName.endsWith('.docx')) {
        // For DOCX, we'll show a placeholder since full parsing requires complex libraries
        currentFileData = {
            format: 'DOCX',
            content: 'DOCX file detected. Full parsing requires server-side processing.',
            metadata: {
                title: file.name.replace('.docx', ''),
                created: new Date(file.lastModified)
            }
        };
        showDocxPlaceholder();
        showConversionOptions();
    } else if (fileName.endsWith('.pdf')) {
        // For PDF, we'll show a placeholder since full parsing requires complex libraries
        currentFileData = {
            format: 'PDF',
            content: 'PDF file detected. Text extraction requires server-side processing.',
            metadata: {
                title: file.name.replace('.pdf', ''),
                created: new Date(file.lastModified)
            }
        };
        showPdfPlaceholder();
        showConversionOptions();
    } else {
        alert('Unsupported file format. Please select a supported file type.');
    }
}

function showAskrPreview(askrData) {
    document.getElementById('previewArea').style.display = 'block';
    document.getElementById('previewContent').innerHTML = `
        <div class="askr-preview">
            <h5>ASKR/ASKANSZ Document Preview</h5>
            <div class="metadata">
                <p><strong>Title:</strong> ${askrData.metadata?.title || 'Untitled'}</p>
                <p><strong>Author:</strong> ${askrData.metadata?.author || 'Unknown'}</p>
                <p><strong>Created:</strong> ${new Date(askrData.metadata?.created).toLocaleString()}</p>
                <p><strong>Word Count:</strong> ${askrData.metadata?.wordCount || 'Unknown'}</p>
                <p><strong>Version:</strong> ${askrData.version || '1.0'}</p>
            </div>
            <div class="content-preview">
                <h6>Content Preview:</h6>
                <div style="border: 1px solid #ddd; padding: 10px; max-height: 200px; overflow-y: auto;">
                    ${askrData.content?.html || askrData.content?.plainText || 'No content available'}
                </div>
            </div>
        </div>
    `;
}

function showTextPreview(content) {
    document.getElementById('previewArea').style.display = 'block';
    document.getElementById('previewContent').innerHTML = `
        <div class="text-preview">
            <h5>Text File Preview</h5>
            <div style="border: 1px solid #ddd; padding: 10px; max-height: 200px; overflow-y: auto; white-space: pre-wrap;">
                ${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}
            </div>
            <p><small>Word Count: ${countWords(content)}</small></p>
        </div>
    `;
}

function showHtmlPreview(content) {
    document.getElementById('previewArea').style.display = 'block';
    
    // Extract text content for preview
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    document.getElementById('previewContent').innerHTML = `
        <div class="html-preview">
            <h5>HTML File Preview</h5>
            <div style="border: 1px solid #ddd; padding: 10px; max-height: 200px; overflow-y: auto;">
                ${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}
            </div>
            <p><small>Text Content Word Count: ${countWords(textContent)}</small></p>
        </div>
    `;
}

function showDocxPlaceholder() {
    document.getElementById('previewArea').style.display = 'block';
    document.getElementById('previewContent').innerHTML = `
        <div class="docx-preview">
            <h5>DOCX File Detected</h5>
            <div style="border: 1px solid #ddd; padding: 20px; text-align: center; background: #f8f9fa;">
                <p>📄 Microsoft Word Document</p>
                <p>Full DOCX parsing requires additional libraries.</p>
                <p>You can convert this to ASKR/ASKANSZ format, but content extraction is limited.</p>
                <p><small>For full DOCX support, please open the file in Microsoft Word and save as HTML or TXT first.</small></p>
            </div>
        </div>
    `;
}

function showPdfPlaceholder() {
    document.getElementById('previewArea').style.display = 'block';
    document.getElementById('previewContent').innerHTML = `
        <div class="pdf-preview">
            <h5>PDF File Detected</h5>
            <div style="border: 1px solid #ddd; padding: 20px; text-align: center; background: #f8f9fa;">
                <p>📕 PDF Document</p>
                <p>PDF text extraction requires server-side processing.</p>
                <p>You can convert this to ASKR/ASKANSZ format, but content extraction is limited.</p>
                <p><small>For full PDF support, please extract text manually and save as TXT first.</small></p>
            </div>
        </div>
    `;
}

function showConversionOptions() {
    document.getElementById('conversionOptions').style.display = 'grid';
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function convertTo(format) {
    if (!currentFileData) {
        alert('No file loaded for conversion');
        return;
    }
    
    switch(format) {
        case 'askr':
        case 'askansz':
            convertToAskr(format);
            break;
        case 'pdf':
            convertToPdf();
            break;
        case 'docx':
            convertToDocx();
            break;
        case 'txt':
            convertToTxt();
            break;
        case 'html':
            convertToHtml();
            break;
        default:
            alert('Conversion format not supported');
    }
}

function convertToAskr(extension) {
    let askrData;
    
    if (currentFileData.format === 'ASKR') {
        // Already ASKR format, just change extension
        askrData = currentFileData;
    } else {
        // Convert from other format to ASKR
        askrData = {
            format: 'ASKR',
            version: '1.0',
            metadata: {
                title: currentFileData.metadata?.title || currentFile.name.replace(/\.[^/.]+$/, ""),
                author: 'Converted Document',
                created: currentFileData.metadata?.created || new Date(),
                modified: new Date(),
                wordCount: currentFileData.metadata?.wordCount || 0,
                charCount: currentFileData.content?.length || 0,
                originalFormat: currentFileData.format
            },
            content: {
                html: currentFileData.format === 'HTML' ? currentFileData.content : `<p>${currentFileData.content?.replace(/\n/g, '</p><p>') || ''}</p>`,
                plainText: currentFileData.format === 'HTML' ? extractTextFromHtml(currentFileData.content) : currentFileData.content,
                styles: getDefaultStyles()
            },
            settings: {
                fontFamily: 'Arial',
                fontSize: '12pt',
                pageSettings: {
                    width: '8.5in',
                    height: '11in',
                    margin: '1in'
                }
            }
        };
    }
    
    const jsonString = JSON.stringify(askrData, null, 2);
    downloadFile(jsonString, `converted_document.${extension}`, 'application/json');
}

function convertToPdf() {
    // Since we can't generate real PDFs in browser without libraries,
    // we'll create an HTML file that can be printed to PDF
    let content = '';
    
    if (currentFileData.format === 'ASKR') {
        content = currentFileData.content.html || currentFileData.content.plainText;
    } else if (currentFileData.format === 'HTML') {
        content = currentFileData.content;
    } else {
        content = `<pre>${currentFileData.content}</pre>`;
    }
    
    const htmlForPdf = `
<!DOCTYPE html>
<html>
<head>
    <title>${currentFileData.metadata?.title || 'Converted Document'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 1in; line-height: 1.6; }
        @media print { body { margin: 0.5in; } }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    
    // Open in new window for printing to PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlForPdf);
    printWindow.document.close();
    
    setTimeout(() => {
        alert('A new window has opened. Use your browser\'s "Print to PDF" feature to save as PDF.');
        printWindow.focus();
    }, 500);
}

function convertToDocx() {
    // Since we can't generate real DOCX files in browser without libraries,
    // we'll create an RTF file which can be opened by Word
    let content = '';
    
    if (currentFileData.format === 'ASKR') {
        content = currentFileData.content.plainText || extractTextFromHtml(currentFileData.content.html);
    } else if (currentFileData.format === 'HTML') {
        content = extractTextFromHtml(currentFileData.content);
    } else {
        content = currentFileData.content;
    }
    
    // Create RTF format (Rich Text Format) which Word can open
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
    
    downloadFile(rtfContent, 'converted_document.rtf', 'application/rtf');
    alert('Downloaded as RTF format. This can be opened in Microsoft Word and saved as DOCX.');
}

function convertToTxt() {
    let content = '';
    
    if (currentFileData.format === 'ASKR') {
        content = currentFileData.content.plainText || extractTextFromHtml(currentFileData.content.html);
    } else if (currentFileData.format === 'HTML') {
        content = extractTextFromHtml(currentFileData.content);
    } else {
        content = currentFileData.content;
    }
    
    downloadFile(content, 'converted_document.txt', 'text/plain');
}

function convertToHtml() {
    let content = '';
    
    if (currentFileData.format === 'ASKR') {
        content = currentFileData.content.html || `<pre>${currentFileData.content.plainText}</pre>`;
    } else if (currentFileData.format === 'HTML') {
        content = currentFileData.content;
    } else {
        content = `<pre>${currentFileData.content}</pre>`;
    }
    
    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentFileData.metadata?.title || 'Converted Document'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    
    downloadFile(htmlDocument, 'converted_document.html', 'text/html');
}

function extractTextFromHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function getDefaultStyles() {
    return {
        fontFamily: 'Arial',
        fontSize: '12pt',
        lineHeight: '1.6',
        color: '#000000',
        backgroundColor: '#ffffff'
    };
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showConversionSuccess(filename);
}

function showConversionSuccess(filename) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    successDiv.innerHTML = `
        <strong>✓ Conversion Complete!</strong><br>
        <small>Downloaded: ${filename}</small>
    `;
    
    // Add animation keyframes
    if (!document.getElementById('successAnimation')) {
        const style = document.createElement('style');
        style.id = 'successAnimation';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Add some utility functions for better file handling
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('Converter error:', e.error);
    alert('An error occurred during conversion. Please try again or check the file format.');
});
