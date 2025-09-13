class WordCloudGenerator {
    constructor() {
        this.names = [];
        this.nameStates = {}; // { name: { hidden: boolean, highlighted: boolean, count: number } }
        this.wordCloudContainer = document.getElementById('wordCloudContainer');
        this.namesList = document.getElementById('namesList');
        this.namesPanel = document.getElementById('namesPanel');
        this.stats = document.getElementById('stats');
        
        this.settings = {
            minFontSize: 12,
            maxFontSize: 48,
            colorScheme: 'rainbow',
            textCase: 'uppercase',
            highlightMultiplier: 3
        };
        
        this.csvData = null; // Store the raw CSV data
        this.autoPreviewTimeout = null; // For debouncing auto preview

        this.colorSchemes = {
            rainbow: ['#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e91e63'],
            black: ['#000000'],
            'black-red-initial': ['#000000'] // Will be handled specially
        };

        this.loadData();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('csvFile').addEventListener('change', (e) => this.handleCSVUpload(e));
        document.getElementById('minFontSize').addEventListener('input', (e) => this.updateSetting('minFontSize', parseInt(e.target.value)));
        document.getElementById('maxFontSize').addEventListener('input', (e) => this.updateSetting('maxFontSize', parseInt(e.target.value)));
        document.getElementById('colorScheme').addEventListener('change', (e) => this.updateSetting('colorScheme', e.target.value));
        document.getElementById('textCase').addEventListener('change', (e) => this.updateSetting('textCase', e.target.value));
        document.getElementById('highlightMultiplier').addEventListener('input', (e) => this.updateSetting('highlightMultiplier', parseInt(e.target.value)));
        document.getElementById('exportPDF').addEventListener('click', () => this.exportToPDF());
        document.getElementById('clearData').addEventListener('click', () => this.clearAllData());
    }

    loadData() {
        try {
            const saved = localStorage.getItem('wordCloudData');
            if (saved) {
                const data = JSON.parse(saved);
                this.settings = { ...this.settings, ...data.settings };
                this.nameStates = data.nameStates || {};
                this.csvData = data.csvData || null;
                
                // Update UI
                document.getElementById('minFontSize').value = this.settings.minFontSize;
                document.getElementById('maxFontSize').value = this.settings.maxFontSize;
                document.getElementById('colorScheme').value = this.settings.colorScheme;
                document.getElementById('textCase').value = this.settings.textCase;
                document.getElementById('highlightMultiplier').value = this.settings.highlightMultiplier;
                
                // Reload CSV data if available
                if (this.csvData) {
                    this.parseCSV(this.csvData);
                    this.updateCSVStatus('Données CSV chargées depuis la sauvegarde');
                    this.scheduleAutoPreview(); // Trigger auto preview after data load
                }
            }
        } catch (error) {
            console.log('Could not load data from localStorage:', error);
        }
    }

    saveData() {
        try {
            const data = {
                settings: this.settings,
                nameStates: this.nameStates,
                csvData: this.csvData
            };
            localStorage.setItem('wordCloudData', JSON.stringify(data));
        } catch (error) {
            console.error('Could not save data to localStorage:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveData();
        this.scheduleAutoPreview(); // Trigger auto preview on setting change
    }

    processText(text) {
        switch (this.settings.textCase) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'capitalized':
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            default:
                return text;
        }
    }

    shuffleArray(array) {
        // Fisher-Yates shuffle algorithm
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }


    getOriginalName(processedName) {
        // Find the original name that matches this processed name
        for (const originalName of Object.keys(this.nameStates)) {
            if (this.processText(originalName) === processedName) {
                return originalName;
            }
        }
        return processedName; // Fallback
    }

    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                this.csvData = csv; // Store the raw CSV data
                this.parseCSV(csv);
                this.saveData(); // Save the CSV data
                this.updateCSVStatus(`Fichier CSV chargé: ${file.name}`);
                this.scheduleAutoPreview(); // Trigger auto preview after CSV load
            } catch (error) {
                alert('Erreur lors de la lecture du fichier CSV: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    parseCSV(csv) {
        const lines = csv.split('\n');
        const names = [];
        
        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (line) {
                const columns = line.split(',');
                const name = columns[0] ? columns[0].trim().replace(/"/g, '') : '';
                if (name) {
                    names.push(name);
                }
            }
        }

        this.names = names;
        this.initializeNameStates();
        this.updateNamesList();
        this.updateStats();
        this.showNamesPanel();
        
        console.log('CSV parsed:', this.names);
    }

    initializeNameStates() {
        // Count occurrences of each name
        const nameCounts = {};
        this.names.forEach(name => {
            nameCounts[name] = (nameCounts[name] || 0) + 1;
        });
        
        // Initialize states with correct counts
        Object.keys(nameCounts).forEach(name => {
            if (!this.nameStates[name]) {
                this.nameStates[name] = {
                    hidden: false,
                    highlighted: false,
                    count: nameCounts[name]
                };
            } else {
                // Update count if name already exists
                this.nameStates[name].count = nameCounts[name];
            }
        });
        
        console.log('Name states initialized:', this.nameStates);
    }

    updateNamesList() {
        this.namesList.innerHTML = '';
        
        const uniqueNames = [...new Set(this.names)].sort();
        
        uniqueNames.forEach(name => {
            const state = this.nameStates[name];
            const processedName = this.processText(name);
            const nameItem = document.createElement('div');
            nameItem.className = `name-item ${state.hidden ? 'hidden' : ''} ${state.highlighted ? 'highlighted' : ''}`;
            
            nameItem.innerHTML = `
                <span>${processedName} (${state.count})</span>
                <div class="name-controls">
                    ${state.hidden ? 
                        `<button class="btn-show" onclick="wordCloud.toggleNameVisibility('${name}')">Afficher</button>` :
                        `<button class="btn-hide" onclick="wordCloud.toggleNameVisibility('${name}')">Masquer</button>`
                    }
                    ${state.highlighted ? 
                        `<button class="btn-normal" onclick="wordCloud.toggleHighlight('${name}')">Normal</button>` :
                        `<button class="btn-highlight" onclick="wordCloud.toggleHighlight('${name}')">Mettre en avant</button>`
                    }
                </div>
            `;
            
            this.namesList.appendChild(nameItem);
        });
    }

    toggleNameVisibility(name) {
        this.nameStates[name].hidden = !this.nameStates[name].hidden;
        this.updateNamesList();
        this.updateStats();
        this.saveData();
        this.scheduleAutoPreview(); // Trigger auto preview on visibility change
    }

    toggleHighlight(name) {
        console.log(`=== TOGGLE HIGHLIGHT DEBUG ===`);
        console.log(`Toggling highlight for: ${name}`);
        console.log(`Current state before:`, this.nameStates[name]);
        
        // Remove highlight from all other names
        Object.keys(this.nameStates).forEach(n => {
            this.nameStates[n].highlighted = false;
        });
        
        // Toggle highlight for selected name
        this.nameStates[name].highlighted = !this.nameStates[name].highlighted;
        
        console.log(`New state after:`, this.nameStates[name]);
        console.log(`All states:`, this.nameStates);
        console.log(`=== END TOGGLE HIGHLIGHT DEBUG ===`);
        
        this.updateNamesList();
        this.updateStats();
        this.saveData();
        this.scheduleAutoPreview(); // Trigger auto preview on highlight change
    }

    updateStats() {
        const totalNames = Object.keys(this.nameStates).length;
        const visibleNames = Object.values(this.nameStates).filter(state => !state.hidden).length;
        const highlightedNames = Object.values(this.nameStates).filter(state => state.highlighted).length;
        
        document.getElementById('totalNames').textContent = totalNames;
        document.getElementById('visibleNames').textContent = visibleNames;
        document.getElementById('highlightedNames').textContent = highlightedNames;
    }

    showNamesPanel() {
        this.namesPanel.style.display = 'block';
        this.stats.style.display = 'flex';
        document.getElementById('clearData').style.display = 'inline-block';
        document.getElementById('autoPreviewStatus').style.display = 'block';
    }

    scheduleAutoPreview() {
        // Clear existing timeout
        if (this.autoPreviewTimeout) {
            clearTimeout(this.autoPreviewTimeout);
        }
        
        // Set new timeout for auto preview (debounced)
        this.autoPreviewTimeout = setTimeout(() => {
            this.generateWordCloud();
        }, 500); // 500ms delay to avoid too frequent updates
    }

    updateCSVStatus(message) {
        const statusElement = document.getElementById('csvStatus');
        statusElement.textContent = message;
        statusElement.style.color = '#28a745';
    }

    clearAllData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données sauvegardées ?')) {
            localStorage.removeItem('wordCloudData');
            this.names = [];
            this.nameStates = {};
            this.csvData = null;
            
            // Reset UI
            this.wordCloudContainer.innerHTML = '<div class="no-data"><h3>☁️</h3><p>Importez un fichier CSV et générez votre nuage de mots</p></div>';
            this.wordCloudContainer.classList.remove('has-content');
            this.namesPanel.style.display = 'none';
            this.stats.style.display = 'none';
            document.getElementById('exportPDF').style.display = 'none';
            document.getElementById('clearData').style.display = 'none';
            document.getElementById('csvStatus').textContent = '';
            document.getElementById('csvFile').value = '';
            
            // Reset to default settings
            this.settings = {
                minFontSize: 12,
                maxFontSize: 48,
                colorScheme: 'rainbow',
                textCase: 'uppercase',
                highlightMultiplier: 3
            };
            
            // Update UI with default values
            document.getElementById('minFontSize').value = this.settings.minFontSize;
            document.getElementById('maxFontSize').value = this.settings.maxFontSize;
            document.getElementById('colorScheme').value = this.settings.colorScheme;
            document.getElementById('textCase').value = this.settings.textCase;
            document.getElementById('highlightMultiplier').value = this.settings.highlightMultiplier;
        }
    }

    generateWordCloud() {
        if (this.names.length === 0) {
            // Don't show alert for auto preview, just return
            return;
        }

        this.setPreviewLoadingState(true);

        try {
            // Clear previous cloud
            this.wordCloudContainer.innerHTML = '';
            this.wordCloudContainer.classList.add('has-content');

            // Prepare words with their counts and states
            const words = this.prepareWords();
            console.log('Prepared words:', words);
            
            if (words.length === 0) {
                this.wordCloudContainer.innerHTML = '<div class="no-data"><h3>☁️</h3><p>Aucun prénom visible</p></div>';
                this.wordCloudContainer.classList.remove('has-content');
                return;
            }

            // Generate word cloud
            this.createWordCloud(words);
            
            // Show export button
            document.getElementById('exportPDF').style.display = 'inline-block';
            
        } catch (error) {
            console.error('Error generating word cloud:', error);
            // Don't show alert for auto preview errors
        } finally {
            this.setPreviewLoadingState(false);
        }
    }

    prepareWords() {
        const words = [];
        
        console.log('=== PREPARE WORDS DEBUG ===');
        console.log('All names:', this.names);
        console.log('Name states:', this.nameStates);
        console.log('Highlight multiplier:', this.settings.highlightMultiplier);
        
        // Get unique names and their states
        const uniqueNames = [...new Set(this.names)];
        console.log('Unique names:', uniqueNames);
        
        uniqueNames.forEach(name => {
            const state = this.nameStates[name];
            console.log(`Processing name: ${name}, state:`, state);
            
            if (state && !state.hidden) {
                const processedName = this.processText(name);
                let repetitions = state.count || 1; // Base count from CSV, fallback to 1
                
                if (state.highlighted) {
                    repetitions *= this.settings.highlightMultiplier;
                    console.log(`Name ${name} is highlighted! Multiplying by ${this.settings.highlightMultiplier}`);
                }
                
                console.log(`Name: ${name}, Processed: ${processedName}, Base count: ${state.count}, Highlighted: ${state.highlighted}, Final repetitions: ${repetitions}`);
                
                // Add the word multiple times with normal sizing (no special variations)
                for (let i = 0; i < repetitions; i++) {
                    words.push({ word: processedName, size: 1.0 });
                }
            } else {
                console.log(`Skipping name ${name} - hidden or no state`);
            }
        });

        console.log('All words to be placed:', words);
        console.log('Total words to place:', words.length);

        // Shuffle the words array to mix repeated words
        const shuffledWords = this.shuffleArray([...words]);
        console.log('Shuffled words:', shuffledWords);

        // Count occurrences and convert to array
        const wordCounts = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        // Instead of returning word counts, return individual words for placement
        console.log('Final words array:', shuffledWords);
        console.log('=== END PREPARE WORDS DEBUG ===');
        return shuffledWords; // Return the shuffled array of individual words
    }

    createWordCloud(words) {
        const container = this.wordCloudContainer;
        // Increase container size for better A4 filling
        const containerWidth = container.offsetWidth - 20; // Reduced padding
        const containerHeight = container.offsetHeight - 20; // Reduced padding
        
        console.log('Container dimensions:', containerWidth, containerHeight);
        console.log('Words to place:', words);
        
        // Count occurrences for font size calculation
        const wordCounts = {};
        words.forEach(wordObj => {
            const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(wordCounts));
        const minCount = Math.min(...Object.values(wordCounts));
        
        const colors = this.colorSchemes[this.settings.colorScheme];
        
        // Simple word cloud algorithm
        const placedWords = [];
        
        words.forEach((wordObj, index) => {
            const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
            const sizeMultiplier = typeof wordObj === 'string' ? 1.0 : wordObj.size;
            const count = wordCounts[word];
            const baseFontSize = this.calculateFontSize(count, minCount, maxCount);
            const fontSize = Math.min(baseFontSize * sizeMultiplier, this.settings.maxFontSize);
            let color = colors[index % colors.length];
            
            // Create word element
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            
            // Handle special color scheme: black with red initial
            if (this.settings.colorScheme === 'black-red-initial') {
                const firstLetter = word.charAt(0);
                const restOfWord = word.slice(1);
                wordElement.innerHTML = `<span style="color: #e74c3c;">${firstLetter}</span><span style="color: #000000;">${restOfWord}</span>`;
            } else {
                wordElement.textContent = word;
                wordElement.style.color = color;
            }
            
            wordElement.style.fontSize = `${fontSize}px`;
            wordElement.style.position = 'absolute';
            wordElement.style.visibility = 'hidden';
            
            // No special styling for highlighted words - they are just repeated
            
            // Add to container first to measure
            container.appendChild(wordElement);
            
            // Position the word
            const position = this.findBestPosition(wordElement, placedWords, containerWidth, containerHeight);
            wordElement.style.left = `${position.x}px`;
            wordElement.style.top = `${position.y}px`;
            wordElement.style.visibility = 'visible';
            
            placedWords.push({
                element: wordElement,
                x: position.x,
                y: position.y,
                width: wordElement.offsetWidth,
                height: wordElement.offsetHeight
            });
        });
    }

    calculateFontSize(count, minCount, maxCount) {
        if (maxCount === minCount) return this.settings.maxFontSize;
        
        const ratio = (count - minCount) / (maxCount - minCount);
        return Math.round(this.settings.minFontSize + 
            (this.settings.maxFontSize - this.settings.minFontSize) * ratio);
    }

    findBestPosition(element, placedWords, containerWidth, containerHeight) {
        const maxAttempts = 150; // More attempts for better coverage
        let bestPosition = { x: 0, y: 0 };
        let bestScore = -1;
        
        // Get element dimensions
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        
        // Increase spacing between words
        const spacing = 25; // Minimum spacing between words
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = Math.random() * Math.max(0, containerWidth - width);
            const y = Math.random() * Math.max(0, containerHeight - height);
            
            // Check for collisions with increased spacing
            let hasCollision = false;
            for (const placed of placedWords) {
                if (this.checkCollision(x, y, width, height, placed, spacing)) {
                    hasCollision = true;
                    break;
                }
            }
            
            if (!hasCollision) {
                // Calculate score based on coverage and distribution
                const centerX = containerWidth / 2;
                const centerY = containerHeight / 2;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x + width/2 - centerX, 2) + 
                    Math.pow(y + height/2 - centerY, 2)
                );
                
                // Prefer positions that fill the page better
                const coverageScore = this.calculateCoverageScore(x, y, width, height, containerWidth, containerHeight);
                const centerScore = 1 / (1 + distanceFromCenter / 200);
                const score = centerScore * 0.2 + coverageScore * 0.8;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = { x, y };
                }
            }
        }
        
        // If no good position found, use center
        if (bestScore === -1) {
            bestPosition = {
                x: Math.max(0, (containerWidth - width) / 2),
                y: Math.max(0, (containerHeight - height) / 2)
            };
        }
        
        return bestPosition;
    }

    checkCollision(x1, y1, w1, h1, placed, spacing = 0) {
        const x2 = placed.x - spacing;
        const y2 = placed.y - spacing;
        const w2 = placed.width + (spacing * 2);
        const h2 = placed.height + (spacing * 2);
        
        return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
    }

    calculateCoverageScore(x, y, width, height, containerWidth, containerHeight) {
        // Score based on how well this position fills the page
        // Prefer positions that are away from edges and other words
        const edgeDistance = Math.min(x, y, containerWidth - x - width, containerHeight - y - height);
        const centerDistance = Math.sqrt(
            Math.pow(x + width/2 - containerWidth/2, 2) + 
            Math.pow(y + height/2 - containerHeight/2, 2)
        );
        
        // Higher score for positions that are not too close to edges
        const edgeScore = Math.min(edgeDistance / 50, 1);
        // Moderate score for positions that are not too far from center
        const centerScore = 1 / (1 + centerDistance / 300);
        
        return edgeScore * 0.6 + centerScore * 0.4;
    }


    async exportToPDF() {
        if (!this.wordCloudContainer.classList.contains('has-content')) {
            alert('Veuillez d\'abord générer un nuage de mots.');
            return;
        }

        this.setExportLoadingState(true);

        try {
            // Get the words data
            const words = this.prepareWords();
            if (words.length === 0) {
                alert('Aucun mot à exporter.');
                return;
            }

            // Create PDF with vector rendering
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // PDF dimensions - optimize A4 space usage
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
            const margin = 15; // Reduced margin for better space usage
            const availableWidth = pdfWidth - (2 * margin); // 180mm
            const availableHeight = pdfHeight - (2 * margin); // 267mm
            
            // Set up font to match preview (using helvetica as closest match to Segoe UI)
            pdf.setFont('helvetica', 'bold');
            
            // Get the actual font size from preview for better matching
            const previewFontSize = this.getPreviewFontSize();
            
            // Get the actual positions and font sizes from the preview elements
            const wordElements = this.wordCloudContainer.querySelectorAll('.word-item');
            const wordData = new Map();
            
            // Map each word to its actual position and font size from the preview
            wordElements.forEach(element => {
                const word = element.textContent;
                const computedStyle = window.getComputedStyle(element);
                const fontSize = parseFloat(computedStyle.fontSize);
                const rect = element.getBoundingClientRect();
                const containerRect = this.wordCloudContainer.getBoundingClientRect();
                
                // Calculate relative position within the container
                const x = rect.left - containerRect.left;
                const y = rect.top - containerRect.top;
                
                wordData.set(word, {
                    fontSize: fontSize,
                    x: x,
                    y: y,
                    width: rect.width,
                    height: rect.height
                });
            });
            
            // Get colors
            const colors = this.colorSchemes[this.settings.colorScheme];
            
            // Convert words to positioned elements for PDF using actual preview positions
            const positionedWords = [];
            const spacing = 12; // mm minimum spacing between words
            
            words.forEach((wordObj, index) => {
                const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
                const data = wordData.get(word);
                
                if (data) {
                    // Convert pixel positions to mm for PDF
                    let x = this.convertPixelToMM(data.x);
                    let y = this.convertPixelToMM(data.y);
                    const fontSize = data.fontSize;
                    const color = colors[index % colors.length];
                    
                    // Calculate actual dimensions based on PDF font size
                    const actualWidth = this.measureTextWidth(pdf, word, fontSize);
                    const actualHeight = fontSize * 1.2; // Approximate height based on font size
                    
                    // Check for collisions and adjust position if needed
                    const adjustedPosition = this.adjustPositionForCollisions(x, y, actualWidth, actualHeight, positionedWords, spacing);
                    x = adjustedPosition.x;
                    y = adjustedPosition.y;
                    
                    positionedWords.push({
                        word: word,
                        x: x,
                        y: y,
                        fontSize: fontSize,
                        color: color,
                        width: actualWidth,
                        height: actualHeight
                    });
                }
            });
            
            // Render words to PDF
            positionedWords.forEach(({ word, x, y, fontSize, color }) => {
                // Set font size
                pdf.setFontSize(fontSize);
                
                // Set color
                if (this.settings.colorScheme === 'black-red-initial') {
                    // Handle special color scheme
                    const firstLetter = word.charAt(0);
                    const restOfWord = word.slice(1);
                    
                    // First letter in red
                    pdf.setTextColor(231, 76, 60); // #e74c3c
                    pdf.text(firstLetter, margin + x, margin + y);
                    
                    // Rest in black
                    if (restOfWord) {
                        pdf.setTextColor(0, 0, 0);
                        // Measure the actual width of the first letter
                        const firstLetterWidth = this.measureTextWidth(pdf, firstLetter, fontSize);
                        pdf.text(restOfWord, margin + x + firstLetterWidth, margin + y);
                    }
                } else {
                    // Regular color
                    const rgb = this.hexToRgb(color);
                    pdf.setTextColor(rgb.r, rgb.g, rgb.b);
                    pdf.text(word, margin + x, margin + y);
                }
            });
            
            // Save PDF
            const today = new Date().toISOString().split('T')[0];
            pdf.save(`nuage-mots-${today}.pdf`);
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF.');
        } finally {
            this.setExportLoadingState(false);
        }
    }


    setExportLoadingState(isLoading) {
        const exportBtn = document.getElementById('exportPDF');
        const exportText = document.getElementById('exportText');
        const exportSpinner = document.getElementById('exportSpinner');
        
        if (isLoading) {
            exportBtn.disabled = true;
            exportText.textContent = 'Export...';
            exportSpinner.style.display = 'inline';
        } else {
            exportBtn.disabled = false;
            exportText.textContent = 'Exporter en PDF';
            exportSpinner.style.display = 'none';
        }
    }

    getPreviewFontSize() {
        // Get the actual font size from a word element in the preview
        const wordElements = this.wordCloudContainer.querySelectorAll('.word-item');
        if (wordElements.length > 0) {
            const computedStyle = window.getComputedStyle(wordElements[0]);
            return parseFloat(computedStyle.fontSize);
        }
        return 16; // Default fallback
    }

    convertPixelToMM(pixelSize) {
        // Direct conversion from pixels to mm (96 DPI: 1 inch = 25.4mm, 96 pixels = 1 inch)
        return (pixelSize * 25.4) / 96;
    }

    measureTextWidth(pdf, text, fontSize) {
        // Use jsPDF's built-in text measurement
        // Set the font size temporarily to measure
        const currentFontSize = pdf.internal.getFontSize();
        pdf.setFontSize(fontSize);
        
        // Get the text width in the current units (mm)
        const textWidth = pdf.getTextWidth(text);
        
        // Restore the original font size
        pdf.setFontSize(currentFontSize);
        
        return textWidth;
    }

    adjustPositionForCollisions(x, y, width, height, placedWords, spacing) {
        // Check if the current position collides with any placed words using hit testing
        if (!this.checkPDFCollision(x, y, width, height, placedWords, spacing)) {
            return { x, y }; // No collision, use original position
        }
        
        // Try to find a nearby position without collision
        const maxAttempts = 150; // More attempts to guarantee no overlap
        const stepSize = 1; // mm (smaller steps for precision)
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Try positions in a spiral pattern around the original position
            const angle = (attempt * Math.PI * 2) / 8; // 8 directions
            const distance = Math.floor(attempt / 8) * stepSize;
            
            const newX = x + Math.cos(angle) * distance;
            const newY = y + Math.sin(angle) * distance;
            
            // Check if this position is valid (within bounds and no collision)
            // Use optimized A4 space with proper margins
            const edgeMargin = 15; // mm margin from edges (matches PDF margin)
            if (newX >= edgeMargin && newY >= edgeMargin && newX + width <= 195 && newY + height <= 282) {
                // Use hit testing to check against all placed words
                if (!this.checkPDFCollision(newX, newY, width, height, placedWords, spacing)) {
                    return { x: newX, y: newY };
                }
            }
        }
        
        // If no good position found, return original position
        return { x, y };
    }

    estimateTextWidth(text, fontSize) {
        // More accurate estimation of text width in mm
        // Helvetica bold has different character widths, so we use a more precise calculation
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Different characters have different widths in Helvetica
            if (char === 'I' || char === 'l' || char === 'i' || char === 't' || char === 'f' || char === 'j') {
                totalWidth += fontSize * 0.3; // Narrow characters
            } else if (char === 'W' || char === 'M' || char === 'Q' || char === 'O' || char === 'D' || char === 'G') {
                totalWidth += fontSize * 0.9; // Wide characters
            } else {
                totalWidth += fontSize * 0.6; // Average characters
            }
        }
        return totalWidth;
    }

    findPDFPosition(word, fontSize, placedWords, containerWidth, containerHeight, spacing) {
        const wordWidth = this.estimateTextWidth(word, fontSize);
        const wordHeight = fontSize;
        
        // Try multiple positions
        const maxAttempts = 100;
        let bestPosition = { x: 0, y: 0 };
        let bestScore = -1;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = Math.random() * Math.max(0, containerWidth - wordWidth);
            const y = Math.random() * Math.max(0, containerHeight - wordHeight);
            
            // Check for collisions
            let hasCollision = false;
            for (const placed of placedWords) {
                if (this.checkPDFCollision(x, y, wordWidth, wordHeight, placed, spacing)) {
                    hasCollision = true;
                    break;
                }
            }
            
            if (!hasCollision) {
                // Calculate score based on distance from center
                const centerX = containerWidth / 2;
                const centerY = containerHeight / 2;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x + wordWidth/2 - centerX, 2) + 
                    Math.pow(y + wordHeight/2 - centerY, 2)
                );
                const score = 1 / (1 + distanceFromCenter / 50);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = { x, y };
                }
            }
        }
        
        // If no good position found, use center
        if (bestScore === -1) {
            bestPosition = {
                x: Math.max(0, (containerWidth - wordWidth) / 2),
                y: Math.max(0, (containerHeight - wordHeight) / 2)
            };
        }
        
        return bestPosition;
    }

    checkPDFCollision(x1, y1, w1, h1, placedWords, spacing = 0) {
        // Hit testing: check against ALL placed words
        for (const placed of placedWords) {
            const x2 = placed.x - spacing;
            const y2 = placed.y - spacing;
            const w2 = placed.width + (spacing * 2);
            const h2 = placed.height + (spacing * 2);
            
            // Check if rectangles overlap with strict boundaries
            const overlaps = !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
            
            if (overlaps) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    hexToRgb(hex) {
        // Convert hex color to RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    setPreviewLoadingState(isLoading) {
        const statusText = document.getElementById('previewStatusText');
        const previewSpinner = document.getElementById('previewSpinner');
        
        if (isLoading) {
            statusText.textContent = 'Mise à jour de l\'aperçu...';
            previewSpinner.style.display = 'inline';
        } else {
            statusText.textContent = 'Aperçu automatique activé';
            previewSpinner.style.display = 'none';
        }
    }
}

// Initialize the application
const wordCloud = new WordCloudGenerator();
