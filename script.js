let currentDocument = '';
let documentMetadata = {
    title: 'Untitled Document',
    author: 'Unknown',
    created: new Date(),
    modified: new Date(),
    version: '1.0'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const document = document.getElementById('document');
    
    // Update word count on input
    document.addEventListener('input', function() {
        updateWordCount();
        documentMetadata.modified = new Date();
    });
    
    // Initial word count
    updateWordCount();
    
    // Set default font
    document.style.fontFamily = 'Arial';
    document.style.fontSize = '12pt';
});

// Document operations
function newDocument() {
    const doc = document.getElementById('document');
    doc.innerHTML = '<p>Start typing your document here...</p>';
    currentDocument = '';
    documentMetadata = {
        title: 'Untitled Document',
        author: 'Unknown',
        created: new Date(),
        modified: new Date(),
        version: '1.0'
    };
    updateWordCount();
}

function openDocument() {
    const fileInput = document.getElementById('fileInput');
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const fileName = file.name.toLowerCase();
            const reader = new FileReader();
            
            if (fileName.endsWith('.askr') || fileName.endsWith('.askansz')) {
                // Handle custom format
                reader.onload = function(e) {
                    try {
                        const askrData = JSON.parse(e.target.result);
                        loadAskrDocument(askrData);
                    } catch (error) {
                        alert('Error: Invalid ASKR/ASKANSZ file format');
                    }
                };
                reader.readAsText(file);
            } else {
                // Handle regular text/html files
                reader.onload = function(e) {
                    document.getElementById('document').innerHTML = e.target.result;
                    updateWordCount();
                };
                reader.readAsText(file);
            }
        }
    };
    fileInput.click();
}

function saveDocument() {
    showSaveDialog();
}

function saveAsAskr(extension = 'askr') {
    const content = document.getElementById('document').innerHTML;
    const text = document.getElementById('document').innerText;
    
    // Create ASKR format data
    const askrData = {
        format: 'ASKR',
        version: '1.0',
        metadata: {
            ...documentMetadata,
            modified: new Date(),
            wordCount: getWordCount(text),
            charCount: text.length
        },
        content: {
            html: content,
            plainText: text,
            styles: getDocumentStyles()
        },
        settings: {
            fontFamily: getComputedStyle(document.getElementById('document')).fontFamily,
            fontSize: getComputedStyle(document.getElementById('document')).fontSize,
            pageSettings: {
                width: '8.5in',
                height: '11in',
                margin: '1in'
            }
        }
    };
    
    const jsonString = JSON.stringify(askrData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadAskrDocument(askrData) {
    if (askrData.format !== 'ASKR') {
        alert('Invalid ASKR format');
        return;
    }
    
    // Load content
    document.getElementById('document').innerHTML = askrData.content.html;
    
    // Load metadata
    documentMetadata = askrData.metadata;
    
    // Apply settings if available
    if (askrData.settings) {
        const doc = document.getElementById('document');
        if (askrData.settings.fontFamily) {
            doc.style.fontFamily = askrData.settings.fontFamily;
        }
        if (askrData.settings.fontSize) {
            doc.style.fontSize = askrData.settings.fontSize;
        }
    }
    
    updateWordCount();
    alert(`Loaded: ${documentMetadata.title}\nAuthor: ${documentMetadata.author}\nCreated: ${new Date(documentMetadata.created).toLocaleDateString()}`);
}

function getDocumentStyles() {
    const doc = document.getElementById('document');
    return {
        fontFamily: getComputedStyle(doc).fontFamily,
        fontSize: getComputedStyle(doc).fontSize,
        lineHeight: getComputedStyle(doc).lineHeight,
        color: getComputedStyle(doc).color,
        backgroundColor: getComputedStyle(doc).backgroundColor
    };
}

function showSaveDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Save Document</h3>
            <div class="form-group">
                <label>Title:</label>
                <input type="text" id="docTitle" value="${documentMetadata.title}">
            </div>
            <div class="form-group">
                <label>Author:</label>
                <input type="text" id="docAuthor" value="${documentMetadata.author}">
            </div>
            <div class="form-group">
                <label>Format:</label>
                <select id="saveFormat">
                    <option value="askr">ASKR Format (.askr)</option>
                    <option value="askansz">ASKANSZ Format (.askansz)</option>
                    <option value="html">HTML (.html)</option>
                    <option value="txt">Plain Text (.txt)</option>
                </select>
            </div>
            <div class="modal-buttons">
                <button onclick="executeSave()" class="btn-primary">Save</button>
                <button onclick="closeModal()" class="btn-secondary">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function executeSave() {
    const title = document.getElementById('docTitle').value;
    const author = document.getElementById('docAuthor').value;
    const format = document.getElementById('saveFormat').value;
    
    documentMetadata.title = title;
    documentMetadata.author = author;
    
    switch(format) {
        case 'askr':
        case 'askansz':
            saveAsAskr(format);
            break;
        case 'html':
            saveAsHtml();
            break;
        case 'txt':
            saveAsText();
            break;
    }
    
    closeModal();
}

function saveAsHtml() {
    const content = document.getElementById('document').innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
}

function saveAsText() {
    const content = document.getElementById('document').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function printDocument() {
    const content = document.getElementById('document').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Document</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 1in; }
                </style>
            </head>
            <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Formatting functions
function formatText(command) {
    document.execCommand(command, false, null);
    updateButtonStates();
    documentMetadata.modified = new Date();
}

function changeFontFamily() {
    const fontFamily = document.getElementById('fontFamily').value;
    document.execCommand('fontName', false, fontFamily);
    documentMetadata.modified = new Date();
}

function changeFontSize() {
    const fontSize = document.getElementById('fontSize').value;
    document.execCommand('fontSize', false, '7');
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.fontSize = fontSize + 'pt';
            try {
                range.surroundContents(span);
            } catch (e) {
                span.appendChild(range.extractContents());
                range.insertNode(span);
            }
        }
    }
    documentMetadata.modified = new Date();
}

function alignText(alignment) {
    switch(alignment) {
        case 'left':
            document.execCommand('justifyLeft', false, null);
            break;
        case 'center':
            document.execCommand('justifyCenter', false, null);
            break;
        case 'right':
            document.execCommand('justifyRight', false, null);
            break;
        case 'justify':
            document.execCommand('justifyFull', false, null);
            break;
    }
    documentMetadata.modified = new Date();
}

function insertList(type) {
    if (type === 'ul') {
        document.execCommand('insertUnorderedList', false, null);
    } else if (type === 'ol') {
        document.execCommand('insertOrderedList', false, null);
    }
    documentMetadata.modified = new Date();
}

function changeTextColor() {
    const color = document.getElementById('textColor').value;
    document.execCommand('foreColor', false, color);
    documentMetadata.modified = new Date();
}

function changeBackgroundColor() {
    const color = document.getElementById('bgColor').value;
    document.execCommand('backColor', false, color);
    documentMetadata.modified = new Date();
}

function updateButtonStates() {
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    
    boldBtn.classList.toggle('active', document.queryCommandState('bold'));
    italicBtn.classList.toggle('active', document.queryCommandState('italic'));
    underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
}

function getWordCount(text) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

function updateWordCount() {
    const doc = document.getElementById('document');
    const text = doc.innerText || doc.textContent;
    
    const wordCount = getWordCount(text);
    const charCount = text.length;
    
    document.getElementById('wordCount').textContent = `Words: ${wordCount}`;
    document.getElementById('charCount').textContent = `Characters: ${charCount}`;
}

// Add converter page navigation
function openConverter() {
    window.open('converter.html', '_blank');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'b':
                e.preventDefault();
                formatText('bold');
                break;
            case 'i':
                e.preventDefault();
                formatText('italic');
                break;
            case 'u':
                e.preventDefault();
                formatText('underline');
                break;
            case 's':
                e.preventDefault();
                saveDocument();
                break;
            case 'n':
                e.preventDefault();
                newDocument();
                break;
            case 'o':
                e.preventDefault();
                openDocument();
                break;
            case 'p':
                e.preventDefault();
                printDocument();
                break;
        }
    }
});

document.addEventListener('selectionchange', updateButtonStates);
