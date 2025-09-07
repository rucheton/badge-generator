class BadgeGenerator {
    constructor() {
        this.badges = [];
        this.settings = {
            width: 7,
            height: 6,
            borderColor: '#4CAF50',
            borderRadius: 32,
            borderWidth: 10,
            fontSize: 40,
            firstLetterColor: '#667eea',
            firstLetterSizeRatio: 1,
            printQuality: 4, // Qualité d'impression par défaut (300 DPI)
            picturePosition: 'top',
            pictureDiameter: 120,
            showImages: true
        };
        
        this.currentLanguage = 'fr';
        this.translations = {
            fr: {
                title: '🎖️ Générateur de Badges',
                subtitle: 'Créez des badges imprimables pour vos classes. La sauvegarde des données est 100% locale, vos photos ne sont envoyées nulle part !',
                settings: 'Paramètres',
                badgeWidth: 'Largeur du Badge (cm):',
                badgeHeight: 'Hauteur du Badge (cm):',
                borderColor: 'Couleur de la Bordure:',
                borderRadius: 'Rayon de la Bordure (px):',
                borderWidth: 'Épaisseur de la Bordure (px):',
                fontSize: 'Taille de la Police (px):',
                firstLetterColor: 'Couleur de la Première Lettre:',
                firstLetterSizeRatio: 'Ratio de Taille de la Première Lettre:',
                picturePosition: 'Position de l\'Image:',
                picturePositionTop: 'Haut (au-dessus du nom)',
                picturePositionLeft: 'Gauche (à côté du nom)',
                pictureDiameter: 'Diamètre de l\'Image (px):',
                showImages: 'Afficher les Images:',
                showImagesHide: 'Masquer',
                showImagesShow: 'Afficher',
                badgeData: 'Données des Badges',
                clearAll: 'Tout Effacer',
                importCSV: 'Importer CSV',
                firstName: 'Prénom',
                picture: 'Image',
                showPicture: 'Afficher l\'Image',
                gender: 'Genre',
                actions: 'Actions',
                remove: 'Supprimer',
                enterFirstName: 'Entrez le prénom',
                genderless: 'Sans Genre',
                boy: 'Garçon',
                girl: 'Fille',
                generatePDF: 'Générer PDF',
                preview: 'Aperçu',
                noBadges: 'Aucun badge à prévisualiser. Ajoutez des noms ci-dessus !',
                badge: 'badge',
                badges: 'badges',
                page: 'page',
                pages: 'pages'
            },
            en: {
                title: '🎖️ Badge Generator',
                subtitle: 'Create printables badges for your classes. Data saving is 100% local, your photos are not sent anywhere!',
                settings: 'Settings',
                badgeWidth: 'Badge Width (cm):',
                badgeHeight: 'Badge Height (cm):',
                borderColor: 'Border Color:',
                borderRadius: 'Border Radius (px):',
                borderWidth: 'Border Width (px):',
                fontSize: 'Font Size (px):',
                firstLetterColor: 'First Letter Color:',
                firstLetterSizeRatio: 'First Letter Size Ratio:',
                picturePosition: 'Picture Position:',
                picturePositionTop: 'Top (above name)',
                picturePositionLeft: 'Left (beside name)',
                pictureDiameter: 'Picture Diameter (px):',
                showImages: 'Show Images:',
                showImagesHide: 'Hide',
                showImagesShow: 'Show',
                badgeData: 'Badge Data',
                clearAll: 'Clear All',
                importCSV: 'Import CSV',
                firstName: 'First Name',
                picture: 'Picture',
                showPicture: 'Show Picture',
                gender: 'Gender',
                actions: 'Actions',
                remove: 'Remove',
                enterFirstName: 'Enter first name',
                genderless: 'Genderless',
                boy: 'Boy',
                girl: 'Girl',
                generatePDF: 'Generate PDF',
                preview: 'Preview',
                noBadges: 'No badges to preview. Add some names above!',
                badge: 'badge',
                badges: 'badges',
                page: 'page',
                pages: 'pages'
            }
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updatePreview();
        this.updateCounts();
        this.updateLanguage();
        
        // Set initial language class
        document.body.classList.add(`lang-${this.currentLanguage}`);
    }

    bindEvents() {
        // Language switching
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });

        // Settings changes
        document.getElementById('badgeWidth').addEventListener('change', (e) => {
            this.settings.width = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('badgeHeight').addEventListener('change', (e) => {
            this.settings.height = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        // Qualité d'impression
        document.getElementById('qualitySelect').addEventListener('change', (e) => {
            this.settings.printQuality = parseInt(e.target.value);
            this.saveData();
        });

        document.getElementById('borderColor').addEventListener('change', (e) => {
            this.settings.borderColor = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('borderRadius').addEventListener('change', (e) => {
            this.settings.borderRadius = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('borderWidth').addEventListener('change', (e) => {
            this.settings.borderWidth = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('firstLetterColor').addEventListener('change', (e) => {
            this.settings.firstLetterColor = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('firstLetterSizeRatio').addEventListener('change', (e) => {
            this.settings.firstLetterSizeRatio = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('picturePosition').addEventListener('change', (e) => {
            this.settings.picturePosition = e.target.checked ? 'left' : 'top';
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('pictureDiameter').addEventListener('change', (e) => {
            this.settings.pictureDiameter = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('showImages').addEventListener('change', (e) => {
            this.settings.showImages = e.target.checked;
            this.saveData();
            this.updatePreview();
        });

        // Button events
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('importCSV').addEventListener('click', () => this.importCSV());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDF());

        // Drop zone events
        this.setupDropZone();

        // Initial row events
        this.bindRowEvents(document.querySelector('#badgeTableBody tr'));
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update body class for CSS translations
        document.body.classList.remove('lang-fr', 'lang-en');
        document.body.classList.add(`lang-${lang}`);
        
        this.updateLanguage();
        this.saveData();
    }

    updateLanguage() {
        const t = this.translations[this.currentLanguage];
        
        // Update header
        document.querySelector('header h1').textContent = t.title;
        document.querySelector('header p').textContent = t.subtitle;
        
        // Update settings panel
        document.querySelector('.settings-panel h2').textContent = t.settings;
        document.querySelector('label[for="badgeWidth"]').textContent = t.badgeWidth;
        document.querySelector('label[for="badgeHeight"]').textContent = t.badgeHeight;
        document.querySelector('label[for="borderColor"]').textContent = t.borderColor;
        document.querySelector('label[for="borderRadius"]').textContent = t.borderRadius;
        document.querySelector('label[for="borderWidth"]').textContent = t.borderWidth;
        document.querySelector('label[for="fontSize"]').textContent = t.fontSize;
        document.querySelector('label[for="firstLetterColor"]').textContent = t.firstLetterColor;
        document.querySelector('label[for="firstLetterSizeRatio"]').textContent = t.firstLetterSizeRatio;
        document.querySelector('label[for="picturePosition"]').textContent = t.picturePosition;
        document.querySelector('label[for="pictureDiameter"]').textContent = t.pictureDiameter;
        document.querySelector('label[for="showImages"]').textContent = t.showImages;
        
        // Update picture position toggle labels
        const picturePositionToggleLabels = document.querySelectorAll('#picturePosition').nextElementSibling?.querySelectorAll('.toggle-label');
        if (picturePositionToggleLabels && picturePositionToggleLabels.length >= 2) {
            picturePositionToggleLabels[0].textContent = t.picturePositionTop;
            picturePositionToggleLabels[1].textContent = t.picturePositionLeft;
        }

        // Update show images toggle labels
        const showImagesToggleLabels = document.querySelectorAll('#showImages').nextElementSibling?.querySelectorAll('.toggle-label');
        if (showImagesToggleLabels && showImagesToggleLabels.length >= 2) {
            showImagesToggleLabels[0].textContent = t.showImagesHide;
            showImagesToggleLabels[1].textContent = t.showImagesShow;
        }
        
        // Update input panel
        document.querySelector('.input-panel h2').textContent = t.badgeData;
        document.getElementById('clearAll').textContent = t.clearAll;
        document.getElementById('importCSV').textContent = t.importCSV;
        
        // Update table headers
        const tableHeaders = document.querySelectorAll('#badgeTable th');
        tableHeaders[0].textContent = t.firstName;
        tableHeaders[1].textContent = t.picture;
        tableHeaders[2].textContent = t.gender;
        tableHeaders[3].textContent = t.actions;
        
        // Update table content
        const nameInputs = document.querySelectorAll('.name-input');
        nameInputs.forEach(input => {
            if (input.placeholder) {
                input.placeholder = t.enterFirstName;
            }
        });
        
        // Update gender options
        const genderSelects = document.querySelectorAll('.gender-select');
        genderSelects.forEach(select => {
            select.options[0].text = t.genderless;
            select.options[1].text = t.boy;
            select.options[2].text = t.girl;
        });
        
        // Update remove buttons
        const removeButtons = document.querySelectorAll('.remove-row');
        removeButtons.forEach(btn => {
            btn.textContent = "❌";
        });
        
        // Update generate button
        document.getElementById('generatePDF').textContent = t.generatePDF;
        
        // Update preview panel
        document.querySelector('.preview-panel h2').textContent = t.preview;
        
        // Update preview content
        this.updatePreview();
    }

    bindRowEvents(row) {
        const nameInput = row.querySelector('.name-input');
        const pictureInput = row.querySelector('.picture-input');
        const showPictureCheckbox = row.querySelector('.show-picture-checkbox');
        const genderSelect = row.querySelector('.gender-select');
        const removeButton = row.querySelector('.remove-row');

        // Name input events
        nameInput.addEventListener('input', () => {
            this.updatePreview();
            this.updateCounts();
            this.saveData();
            
            // Debounce the new row check to avoid creating rows on every character
            clearTimeout(this.nameInputTimeout);
            this.nameInputTimeout = setTimeout(() => {
                this.checkAndAddNewRow(row);
                this.removeEmptyRows(); // Ensure only one empty row
            }, 500); // Wait 500ms after user stops typing
        });

        // Picture input events
        pictureInput.addEventListener('change', (e) => {
            this.handlePictureUpload(e, row);
            this.updatePreview();
            this.saveData();
            
            // Only check for new row if name is also filled
            const nameInput = row.querySelector('.name-input');
            if (nameInput.value.trim().length >= 2) {
                this.checkAndAddNewRow(row);
                this.removeEmptyRows(); // Ensure only one empty row
            }
        });

        // Show picture checkbox events
        showPictureCheckbox.addEventListener('change', () => {
            const t = this.translations[this.currentLanguage];
            
            // Update image preview visibility to show saved state
            const previewDiv = row.querySelector('.image-preview');
            if (previewDiv) {
                    if (row.dataset.picture) {
                        previewDiv.innerHTML = `<img src="${row.dataset.picture}" alt="Aperçu">`;
                        previewDiv.classList.add('has-image');
                    } else {
                        // Show empty preview if no image
                        previewDiv.innerHTML = '';
                        previewDiv.classList.remove('has-image');
                    }
            }
            
            // Don't erase the file, just update the preview
            this.updatePreview();
            this.saveData();
        });

        // Gender select events
        genderSelect.addEventListener('change', () => {
            this.updatePreview();
            this.saveData();
        });

        // Remove button events
        removeButton.addEventListener('click', () => {
            row.remove();
            this.updatePreview();
            this.updateCounts();
            this.saveData();
        });
    }

    checkAndAddNewRow(currentRow) {
        const nameInput = currentRow.querySelector('.name-input');
        const pictureInput = currentRow.querySelector('.picture-input');
        
        // Check if current row has meaningful content
        const hasName = nameInput.value.trim().length >= 2; // At least 2 characters
        const hasPicture = pictureInput.files.length > 0;
        
        // Only add new row if row is substantially filled
        if ((hasName && hasPicture) || (hasName && nameInput.value.trim().length >= 3)) {
            const nextRow = currentRow.nextElementSibling;
            
            // If there's no next row, add a new one
            if (!nextRow) {
                this.addEmptyRowAfter(currentRow);
            }
        }
    }

    isRowEmpty(row) {
        const nameInput = row.querySelector('.name-input');
        const pictureInput = row.querySelector('.picture-input');
        
        return nameInput.value.trim() === '' && pictureInput.files.length === 0;
    }

    addEmptyRowAfter(currentRow) {
        const t = this.translations[this.currentLanguage];
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="name-input" placeholder="${t.enterFirstName}"></td>
            <td>
                <div class="image-input-container">
                    <input type="checkbox" class="show-picture-checkbox" checked>
                    <input type="file" class="picture-input" accept="image/*">
                    <div class="image-preview"></div>
                </div>
            </td>
            <td><select class="gender-select"><option value="genderless">${t.genderless}</option><option value="boy">${t.boy}</option><option value="girl">${t.girl}</option></select></td>
            <td><button class="btn btn-danger remove-row" title="${t.remove}">❌</button></td>
        `;
        
        currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
        this.bindRowEvents(newRow);
        this.updateCounts();
        this.saveData();
    }

    removeEmptyRows() {
        const tbody = document.getElementById('badgeTableBody');
        const rows = Array.from(tbody.children);
        
        // Track which row should keep focus
        let focusRow = null;
        let focusInput = null;
        
        // Find the currently focused input
        if (document.activeElement && document.activeElement.classList.contains('name-input')) {
            focusInput = document.activeElement;
            focusRow = focusInput.closest('tr');
        }
        
        // Keep only the last empty row, remove others
        let emptyRowFound = false;
        
        for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            if (this.isRowEmpty(row)) {
                // Don't remove the row if it's currently focused
                if (row === focusRow) {
                    emptyRowFound = true;
                    continue;
                }
                
                if (emptyRowFound) {
                    // Remove extra empty rows
                    row.remove();
                } else {
                    emptyRowFound = true;
                }
            }
        }
        
        // If no empty row found, add one
        if (!emptyRowFound) {
            const lastRow = tbody.lastElementChild;
            if (lastRow) {
                this.addEmptyRowAfter(lastRow);
            }
        }
        
        // Restore focus if we had it
        if (focusInput && focusRow && focusRow.parentNode) {
            // Find the equivalent input in the current row structure
            const currentFocusRow = Array.from(tbody.children).find(row => 
                row.querySelector('.name-input').value === focusInput.value ||
                row === focusRow
            );
            
            if (currentFocusRow) {
                const newFocusInput = currentFocusRow.querySelector('.name-input');
                if (newFocusInput) {
                    newFocusInput.focus();
                    // Restore cursor position if possible
                    if (focusInput.value) {
                        newFocusInput.setSelectionRange(focusInput.selectionStart, focusInput.selectionEnd);
                    }
                }
            }
        }
    }

    handlePictureUpload(event, row) {
        const file = event.target.files[0];
        if (file) {
            console.log('Processing image file:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                console.log('Image loaded, size:', imageData.length, 'characters');
                
                // Make image square before saving
                this.makeImageSquare(imageData, (squareImageData) => {
                    console.log('Image processed to square, size:', squareImageData.length, 'characters');
                    
                    // Save the square image data
                    row.dataset.picture = squareImageData;
                    console.log('Image saved to row dataset');
                    
                    // Show image preview
                    const previewDiv = row.querySelector('.image-preview');
                    if (previewDiv) {
                        previewDiv.innerHTML = `<img src="${squareImageData}" alt="Aperçu">`;
                        previewDiv.classList.add('has-image');
                        console.log('Image preview updated');
                    }
                    
                    this.updatePreview();
                    this.saveData(); // Save data to maintain persistence
                });
            };
            reader.readAsDataURL(file);
        }
    }


    makeImageSquare(imageData, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Determine the size for the square (use the smaller dimension)
            const size = Math.min(img.width, img.height);
            
            // Set canvas size to the square dimensions
            canvas.width = size;
            canvas.height = size;
            
            // Calculate the starting position to center the crop
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;
            
            // Draw the cropped square image
            ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
            
            // Convert back to data URL
            const squareImageData = canvas.toDataURL('image/jpeg', 0.9);
            callback(squareImageData);
        };
        img.src = imageData;
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);

        // Handle click to select files
        dropZone.addEventListener('click', () => this.selectFiles());
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.processFiles(files);
    }

    selectFiles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.csv,image/*';
        input.onchange = (e) => {
            this.processFiles(e.target.files);
        };
        input.click();
    }

    processFiles(files) {
        const fileArray = Array.from(files);
        const csvFiles = fileArray.filter(file => file.name.toLowerCase().endsWith('.csv'));
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
        
        if (csvFiles.length > 0) {
            // Process CSV files
            csvFiles.forEach(file => {
                this.processCSVFile(file);
            });
        } else if (imageFiles.length > 0) {
            // Process image files
            imageFiles.forEach(file => {
                this.createRowFromImage(file);
            });
        } else {
            alert('Veuillez sélectionner des fichiers CSV ou des images valides.');
            return;
        }

        this.updatePreview();
        this.updateCounts();
        this.saveData();
    }

    processCSVFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            this.parseCSV(csvContent);
        };
        reader.readAsText(file);
    }

    // Utility function to extract first name from filename
    // Handles formats like: "jean_dupont.jpg" -> "jean", "marie-claire_martin.png" -> "marie-claire", "pierre.jpg" -> "pierre"
    extractFirstNameFromFilename(fileName) {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
        
        // Extract first name based on separator logic
        if (nameWithoutExt.includes('_')) {
            // Format: prenom_nomdefamille or prenom-compose_nomdefamille
            // Underscore is the separator between first name and family name
            const parts = nameWithoutExt.split('_');
            return parts[0].trim(); // Take everything before the first underscore (preserving hyphens in composed names)
        } else {
            // No underscore separator, use the whole name (could be a single name or composed first name)
            return nameWithoutExt.trim(); // Keep the name as is, including hyphens
        }
    }

    createRowFromImage(file) {
        // Extract first name from filename using utility function
        const firstName = this.extractFirstNameFromFilename(file.name);

        const t = this.translations[this.currentLanguage];
        const tbody = document.getElementById('badgeTableBody');
        
        // Create new row
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="name-input" value="${firstName}"></td>
            <td>
                <div class="image-input-container">
                    <input type="checkbox" class="show-picture-checkbox" checked>
                    <input type="file" class="picture-input" accept="image/*">
                    <div class="image-preview"></div>
                </div>
            </td>
            <td><select class="gender-select"><option value="genderless">${t.genderless}</option><option value="boy">${t.boy}</option><option value="girl">${t.girl}</option></select></td>
            <td><button class="btn btn-danger remove-row" title="${t.remove}">❌</button></td>
        `;
        
        tbody.appendChild(newRow);
        this.bindRowEvents(newRow);

        // Process the image file
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Make image square and save it
            this.makeImageSquare(imageData, (squareImageData) => {
                // Store the image data in the row
                newRow.dataset.picture = squareImageData;
                
                // Show image preview
                const previewDiv = newRow.querySelector('.image-preview');
                if (previewDiv) {
                    previewDiv.innerHTML = `<img src="${squareImageData}" alt="Photo de ${firstName}">`;
                    previewDiv.classList.add('has-image');
                }
                
                this.updatePreview();
                this.saveData();
            });
        };
        reader.readAsDataURL(file);
    }

    clearAll() {
        const t = this.translations[this.currentLanguage];
        const tbody = document.getElementById('badgeTableBody');
        tbody.innerHTML = `
            <tr>
                <td><input type="text" class="name-input" placeholder="${t.enterFirstName}"></td>
                <td>
                    <div class="image-input-container">
                        <input type="checkbox" class="show-picture-checkbox" checked>
                        <input type="file" class="picture-input" accept="image/*">
                        <div class="image-preview"></div>
                    </div>
                </td>
                <td><select class="gender-select"><option value="genderless">${t.genderless}</option><option value="boy">${t.boy}</option><option value="girl">${t.girl}</option></select></td>
                <td><button class="btn btn-danger remove-row" title="${t.remove}">❌</button></td>
            </tr>
        `;
        this.bindRowEvents(tbody.querySelector('tr'));
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
        const tbody = document.getElementById('badgeTableBody');
        tbody.innerHTML = '';

        lines.forEach((line, index) => {
            if (line.trim() && index > 0) { // Skip header
                const [firstName] = line.split(',').map(s => s.trim());
                if (firstName) {
                    const t = this.translations[this.currentLanguage];
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td><input type="text" class="name-input" value="${firstName}"></td>
                        <td>
                            <div class="image-input-container">
                                <input type="checkbox" class="show-picture-checkbox" checked>
                                <input type="file" class="picture-input" accept="image/*">
                                <div class="image-preview"></div>
                            </div>
                        </td>
                        <td><select class="gender-select"><option value="genderless">${t.genderless}</option><option value="boy">${t.boy}</option><option value="girl">${t.girl}</option></select></td>
                        <td><button class="btn btn-danger remove-row" title="${t.remove}">❌</button></td>
                    `;
                    tbody.appendChild(newRow);
                    this.bindRowEvents(newRow);
                }
            }
        });

        this.updatePreview();
        this.updateCounts();
        this.saveData();
    }

    getBadgeData() {
        const rows = document.querySelectorAll('#badgeTableBody tr');
        const badges = [];
        
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.name-input');
            const showPictureCheckbox = row.querySelector('.show-picture-checkbox');
            const genderSelect = row.querySelector('.gender-select');
            
            const name = nameInput.value.trim();
            const showPicture = showPictureCheckbox.checked && this.settings.showImages; // Apply global setting
            const gender = genderSelect.value;
            
            // Only include rows that have a name
            if (name) {
                let picture = null;
                // Always get picture from dataset if it exists, regardless of checkbox state
                picture = row.dataset.picture || null;
                
                console.log(`Row ${index + 1} (${name}):`, {
                    showPicture,
                    hasPictureData: !!row.dataset.picture,
                    pictureLength: picture ? picture.length : 0
                });
                
                badges.push({
                    name: name,
                    picture: picture,
                    showPicture: showPicture,
                    gender: gender
                });
            }
        });
        
        console.log('Total badges collected:', {
            count: badges.length,
            withImages: badges.filter(b => b.picture).length,
            totalImageDataSize: badges.reduce((sum, b) => sum + (b.picture ? b.picture.length : 0), 0)
        });
        
        return badges;
    }

    updatePreview() {
        this.badges = this.getBadgeData();
        const previewContainer = document.getElementById('badgePreview');
        
        if (this.badges.length === 0) {
            const t = this.translations[this.currentLanguage];
            previewContainer.innerHTML = `<p class="no-badges">${t.noBadges}</p>`;
            return;
        }
        
        const previewHTML = this.badges.map(badge => this.createBadgeHTML(badge)).join('');
        previewContainer.innerHTML = previewHTML;
        
        // Recalculate widths after images load
        this.recalculateWidthsAfterImageLoad();
        
        // Also set up image load listeners for more precise timing
        this.setupImageLoadListeners();
    }

    recalculateWidthsAfterImageLoad() {
        console.log('Starting width recalculation...');
        
        // Multiple timeouts to catch images loading at different stages
        const timeouts = [100, 300, 500, 1000, 2000]; // Multiple attempts
        
        timeouts.forEach((delay, index) => {
            setTimeout(() => {
                console.log(`Width recalculation attempt ${index + 1} (${delay}ms delay)`);
                const previewContainer = document.getElementById('badgePreview');
                const badgeElements = previewContainer.querySelectorAll('.badge');
                
                badgeElements.forEach((badgeElement, badgeIndex) => {
                    if (badgeIndex < this.badges.length) {
                        const badge = this.badges[badgeIndex];
                        console.log(`Recalculating width for badge: ${badge.name} (attempt ${index + 1})`);
                        this.recalculateBadgeWidth(badgeElement, badge);
                    }
                });
            }, delay);
        });
    }

    setupImageLoadListeners() {
        const previewContainer = document.getElementById('badgePreview');
        const images = previewContainer.querySelectorAll('img');
        
        console.log('Setting up image load listeners for', images.length, 'images');
        
        images.forEach((img, index) => {
            if (img.complete) {
                console.log(`Image ${index + 1} already loaded`);
                // Image is already loaded, trigger recalculation
                setTimeout(() => {
                    this.triggerWidthRecalculation();
                }, 50);
            } else {
                console.log(`Setting up load listener for image ${index + 1}`);
                img.addEventListener('load', () => {
                    console.log(`Image ${index + 1} finished loading, triggering recalculation`);
                    this.triggerWidthRecalculation();
                });
                
                img.addEventListener('error', () => {
                    console.log(`Image ${index + 1} failed to load, triggering recalculation anyway`);
                    this.triggerWidthRecalculation();
                });
            }
        });
    }

    triggerWidthRecalculation() {
        console.log('Triggering width recalculation due to image load');
        const previewContainer = document.getElementById('badgePreview');
        const badgeElements = previewContainer.querySelectorAll('.badge');
        
        badgeElements.forEach((badgeElement, index) => {
            if (index < this.badges.length) {
                const badge = this.badges[index];
                this.recalculateBadgeWidth(badgeElement, badge);
            }
        });
    }

    // Manual trigger for testing - call this from browser console
    manualRecalculateWidths() {
        console.log('Manual width recalculation triggered');
        this.recalculateWidthsAfterImageLoad();
    }

    // Debug function to show current badge widths
    debugBadgeWidths() {
        const previewContainer = document.getElementById('badgePreview');
        const badgeElements = previewContainer.querySelectorAll('.badge');
        
        console.log('=== BADGE WIDTH DEBUG ===');
        badgeElements.forEach((badgeElement, index) => {
            if (index < this.badges.length) {
                const badge = this.badges[index];
                const computedStyle = window.getComputedStyle(badgeElement);
                const requiredWidth = this.calculateRequiredWidth(
                    badge.name, 
                    this.settings.fontSize, 
                    this.settings.picturePosition, 
                    this.settings.pictureDiameter, 
                    badge.showPicture, 
                    !!badge.picture, 
                    this.settings.height
                );
                
                console.log(`Badge ${index + 1} (${badge.name}):`, {
                    inlineWidth: badgeElement.style.width,
                    computedWidth: computedStyle.width,
                    requiredWidth: `${requiredWidth}cm`,
                    picturePosition: this.settings.picturePosition,
                    hasPicture: !!badge.picture,
                    showPicture: badge.showPicture,
                    pictureDiameter: this.settings.pictureDiameter,
                    badgeHeight: this.settings.height,
                    borderWidth: this.settings.borderWidth,
                    fontSize: this.settings.fontSize
                });
            }
        });
        console.log('=== END DEBUG ===');
    }

    recalculateBadgeWidth(badgeElement, badge) {
        const { name, showPicture, picture } = badge;
        
        console.log('Before recalculation - badge element width:', badgeElement.style.width);
        
        // Recalculate required width
        const requiredWidth = this.calculateRequiredWidth(
            name, 
            this.settings.fontSize, 
            this.settings.picturePosition, 
            this.settings.pictureDiameter, 
            showPicture, 
            !!picture, 
            this.settings.height
        );
        
        // Update badge width with !important to override CSS
        const minHorizontalWidth = 3; // 3cm minimum width for horizontal badges
        const badgeWidth = this.settings.picturePosition === 'left' ? Math.max(requiredWidth, minHorizontalWidth) : Math.max(this.settings.width, requiredWidth);
        badgeElement.style.setProperty('width', `${badgeWidth}cm`, 'important');
        
        console.log('After recalculation - badge element width:', badgeElement.style.width);
        console.log('Recalculated width for badge:', {
            name,
            requiredWidth,
            badgeWidth,
            picturePosition: this.settings.picturePosition,
            showPicture,
            hasPicture: !!picture,
            pictureDiameter: this.settings.pictureDiameter
        });
    }

    createBadgeHTML(badge) {
        const { name, picture, showPicture, gender } = badge;
        const formattedName = this.formatName(name);
        
        // Apply global showImages setting - if global setting is false, don't show any images
        const effectiveShowPicture = this.settings.showImages && showPicture;
        
        // Calculate required width based on name length, font size, and image presence
        const requiredWidth = this.calculateRequiredWidth(name, this.settings.fontSize, this.settings.picturePosition, this.settings.pictureDiameter, effectiveShowPicture, !!picture, this.settings.height);
        
        // For horizontal badges, ignore width setting and use calculated width with minimum
        const minHorizontalWidth = 3; // 3cm minimum width for horizontal badges
        const badgeWidth = this.settings.picturePosition === 'left' ? Math.max(requiredWidth, minHorizontalWidth) : Math.max(this.settings.width, requiredWidth);
        
        let imageHTML = '';
        if (effectiveShowPicture && picture) {
            // Show the actual image when checkbox is checked and image exists
            if (this.settings.picturePosition === 'left') {
                // For horizontal badges, don't apply inline styles - let CSS handle it
                imageHTML = `<img src="${picture}" alt="Photo de ${name}" class="badge-image">`;
            } else {
                // For vertical badges, use the original inline styling
                imageHTML = `<img src="${picture}" alt="Photo de ${name}" class="badge-image" style="width: ${this.settings.pictureDiameter}px; height: ${this.settings.pictureDiameter}px; object-fit: cover; border-radius: 50%; border: 2px solid ${this.settings.borderColor};">`;
            }
        } else if (effectiveShowPicture && !picture) {
            // Show emoji avatar when checkbox is checked but no image exists
            let avatarEmoji;
            
            if (gender === 'boy') {
                avatarEmoji = '👦';
            } else if (gender === 'girl') {
                avatarEmoji = '👧';
            } else {
                // genderless
                avatarEmoji = '🧒';
            }
            
            if (this.settings.picturePosition === 'left') {
                // For horizontal badges, don't apply inline styles - let CSS handle it
                imageHTML = `<div class="default-avatar">${avatarEmoji}</div>`;
            } else {
                // For vertical badges, use the original inline styling
                imageHTML = `<div class="default-avatar" style="background-color: ${this.settings.borderColor}; border-color: ${this.settings.borderColor}; width: ${this.settings.pictureDiameter}px; height: ${this.settings.pictureDiameter}px; font-size: ${this.settings.pictureDiameter * 0.5}px;">${avatarEmoji}</div>`;
            }
        } else {
            // No image display when checkbox is unchecked (but image data is preserved)
            imageHTML = '';
        }
        
        const badgeStyle = `
            width: ${badgeWidth}cm !important;
            height: ${this.settings.height}cm;
            min-height: ${this.settings.height}cm;
            border: ${this.settings.borderWidth}px solid ${this.settings.borderColor};
            border-radius: ${this.settings.borderRadius}px;
            font-size: ${this.settings.fontSize}px;
            padding: ${this.settings.picturePosition === 'left' ? '0' : '15px'};
        `;
        
        if (this.settings.picturePosition === 'left') {
            // For horizontal badges, check if we need to center the name when no image
            const shouldCenterName = !effectiveShowPicture || !picture;
            const badgeClass = shouldCenterName ? 'badge badge-horizontal badge-centered' : 'badge badge-horizontal';
            const contentStyle = shouldCenterName ? 'justify-content: center; text-align: center;' : '';
            
            // Calculate image container width for content spacing
            const imageContainerWidth = this.settings.height * 37.7952755906; // Convert cm to pixels
            
            return `
                <div class="${badgeClass}" style="${badgeStyle}">
                    ${shouldCenterName ? '' : `<div class="badge-image-container" style="border-top-left-radius: ${this.settings.borderRadius / 2}px; border-bottom-left-radius: ${this.settings.borderRadius / 2}px;">${imageHTML}</div>`}
                    <div class="badge-content-horizontal" style="${contentStyle}; margin-left: ${shouldCenterName ? '0' : imageContainerWidth + 'px'}; padding: 5px;">
                        <div class="badge-name">${formattedName}</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="badge" style="${badgeStyle}">
                    <div class="badge-image-container">
                        ${imageHTML}
                    </div>
                    <div class="badge-name">${formattedName}</div>
                </div>
            `;
        }
    }

    calculateRequiredWidth(name, fontSize, picturePosition, pictureDiameter, showPicture = false, hasPicture = false, badgeHeight = 6) {
        let nameWidthCm;
        
        try {
            // Create a temporary canvas to measure actual text width
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = `700 ${fontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
            // Note: letterSpacing might not be supported in all browsers
            try {
                context.letterSpacing = '1px'; // Match CSS letter-spacing
            } catch (e) {
                console.warn('letterSpacing not supported, using fallback calculation');
            }
            const textMetrics = context.measureText(name.toUpperCase());
            const actualTextWidth = textMetrics.width;
            
            // Convert pixels to cm (96 DPI)
            nameWidthCm = actualTextWidth / 37.7952755906;
            
            console.log('Canvas text measurement:', {
                name: name.toUpperCase(),
                fontSize,
                actualTextWidthPx: actualTextWidth,
                nameWidthCm,
                font: context.font
            });
        } catch (error) {
            console.warn('Canvas measurement failed, using fallback:', error);
            // Fallback to character-based estimation with letter spacing
            const charWidth = fontSize * 0.7;
            const nameLength = name.length;
            const letterSpacing = 1; // 1px letter spacing from CSS
            const estimatedNameWidth = (nameLength * charWidth) + ((nameLength - 1) * letterSpacing);
            nameWidthCm = estimatedNameWidth / 37.7952755906;
        }
        
        // Calculate all spacing components
        
        // 1. Border width (left + right borders)
        const borderWidthCm = (this.settings.borderWidth * 2) / 37.7952755906; // Convert pixels to cm
        
        // 2. Badge padding (left + right padding)
        let badgePaddingCm = 0;
        if (picturePosition === 'left') {
            // Horizontal badges have no badge padding (padding: 0)
            badgePaddingCm = 0;
        } else {
            // Vertical badges have 15px padding on each side
            badgePaddingCm = (15 * 2) / 37.7952755906; // Convert pixels to cm
        }
        
        // 3. Content padding for horizontal badges (5px on each side)
        let contentPaddingCm = 0;
        if (picturePosition === 'left') {
            contentPaddingCm = (5 * 2) / 37.7952755906; // Convert pixels to cm
        }
        
        // 4. Image space for horizontal badges
        let imageSpaceCm = 0;
        if (picturePosition === 'left' && showPicture && hasPicture) {
            // For horizontal badges, the image container is square and takes full badge height
            // Convert badge height to pixels, then back to cm to match HTML calculation
            const imageContainerWidthPx = badgeHeight * 37.7952755906; // Convert cm to pixels
            imageSpaceCm = imageContainerWidthPx / 37.7952755906; // Convert back to cm
        }
        
        // 5. Additional safety margin - increased for image loading issues
        const safetyMarginCm = 0.5; // 0.5cm safety margin to account for image loading
        
        const requiredWidth = nameWidthCm + borderWidthCm + badgePaddingCm + contentPaddingCm + imageSpaceCm + safetyMarginCm;
        
        console.log('Width calculation:', {
            name,
            fontSize,
            nameWidthCm,
            borderWidthCm,
            badgePaddingCm,
            contentPaddingCm,
            imageSpaceCm,
            safetyMarginCm,
            requiredWidth,
            minWidth: this.settings.width,
            picturePosition,
            showPicture,
            hasPicture,
            badgeHeight,
            pictureDiameter,
            borderWidth: this.settings.borderWidth,
            finalWidth: picturePosition === 'left' ? Math.max(requiredWidth, 3) : Math.max(this.settings.width, requiredWidth)
        });
        
        return requiredWidth;
    }

    formatName(name) {
        if (!name) return '';

        const { fontSize, firstLetterColor } = this.settings;
        
        const words = name.split(' ');
        return words.map(word => {
            if (word.length > 0) {
                const firstLetter = word.charAt(0).toUpperCase();
                const rest = word.slice(1).toUpperCase();
                return `<span class="first-letter" style="color: ${firstLetterColor}; font-size: ${fontSize * this.settings.firstLetterSizeRatio}px;">${firstLetter}</span>${rest}`;
            }
            return word.toUpperCase();
        }).join(' ');
    }

    updateCounts() {
        const badgeCount = this.badges.length;
        const t = this.translations[this.currentLanguage];
        
        // Calculate pages needed (assuming 6 badges per page)
        const badgesPerPage = 6;
        const pageCount = Math.ceil(badgeCount / badgesPerPage);
        
        const countText = badgeCount === 1 ? 
            `1 ${t.badge}` : 
            `${badgeCount} ${t.badges}`;
        
        const pageText = pageCount === 1 ? 
            `1 ${t.page}` : 
            `${pageCount} ${t.pages}`;
        
        document.getElementById('badgeCount').textContent = countText;
        document.getElementById('pageCount').textContent = pageText;
    }

    saveData() {
        try {
            const data = {
                settings: this.settings,
                currentLanguage: this.currentLanguage
            };
            
            // Log the data being saved for debugging
            console.log('Saving settings:', {
                settingsCount: Object.keys(data.settings).length,
                currentLanguage: data.currentLanguage,
                totalSize: JSON.stringify(data).length
            });
            
            const jsonData = JSON.stringify(data);
            localStorage.setItem('badgeGeneratorData', jsonData);
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Could not save settings to localStorage:', error);
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('badgeGeneratorData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Load settings
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    document.getElementById('badgeWidth').value = this.settings.width;
                    document.getElementById('badgeHeight').value = this.settings.height;
                    
                    // Charger la qualité d'impression
                    if (this.settings.printQuality) {
                        document.getElementById('qualitySelect').value = this.settings.printQuality;
                    }
                    document.getElementById('borderColor').value = this.settings.borderColor;
                    document.getElementById('borderRadius').value = this.settings.borderRadius;
                    document.getElementById('borderWidth').value = this.settings.borderWidth;
                    document.getElementById('fontSize').value = this.settings.fontSize;
                    document.getElementById('firstLetterColor').value = this.settings.firstLetterColor;
                    document.getElementById('firstLetterSizeRatio').value = this.settings.firstLetterSizeRatio;
                    document.getElementById('picturePosition').checked = this.settings.picturePosition === 'left';
                    document.getElementById('pictureDiameter').value = this.settings.pictureDiameter;
                    document.getElementById('showImages').checked = this.settings.showImages;
                }

                // Load language preference
                if (data.currentLanguage) {
                    this.currentLanguage = data.currentLanguage;
                }
                
                // Apply language after loading data
                this.updateLanguage();
            }
        } catch (error) {
            console.log('Could not load data from localStorage:', error);
        }
    }


    async generatePDF() {
        const badges = this.getBadgeData();
        
        if (badges.length === 0) {
            alert('Please add at least one badge before generating PDF.');
            return;
        }

        // Show loading state
        const generateBtn = document.getElementById('generatePDF');
        const originalText = generateBtn.textContent;
        const originalDisabled = generateBtn.disabled;
        
        generateBtn.textContent = 'Génération en cours...';
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';
        generateBtn.style.cursor = 'not-allowed';

        try {
            // Create a temporary container for PDF generation
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            pdfContainer.style.top = '0';
            pdfContainer.style.width = 'auto'; // Let container adapt to content width
            pdfContainer.style.minWidth = `${this.settings.width}cm`; // Minimum width
            pdfContainer.style.height = `${this.settings.height}cm`;
            pdfContainer.style.background = 'white';
            pdfContainer.style.boxSizing = 'border-box';
            pdfContainer.style.overflow = 'visible'; // Allow content to extend beyond container
            document.body.appendChild(pdfContainer);

            // Generate all badges
            for (let i = 0; i < badges.length; i++) {
                const badge = badges[i];
                const badgeElement = document.createElement('div');
                badgeElement.innerHTML = this.createBadgeHTML(badge);
                badgeElement.style.textAlign = 'center';
                badgeElement.style.verticalAlign = 'middle';
                badgeElement.style.width = '100%';
                badgeElement.style.boxSizing = 'border-box';
                
                // Adjust height for horizontal badges
                if (this.settings.picturePosition === 'left') {
                    badgeElement.style.height = 'auto';
                    badgeElement.style.minHeight = '80px';
                } else {
                    badgeElement.style.height = '100%';
                }
                
                // Get the calculated width from the badge element
                const calculatedWidth = this.calculateRequiredWidth(badge.name, this.settings.fontSize, this.settings.picturePosition, this.settings.pictureDiameter, badge.showPicture, !!badge.picture, this.settings.height);
                
                // For horizontal badges, ignore width setting and use calculated width with minimum
                const minHorizontalWidth = 3; // 3cm minimum width for horizontal badges
                const badgeWidth = this.settings.picturePosition === 'left' ? Math.max(calculatedWidth, minHorizontalWidth) : Math.max(this.settings.width, calculatedWidth);
                badgeElement.style.width = `${badgeWidth}cm`;
                
                pdfContainer.appendChild(badgeElement);
            }

            // Generate PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'cm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const defaultBadgeWidth = this.settings.width;
            const defaultBadgeHeight = this.settings.height;

            let currentY = 1;
            let currentX = 1;

            for (let i = 0; i < badges.length; i++) {
                const badge = badges[i];
                const badgeElement = pdfContainer.children[i];
                
                // Calculate the actual width and height needed for this badge
                const calculatedWidth = this.calculateRequiredWidth(badge.name, this.settings.fontSize, this.settings.picturePosition, this.settings.pictureDiameter, badge.showPicture, !!badge.picture, this.settings.height);
                
                // For horizontal badges, ignore width setting and use calculated width with minimum
                const minHorizontalWidth = 3; // 3cm minimum width for horizontal badges
                const badgeWidth = this.settings.picturePosition === 'left' ? Math.max(calculatedWidth, minHorizontalWidth) : Math.max(defaultBadgeWidth, calculatedWidth);
                
                // Adjust height for horizontal badges
                let badgeHeight = defaultBadgeHeight;
                if (this.settings.picturePosition === 'left') {
                    // For horizontal badges, use a more appropriate height
                    badgeHeight = Math.max(4, defaultBadgeHeight * 0.8); // Reduce height by 20% but minimum 4cm
                }
                
                if (currentY + badgeHeight > pageHeight - 1) {
                    pdf.addPage();
                    currentY = 1;
                    currentX = 1;
                }

                if (currentX + badgeWidth > pageWidth - 1) {
                    currentY += badgeHeight + 0.5;
                    currentX = 1;
                    
                    if (currentY + badgeHeight > pageHeight - 1) {
                        pdf.addPage();
                        currentY = 1;
                        currentX = 1;
                    }
                }

                try {
                    // Ensure the badge element has the correct width before html2canvas
                    badgeElement.style.width = `${badgeWidth}cm`;
                    badgeElement.style.height = `${badgeHeight}cm`;
                    badgeElement.style.minWidth = `${badgeWidth}cm`;
                    badgeElement.style.maxWidth = 'none';
                    badgeElement.style.overflow = 'visible';
                    
                    // Override any CSS constraints that might limit width
                    const badgeInner = badgeElement.querySelector('.badge');
                    if (badgeInner) {
                        badgeInner.style.maxWidth = 'none';
                        badgeInner.style.width = '100%';
                        badgeInner.style.minWidth = '100%';
                        badgeInner.style.overflow = 'visible';
                    }
                    
                    // Ensure text content is not clipped
                    const badgeName = badgeElement.querySelector('.badge-name');
                    if (badgeName) {
                        badgeName.style.overflow = 'visible';
                        badgeName.style.textOverflow = 'clip';
                        badgeName.style.whiteSpace = 'nowrap';
                    }
                    
                    // Small delay to ensure DOM updates
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                    console.log('PDF badge generation:', {
                        name: badge.name,
                        badgeWidth,
                        badgeHeight,
                        picturePosition: this.settings.picturePosition,
                        showPicture: badge.showPicture,
                        hasPicture: !!badge.picture
                    });
                    
                    // Récupérer la qualité sélectionnée
                    const qualitySelect = document.getElementById('qualitySelect');
                    const selectedScale = parseInt(qualitySelect.value);
                    
                    const canvas = await html2canvas(badgeElement, {
                        scale: selectedScale, // Qualité sélectionnée par l'utilisateur
                        backgroundColor: 'white',
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        removeContainer: false, // Garder le conteneur pour éviter les problèmes
                        imageTimeout: 0, // Pas de timeout pour les images
                        width: undefined, // Let html2canvas determine natural width
                        height: undefined // Let html2canvas determine natural height
                    });

                    const imgData = canvas.toDataURL('image/png');
                    
                    console.log('Canvas dimensions:', {
                        canvasWidth: canvas.width,
                        canvasHeight: canvas.height,
                        badgeWidth,
                        badgeHeight,
                        name: badge.name
                    });
                    
                    pdf.addImage(imgData, 'PNG', currentX, currentY, badgeWidth, badgeHeight);
                    
                    currentX += badgeWidth + 0.5;
                } catch (error) {
                    console.error('Error generating badge:', error);
                    // Fallback: create simple text badge
                    pdf.setFontSize(16);
                    pdf.text(badge.name.toUpperCase(), currentX + badgeWidth/2, currentY + badgeHeight/2, { align: 'center' });
                    currentX += badgeWidth + 0.5;
                }
            }

            // Clean up
            document.body.removeChild(pdfContainer);

            // Save PDF
            pdf.save('badges.pdf');
            
            // Restore button state
            generateBtn.textContent = originalText;
            generateBtn.disabled = originalDisabled;
            generateBtn.style.opacity = '';
            generateBtn.style.cursor = '';
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
            
            // Restore button state on error
            generateBtn.textContent = originalText;
            generateBtn.disabled = originalDisabled;
            generateBtn.style.opacity = '';
            generateBtn.style.cursor = '';
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
}

// Initialize the badge generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.badgeApp = new BadgeGenerator();
    
    // Expose manual recalculation function globally for testing
    window.manualRecalculateWidths = () => {
        window.badgeApp.manualRecalculateWidths();
    };
    
    // Expose debug function globally for testing
    window.debugBadgeWidths = () => {
        window.badgeApp.debugBadgeWidths();
    };
});
