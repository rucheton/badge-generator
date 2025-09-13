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
        document.getElementById('printDirect').addEventListener('click', () => this.printDirect());
        document.getElementById('addManualNames').addEventListener('click', () => this.addManualNames());
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
            document.getElementById('printDirect').style.display = 'none';
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
            
            // Show print button
            document.getElementById('printDirect').style.display = 'inline-block';
            
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


    // Méthode exportToPDF supprimée


    // setExportLoadingState supprimée

    // getPreviewFontSize supprimée

    // convertPixelToMM supprimée

    // measureTextWidth supprimée

    // adjustPositionForCollisions supprimée

    // estimateTextWidth supprimée

    // findPDFPosition supprimée

    // checkPDFCollision et hexToRgb supprimées

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

    // Imprimer directement le nuage de mots
    printDirect() {
        // Vérifier qu'il y a du contenu à imprimer
        if (!this.wordCloudContainer.classList.contains('has-content')) {
            alert('Aucun nuage de mots à imprimer. Veuillez d\'abord importer des données.');
            return;
        }

        // Désactiver temporairement les interactions pendant l'impression
        const wordItems = this.wordCloudContainer.querySelectorAll('.word-item');
        wordItems.forEach(item => {
            item.style.pointerEvents = 'none';
        });

        // Lancer l'impression
        window.print();

        // Réactiver les interactions après l'impression
        setTimeout(() => {
            wordItems.forEach(item => {
                item.style.pointerEvents = 'auto';
            });
        }, 1000);
    }

    // Ajouter des prénoms manuellement
    addManualNames() {
        const manualNamesInput = document.getElementById('manualNames');
        const namesText = manualNamesInput.value.trim();
        
        if (!namesText) {
            alert('Veuillez entrer au moins un prénom.');
            return;
        }

        // Parser les prénoms (séparés par virgules, points-virgules, ou retours à la ligne)
        const names = namesText
            .split(/[,;\n\r]+/)
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (names.length === 0) {
            alert('Aucun prénom valide trouvé.');
            return;
        }

        // Ajouter les nouveaux prénoms à la liste existante
        names.forEach(name => {
            if (!this.names.includes(name)) {
                this.names.push(name);
                this.nameStates[name] = {
                    hidden: false,
                    highlighted: false,
                    count: 1
                };
            } else {
                // Incrémenter le compteur si le prénom existe déjà
                this.nameStates[name].count++;
            }
        });

        // Vider le champ de saisie
        manualNamesInput.value = '';

        // Sauvegarder les données
        this.saveData();

        // Mettre à jour l'affichage
        this.updateNamesList();
        this.generateWordCloud();

        // Afficher un message de confirmation
        alert(`${names.length} prénom(s) ajouté(s) avec succès !`);
    }
}

// Initialize the application
const wordCloud = new WordCloudGenerator();
