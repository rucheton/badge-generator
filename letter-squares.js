class LetterSquaresGenerator {
    constructor() {
        this.names = [];
        this.settings = {
            squareSize: 3, // cm
            fontSize: 24, // px
            textCase: 'uppercase',
            borderWidth: 2, // px
            borderColor: '#333333'
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updatePreview();
        this.updateCounts();
    }

    bindEvents() {
        // Settings changes
        document.getElementById('squareSize').addEventListener('change', (e) => {
            this.settings.squareSize = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('textCase').addEventListener('change', (e) => {
            this.settings.textCase = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('borderWidth').addEventListener('change', (e) => {
            this.settings.borderWidth = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('borderColor').addEventListener('change', (e) => {
            this.settings.borderColor = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        // Button events
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('importCSV').addEventListener('click', () => this.importCSV());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDF());
    }

    clearAll() {
        this.names = [];
        this.updateNamesDisplay();
        this.updatePreview();
        this.updateCounts();
        this.saveData();
    }

    importCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.parseCSV(e.target.result);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        this.names = [];

        lines.forEach((line, index) => {
            if (line.trim() && index > 0) { // Skip header
                const [firstName] = line.split(',').map(s => s.trim());
                if (firstName) {
                    this.names.push(firstName);
                }
            }
        });

        this.updateNamesDisplay();
        this.updatePreview();
        this.updateCounts();
        this.saveData();
    }

    updateNamesDisplay() {
        const namesDisplay = document.getElementById('namesDisplay');
        
        if (this.names.length === 0) {
            namesDisplay.innerHTML = '<div class="no-names">No names loaded. Import a CSV file or add names manually.</div>';
            return;
        }

        const namesHTML = this.names.map(name => 
            `<span class="name-item">${name}</span>`
        ).join('');
        
        namesDisplay.innerHTML = namesHTML;
    }

    updatePreview() {
        const previewContainer = document.getElementById('letterSquaresPreview');
        
        if (this.names.length === 0) {
            previewContainer.innerHTML = '<div class="no-names">No names to preview. Import CSV data above!</div>';
            return;
        }

        // Calculate how many letters can fit per line
        const lettersPerLine = this.calculateLettersPerLine();
        
        // Generate HTML for all names with proper line breaks
        const allLinesHTML = this.names.map(name => {
            const nameLines = this.splitNameIntoLines(name, lettersPerLine);
            return nameLines.map(line => {
                const lineLetters = line.split('').filter(letter => letter.trim());
                const squaresHTML = lineLetters.map(letter => {
                    const squareSizePx = this.settings.squareSize * 37.7952755906; // Convert cm to pixels (96 DPI)
                    return `<div class="letter-square" style="width: ${squareSizePx}px; height: ${squareSizePx}px; font-size: ${this.settings.fontSize}px; border-width: ${this.settings.borderWidth}px; border-color: ${this.settings.borderColor};">${letter}</div>`;
                }).join('');
                return `<div class="name-line">${squaresHTML}</div>`;
            }).join('');
        }).join('');

        previewContainer.innerHTML = allLinesHTML;
    }

    processText(text) {
        switch (this.settings.textCase) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'capitalize':
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            default:
                return text;
        }
    }

    // Calculate how many letters can fit on one line based on square size and page width
    calculateLettersPerLine() {
        // Use the same calculation as in generatePDF
        const { jsPDF } = window.jspdf;
        const tempPdf = new jsPDF('p', 'cm', 'a4');
        const pageWidth = tempPdf.internal.pageSize.getWidth();
        const margin = 1; // margin in cm
        const availableWidth = pageWidth - (2 * margin);
        const lettersPerLine = Math.floor(availableWidth / this.settings.squareSize);
        console.log(`calculateLettersPerLine: pageWidth=${pageWidth}cm, margin=${margin}cm, availableWidth=${availableWidth}cm, squareSize=${this.settings.squareSize}cm, lettersPerLine=${lettersPerLine}`);
        return Math.max(1, lettersPerLine); // At least 1 letter per line
    }

    // Split a name into multiple lines if it's too long
    splitNameIntoLines(name, lettersPerLine) {
        const processedName = this.processText(name);
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < processedName.length; i++) {
            const letter = processedName[i];
            if (letter.trim()) { // Only count non-space characters
                if (currentLine.length >= lettersPerLine) {
                    lines.push(currentLine);
                    currentLine = letter;
                } else {
                    currentLine += letter;
                }
            }
        }
        
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    updateCounts() {
        const nameCount = this.names.length;
        const letterCount = this.names.reduce((total, name) => {
            return total + this.processText(name).replace(/\s/g, '').length;
        }, 0);

        document.getElementById('nameCount').textContent = `${nameCount} name${nameCount !== 1 ? 's' : ''}`;
        document.getElementById('letterCount').textContent = `${letterCount} letter${letterCount !== 1 ? 's' : ''}`;
    }

    async generatePDF() {
        if (this.names.length === 0) {
            alert('Please import CSV data before generating PDF.');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Generate PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'cm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const squareSizeCm = this.settings.squareSize;
            const margin = 1; // 1cm margin

            // Calculate how many squares fit per row
            const squaresPerRow = Math.floor((pageWidth - 2 * margin) / squareSizeCm); // No gap between squares

            let currentPage = 0;
            let currentY = margin; // Track current Y position

            // Calculate how many letters can fit per line
            const lettersPerLine = this.calculateLettersPerLine();
            console.log(`PDF: Letters per line: ${lettersPerLine}`);

            // Process each name separately
            for (let nameIndex = 0; nameIndex < this.names.length; nameIndex++) {
                const name = this.names[nameIndex];
                const nameLines = this.splitNameIntoLines(name, lettersPerLine);
                console.log(`PDF: Name "${name}" split into ${nameLines.length} lines:`, nameLines);
                
                // Process each line of the name
                for (let lineIndex = 0; lineIndex < nameLines.length; lineIndex++) {
                    const line = nameLines[lineIndex];
                    const lineLetters = line.split('').filter(letter => letter.trim());
                    
                    // Check if we need a new page for this line
                    if (currentY + squareSizeCm > pageHeight - margin) {
                        pdf.addPage();
                        currentY = margin;
                    }

                    // Render letters for this line
                    for (let letterIndex = 0; letterIndex < lineLetters.length; letterIndex++) {
                        const letter = lineLetters[letterIndex];
                        const x = margin + letterIndex * squareSizeCm;
                    
                    const finalX = x;
                    const finalY = currentY;
                        
                    // Create a temporary container for this single letter square
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.left = '-9999px';
                    tempContainer.style.top = '0';
                    tempContainer.style.background = 'white';
                    document.body.appendChild(tempContainer);

                    // Create the letter square element
                    const squareSizePx = squareSizeCm * 37.7952755906; // Convert cm to pixels
                    const squareElement = document.createElement('div');
                    squareElement.style.cssText = `
                        width: ${squareSizePx}px;
                        height: ${squareSizePx}px;
                        font-size: ${this.settings.fontSize}px;
                        border: ${this.settings.borderWidth}px solid ${this.settings.borderColor};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #333;
                        background: white;
                        box-sizing: border-box;
                    `;
                    squareElement.textContent = letter;
                    tempContainer.appendChild(squareElement);

                    try {
                        // Convert the square to canvas
                        const canvas = await html2canvas(squareElement, {
                            scale: 4, // Résolution 4x pour impression 300 DPI professionnelle
                            backgroundColor: 'white',
                            width: squareSizePx,
                            height: squareSizePx,
                            useCORS: true,
                            allowTaint: true,
                            logging: false,
                            removeContainer: false, // Garder le conteneur pour éviter les problèmes
                            imageTimeout: 0 // Pas de timeout pour les images
                        });

                        const imgData = canvas.toDataURL('image/png');
                        pdf.addImage(imgData, 'PNG', finalX, finalY, squareSizeCm, squareSizeCm);
                    } catch (error) {
                        console.error('Error generating square for letter:', letter, error);
                        // Fallback: create simple text square
                        const borderColor = this.hexToRgb(this.settings.borderColor);
                        pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
                        pdf.setLineWidth(this.settings.borderWidth * 0.0352778);
                        pdf.rect(finalX, finalY, squareSizeCm, squareSizeCm);
                        
                        const fontSizePt = Math.min(Math.max(this.settings.fontSize * 0.75, 8), 72);
                        pdf.setFontSize(fontSizePt);
                        pdf.setTextColor(51, 51, 51);
                        const textY = finalY + squareSizeCm/2 + (fontSizePt * 0.35);
                        pdf.text(letter, finalX + squareSizeCm/2, textY, { align: 'center' });
                    }

                    // Clean up temporary container
                    document.body.removeChild(tempContainer);
                    }
                    
                    // Move to next line after processing all letters in this line
                    currentY += squareSizeCm;
                }
            }

            // Save PDF
            pdf.save('letter-squares.pdf');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            // Hide loading state
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        const generateBtn = document.getElementById('generatePDF');
        const generateText = document.getElementById('generateText');
        const generateSpinner = document.getElementById('generateSpinner');
        
        if (isLoading) {
            generateBtn.disabled = true;
            generateText.textContent = 'Generating PDF...';
            generateSpinner.style.display = 'inline';
        } else {
            generateBtn.disabled = false;
            generateText.textContent = 'Generate PDF';
            generateSpinner.style.display = 'none';
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    saveData() {
        try {
            const data = {
                settings: this.settings,
                names: this.names
            };
            localStorage.setItem('letterSquaresData', JSON.stringify(data));
        } catch (error) {
            console.error('Could not save data to localStorage:', error);
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('letterSquaresData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Load settings
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    document.getElementById('squareSize').value = this.settings.squareSize;
                    document.getElementById('fontSize').value = this.settings.fontSize;
                    document.getElementById('textCase').value = this.settings.textCase;
                    document.getElementById('borderWidth').value = this.settings.borderWidth;
                    document.getElementById('borderColor').value = this.settings.borderColor;
                }

                // Load names
                if (data.names && data.names.length > 0) {
                    this.names = data.names;
                    this.updateNamesDisplay();
                }
            }
        } catch (error) {
            console.log('Could not load data from localStorage:', error);
        }
    }
}

// Initialize the letter squares generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LetterSquaresGenerator();
});
