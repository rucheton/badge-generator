class TrombinoscopeGenerator {
    constructor() {
        this.photos = [];
        this.settings = {
            photoSize: 3, // cm
            fontSize: 12, // pt
            namePosition: 'below', // 'below' or 'above'
            photosPerRow: 4,
            margin: 1, // cm
            spacing: 0.5, // cm
            showBorders: true,
            borderColor: '#4CAF50',
            borderWidth: 1, // pt
            printQuality: 4 // Qualité d'impression par défaut (300 DPI)
        };
        
        this.currentLanguage = 'fr';
        this.translations = {
            fr: {
                title: '📸 Générateur de Trombinoscope',
                subtitle: 'Créez un trombinoscope imprimable pour votre classe. Rendu vectoriel haute qualité !',
                settings: 'Paramètres',
                photoSize: 'Taille des Photos (cm):',
                fontSize: 'Taille de la Police (pt):',
                namePosition: 'Position du Nom:',
                namePositionBelow: 'Sous la photo',
                namePositionAbove: 'Au-dessus de la photo',
                photosPerRow: 'Photos par Ligne:',
                margin: 'Marge (cm):',
                spacing: 'Espacement entre photos (cm):',
                showBorders: 'Afficher les Bordures:',
                showBordersHide: 'Masquer',
                showBordersShow: 'Afficher',
                borderColor: 'Couleur de la Bordure:',
                borderWidth: 'Épaisseur de la Bordure (pt):',
                trombinoscopeData: 'Données du Trombinoscope',
                clearAll: 'Tout Effacer',
                importCSV: 'Importer CSV',
                addPhoto: 'Ajouter Photo',
                firstName: 'Prénom',
                photo: 'Photo',
                gender: 'Genre',
                actions: 'Actions',
                remove: 'Supprimer',
                enterFirstName: 'Entrez le prénom',
                genderless: 'Sans Genre',
                boy: 'Garçon',
                girl: 'Fille',
                generatePDF: 'Générer PDF',
                preview: 'Aperçu',
                noPhotos: 'Aucune photo à prévisualiser. Ajoutez des photos ci-dessus !',
                photo: 'photo',
                photos: 'photos',
                page: 'page',
                pages: 'pages',
                dropZoneText: 'Glissez-déposez des photos ici',
                dropZoneSubtext: 'ou cliquez pour sélectionner des fichiers',
                dropZoneFormats: 'Formats supportés: JPG, PNG, GIF'
            },
            en: {
                title: '📸 Class Photo Generator',
                subtitle: 'Create a printable class photo directory. High quality vector rendering!',
                settings: 'Settings',
                photoSize: 'Photo Size (cm):',
                fontSize: 'Font Size (pt):',
                namePosition: 'Name Position:',
                namePositionBelow: 'Below photo',
                namePositionAbove: 'Above photo',
                photosPerRow: 'Photos per Row:',
                margin: 'Margin (cm):',
                spacing: 'Spacing between photos (cm):',
                showBorders: 'Show Borders:',
                showBordersHide: 'Hide',
                showBordersShow: 'Show',
                borderColor: 'Border Color:',
                borderWidth: 'Border Width (pt):',
                trombinoscopeData: 'Class Photo Data',
                clearAll: 'Clear All',
                importCSV: 'Import CSV',
                addPhoto: 'Add Photo',
                firstName: 'First Name',
                photo: 'Photo',
                gender: 'Gender',
                actions: 'Actions',
                remove: 'Remove',
                enterFirstName: 'Enter first name',
                genderless: 'Genderless',
                boy: 'Boy',
                girl: 'Girl',
                generatePDF: 'Generate PDF',
                preview: 'Preview',
                noPhotos: 'No photos to preview. Add some photos above!',
                photo: 'photo',
                photos: 'photos',
                page: 'page',
                pages: 'pages',
                dropZoneText: 'Drag and drop photos here',
                dropZoneSubtext: 'or click to select files',
                dropZoneFormats: 'Supported formats: JPG, PNG, GIF'
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
        document.getElementById('photoSize').addEventListener('change', (e) => {
            this.settings.photoSize = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('namePosition').addEventListener('change', (e) => {
            this.settings.namePosition = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('photosPerRow').addEventListener('change', (e) => {
            this.settings.photosPerRow = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('margin').addEventListener('change', (e) => {
            this.settings.margin = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('spacing').addEventListener('change', (e) => {
            this.settings.spacing = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('showBorders').addEventListener('change', (e) => {
            this.settings.showBorders = e.target.checked;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('borderColor').addEventListener('change', (e) => {
            this.settings.borderColor = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('borderWidth').addEventListener('change', (e) => {
            this.settings.borderWidth = parseFloat(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('qualitySelect').addEventListener('change', (e) => {
            this.settings.printQuality = parseInt(e.target.value);
            this.saveData();
        });

        // Button events
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('importCSV').addEventListener('click', () => this.importCSV());
        document.getElementById('addPhoto').addEventListener('click', () => this.addPhoto());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDF());

        // Drop zone events
        this.setupDropZone();

        // Initial row events
        this.bindRowEvents(document.querySelector('#trombinoscopeTableBody tr'));
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
        document.querySelector('label[for="photoSize"]').textContent = t.photoSize;
        document.querySelector('label[for="fontSize"]').textContent = t.fontSize;
        document.querySelector('label[for="namePosition"]').textContent = t.namePosition;
        document.querySelector('label[for="photosPerRow"]').textContent = t.photosPerRow;
        document.querySelector('label[for="margin"]').textContent = t.margin;
        document.querySelector('label[for="spacing"]').textContent = t.spacing;
        document.querySelector('label[for="showBorders"]').textContent = t.showBorders;
        document.querySelector('label[for="borderColor"]').textContent = t.borderColor;
        document.querySelector('label[for="borderWidth"]').textContent = t.borderWidth;
        
        // Update name position options
        const namePositionSelect = document.getElementById('namePosition');
        namePositionSelect.options[0].text = t.namePositionBelow;
        namePositionSelect.options[1].text = t.namePositionAbove;
        
        // Update show borders toggle labels
        const showBordersToggleLabels = document.querySelectorAll('#showBorders').nextElementSibling?.querySelectorAll('.toggle-label');
        if (showBordersToggleLabels && showBordersToggleLabels.length >= 2) {
            showBordersToggleLabels[0].textContent = t.showBordersHide;
            showBordersToggleLabels[1].textContent = t.showBordersShow;
        }
        
        // Update input panel
        document.querySelector('.input-panel h2').textContent = t.trombinoscopeData;
        document.getElementById('clearAll').textContent = t.clearAll;
        document.getElementById('importCSV').textContent = t.importCSV;
        document.getElementById('addPhoto').textContent = t.addPhoto;
        
        // Update table headers
        const tableHeaders = document.querySelectorAll('#trombinoscopeTable th');
        tableHeaders[0].textContent = t.firstName;
        tableHeaders[1].textContent = t.photo;
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
        
        // Update drop zone
        const dropZoneText = document.querySelector('.drop-zone-text h3');
        const dropZoneSubtext = document.querySelector('.drop-zone-text p');
        const dropZoneFormats = document.querySelector('.drop-zone-text small');
        if (dropZoneText) dropZoneText.textContent = t.dropZoneText;
        if (dropZoneSubtext) dropZoneSubtext.textContent = t.dropZoneSubtext;
        if (dropZoneFormats) dropZoneFormats.textContent = t.dropZoneFormats;
        
        // Update preview content
        this.updatePreview();
    }

    bindRowEvents(row) {
        const nameInput = row.querySelector('.name-input');
        const photoInput = row.querySelector('.photo-input');
        const genderSelect = row.querySelector('.gender-select');
        const removeButton = row.querySelector('.remove-row');

        // Name input events
        nameInput.addEventListener('input', () => {
            this.updatePreview();
            this.updateCounts();
            this.saveData();
            
            // Debounce the new row check
            clearTimeout(this.nameInputTimeout);
            this.nameInputTimeout = setTimeout(() => {
                this.checkAndAddNewRow(row);
                this.removeEmptyRows();
            }, 500);
        });

        // Photo input events
        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e, row);
            this.updatePreview();
            this.saveData();
            
            const nameInput = row.querySelector('.name-input');
            if (nameInput.value.trim().length >= 2) {
                this.checkAndAddNewRow(row);
                this.removeEmptyRows();
            }
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
        const photoInput = currentRow.querySelector('.photo-input');
        
        const hasName = nameInput.value.trim().length >= 2;
        const hasPhoto = photoInput.files.length > 0;
        
        if ((hasName && hasPhoto) || (hasName && nameInput.value.trim().length >= 3)) {
            const nextRow = currentRow.nextElementSibling;
            
            if (!nextRow) {
                this.addEmptyRowAfter(currentRow);
            }
        }
    }

    isRowEmpty(row) {
        const nameInput = row.querySelector('.name-input');
        const photoInput = row.querySelector('.photo-input');
        
        return nameInput.value.trim() === '' && photoInput.files.length === 0;
    }

    addEmptyRowAfter(currentRow) {
        const t = this.translations[this.currentLanguage];
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="name-input" placeholder="${t.enterFirstName}"></td>
            <td>
                <div class="image-input-container">
                    <input type="file" class="photo-input" accept="image/*">
                    <div class="image-preview"></div>
                </div>
            </td>
            <td>
                <select class="gender-select">
                    <option value="genderless">${t.genderless}</option>
                    <option value="boy">${t.boy}</option>
                    <option value="girl">${t.girl}</option>
                </select>
            </td>
            <td><button class="btn btn-danger remove-row" title="${t.remove}">❌</button></td>
        `;
        
        currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
        this.bindRowEvents(newRow);
        this.updateCounts();
        this.saveData();
    }

    removeEmptyRows() {
        const tbody = document.getElementById('trombinoscopeTableBody');
        const rows = Array.from(tbody.children);
        
        let focusRow = null;
        let focusInput = null;
        
        if (document.activeElement && document.activeElement.classList.contains('name-input')) {
            focusInput = document.activeElement;
            focusRow = focusInput.closest('tr');
        }
        
        let emptyRowFound = false;
        
        for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            if (this.isRowEmpty(row)) {
                if (row === focusRow) {
                    emptyRowFound = true;
                    continue;
                }
                
                if (emptyRowFound) {
                    row.remove();
                } else {
                    emptyRowFound = true;
                }
            }
        }
        
        if (!emptyRowFound) {
            const lastRow = tbody.lastElementChild;
            if (lastRow) {
                this.addEmptyRowAfter(lastRow);
            }
        }
        
        if (focusInput && focusRow && focusRow.parentNode) {
            const currentFocusRow = Array.from(tbody.children).find(row => 
                row.querySelector('.name-input').value === focusInput.value ||
                row === focusRow
            );
            
            if (currentFocusRow) {
                const newFocusInput = currentFocusRow.querySelector('.name-input');
                if (newFocusInput) {
                    newFocusInput.focus();
                    if (focusInput.value) {
                        newFocusInput.setSelectionRange(focusInput.selectionStart, focusInput.selectionEnd);
                    }
                }
            }
        }
    }

    handlePhotoUpload(event, row) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                
                // Store the image data in the row
                row.dataset.photo = imageData;
                
                // Show image preview
                const previewDiv = row.querySelector('.image-preview');
                if (previewDiv) {
                    previewDiv.innerHTML = `<img src="${imageData}" alt="Aperçu">`;
                    previewDiv.classList.add('has-image');
                }
                
                this.updatePreview();
                this.saveData();
            };
            reader.readAsDataURL(file);
        }
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
        });

        dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
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
            csvFiles.forEach(file => {
                this.processCSVFile(file);
            });
        } else if (imageFiles.length > 0) {
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

    extractFirstNameFromFilename(fileName) {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        if (nameWithoutExt.includes('_')) {
            const parts = nameWithoutExt.split('_');
            return parts[0].trim();
        } else {
            return nameWithoutExt.trim();
        }
    }

    createRowFromImage(file) {
        const firstName = this.extractFirstNameFromFilename(file.name);
        const t = this.translations[this.currentLanguage];
        const tbody = document.getElementById('trombinoscopeTableBody');
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="name-input" value="${firstName}"></td>
            <td>
                <div class="image-input-container">
                    <input type="file" class="photo-input" accept="image/*">
                    <div class="image-preview"></div>
                </div>
            </td>
            <td>
                <select class="gender-select">
                    <option value="genderless">${t.genderless}</option>
                    <option value="boy">${t.boy}</option>
                    <option value="girl">${t.girl}</option>
                </select>
            </td>
            <td><button class="btn btn-danger remove-row" title="${t.remove}">❌</button></td>
        `;
        
        tbody.appendChild(newRow);
        this.bindRowEvents(newRow);

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            newRow.dataset.photo = imageData;
            
            const previewDiv = newRow.querySelector('.image-preview');
            if (previewDiv) {
                previewDiv.innerHTML = `<img src="${imageData}" alt="Photo de ${firstName}">`;
                previewDiv.classList.add('has-image');
            }
            
            this.updatePreview();
            this.saveData();
        };
        reader.readAsDataURL(file);
    }

    addPhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => {
            this.processFiles(e.target.files);
        };
        input.click();
    }

    clearAll() {
        const t = this.translations[this.currentLanguage];
        const tbody = document.getElementById('trombinoscopeTableBody');
        tbody.innerHTML = `
            <tr>
                <td><input type="text" class="name-input" placeholder="${t.enterFirstName}"></td>
                <td>
                    <div class="image-input-container">
                        <input type="file" class="photo-input" accept="image/*">
                        <div class="image-preview"></div>
                    </div>
                </td>
                <td>
                    <select class="gender-select">
                        <option value="genderless">${t.genderless}</option>
                        <option value="boy">${t.boy}</option>
                        <option value="girl">${t.girl}</option>
                    </select>
                </td>
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
        const tbody = document.getElementById('trombinoscopeTableBody');
        tbody.innerHTML = '';

        lines.forEach((line, index) => {
            if (line.trim() && index > 0) {
                const [firstName] = line.split(',').map(s => s.trim());
                if (firstName) {
                    const t = this.translations[this.currentLanguage];
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td><input type="text" class="name-input" value="${firstName}"></td>
                        <td>
                            <div class="image-input-container">
                                <input type="file" class="photo-input" accept="image/*">
                                <div class="image-preview"></div>
                            </div>
                        </td>
                        <td>
                            <select class="gender-select">
                                <option value="genderless">${t.genderless}</option>
                                <option value="boy">${t.boy}</option>
                                <option value="girl">${t.girl}</option>
                            </select>
                        </td>
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

    getPhotoData() {
        const rows = document.querySelectorAll('#trombinoscopeTableBody tr');
        const photos = [];
        
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.name-input');
            const genderSelect = row.querySelector('.gender-select');
            
            const name = nameInput.value.trim();
            const gender = genderSelect.value;
            
            if (name) {
                const photo = row.dataset.photo || null;
                
                photos.push({
                    name: name,
                    photo: photo,
                    gender: gender
                });
            }
        });
        
        return photos;
    }

    updatePreview() {
        this.photos = this.getPhotoData();
        const previewContainer = document.getElementById('trombinoscopePreview');
        
        if (this.photos.length === 0) {
            const t = this.translations[this.currentLanguage];
            previewContainer.innerHTML = `<p class="no-photos">${t.noPhotos}</p>`;
            return;
        }
        
        const previewHTML = this.photos.map(photo => this.createPhotoHTML(photo)).join('');
        previewContainer.innerHTML = previewHTML;
    }

    createPhotoHTML(photo) {
        const { name, photo: photoData, gender } = photo;
        
        let imageHTML = '';
        if (photoData) {
            imageHTML = `<img src="${photoData}" alt="Photo de ${name}" class="photo-preview">`;
        } else {
            let avatarEmoji;
            if (gender === 'boy') {
                avatarEmoji = '👦';
            } else if (gender === 'girl') {
                avatarEmoji = '👧';
            } else {
                avatarEmoji = '🧒';
            }
            imageHTML = `<div class="default-avatar-preview">${avatarEmoji}</div>`;
        }
        
        const photoStyle = `
            width: ${this.settings.photoSize}cm;
            height: ${this.settings.photoSize}cm;
            border: ${this.settings.showBorders ? `${this.settings.borderWidth}px solid ${this.settings.borderColor}` : 'none'};
            border-radius: 8px;
        `;
        
        const nameStyle = `
            font-size: ${this.settings.fontSize}px;
            text-align: center;
            margin-top: 5px;
        `;
        
        if (this.settings.namePosition === 'above') {
            return `
                <div class="photo-item" style="display: inline-block; margin: 5px; text-align: center;">
                    <div class="photo-name" style="${nameStyle}">${name.toUpperCase()}</div>
                    <div class="photo-container" style="${photoStyle}">
                        ${imageHTML}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="photo-item" style="display: inline-block; margin: 5px; text-align: center;">
                    <div class="photo-container" style="${photoStyle}">
                        ${imageHTML}
                    </div>
                    <div class="photo-name" style="${nameStyle}">${name.toUpperCase()}</div>
                </div>
            `;
        }
    }

    updateCounts() {
        const photoCount = this.photos.length;
        const t = this.translations[this.currentLanguage];
        
        // Calculate pages needed
        const photosPerPage = this.settings.photosPerRow * 6; // Assuming 6 rows per page
        const pageCount = Math.ceil(photoCount / photosPerPage);
        
        const countText = photoCount === 1 ? 
            `1 ${t.photo}` : 
            `${photoCount} ${t.photos}`;
        
        const pageText = pageCount === 1 ? 
            `1 ${t.page}` : 
            `${pageCount} ${t.pages}`;
        
        document.getElementById('photoCount').textContent = countText;
        document.getElementById('pageCount').textContent = pageText;
    }

    saveData() {
        try {
            const data = {
                settings: this.settings,
                currentLanguage: this.currentLanguage
            };
            
            const jsonData = JSON.stringify(data);
            localStorage.setItem('trombinoscopeGeneratorData', jsonData);
        } catch (error) {
            console.error('Could not save settings to localStorage:', error);
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('trombinoscopeGeneratorData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    document.getElementById('photoSize').value = this.settings.photoSize;
                    document.getElementById('fontSize').value = this.settings.fontSize;
                    document.getElementById('namePosition').value = this.settings.namePosition;
                    document.getElementById('photosPerRow').value = this.settings.photosPerRow;
                    document.getElementById('margin').value = this.settings.margin;
                    document.getElementById('spacing').value = this.settings.spacing;
                    document.getElementById('showBorders').checked = this.settings.showBorders;
                    document.getElementById('borderColor').value = this.settings.borderColor;
                    document.getElementById('borderWidth').value = this.settings.borderWidth;
                    document.getElementById('qualitySelect').value = this.settings.printQuality;
                }

                if (data.currentLanguage) {
                    this.currentLanguage = data.currentLanguage;
                }
                
                this.updateLanguage();
            }
        } catch (error) {
            console.log('Could not load data from localStorage:', error);
        }
    }

    async generatePDF() {
        const photos = this.getPhotoData();
        
        if (photos.length === 0) {
            alert('Veuillez ajouter au moins une photo avant de générer le PDF.');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'cm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = this.settings.margin;
            const photoSize = this.settings.photoSize;
            const spacing = this.settings.spacing;
            const photosPerRow = this.settings.photosPerRow;
            
            // Calculate photo positions
            const photoWidth = photoSize;
            const photoHeight = photoSize;
            const nameHeight = this.settings.fontSize * 0.0352778; // Convert pt to cm (1 pt = 0.0352778 cm)
            const totalItemHeight = photoHeight + nameHeight + 0.3; // 0.3cm spacing between photo and name
            
            let currentX = margin;
            let currentY = margin;
            let photosInCurrentRow = 0;
            
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                
                // Check if we need a new page
                if (currentY + totalItemHeight > pageHeight - margin) {
                    pdf.addPage();
                    currentX = margin;
                    currentY = margin;
                    photosInCurrentRow = 0;
                }
                
                // Check if we need a new row
                if (photosInCurrentRow >= photosPerRow) {
                    currentY += totalItemHeight + spacing;
                    currentX = margin;
                    photosInCurrentRow = 0;
                    
                    // Check if we need a new page after moving to new row
                    if (currentY + totalItemHeight > pageHeight - margin) {
                        pdf.addPage();
                        currentY = margin;
                    }
                }
                
                // Draw photo with proper aspect ratio and rounded corners
                if (photo.photo) {
                    try {
                        // Create a temporary canvas to process the image
                        const img = new Image();
                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                            img.src = photo.photo;
                        });
                        
                        // Create canvas for image processing with high resolution
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set high resolution canvas (4x for better quality)
                        const resolutionScale = 4; // High resolution multiplier
                        canvas.width = photoSize * 37.7952755906 * resolutionScale; // Convert cm to pixels
                        canvas.height = photoSize * 37.7952755906 * resolutionScale;
                        
                        // Calculate scaling to maintain aspect ratio (scale to fill)
                        const scaleX = canvas.width / img.width;
                        const scaleY = canvas.height / img.height;
                        const imageScale = Math.max(scaleX, scaleY); // Use max to fill the entire area
                        
                        const scaledWidth = img.width * imageScale;
                        const scaledHeight = img.height * imageScale;
                        
                        // Calculate position to center the scaled image
                        const x = (canvas.width - scaledWidth) / 2;
                        const y = (canvas.height - scaledHeight) / 2;
                        
                        // Create clipping path for rounded corners
                        ctx.beginPath();
                        const radius = 8 * resolutionScale; // Scale radius for high resolution
                        ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
                        ctx.clip();
                        
                        // Draw the scaled image (will be clipped to rounded rectangle)
                        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                        
                        // Convert canvas to image data with high quality
                        const imageData = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality
                        
                        // Add processed image to PDF
                        pdf.addImage(imageData, 'PNG', currentX, currentY, photoWidth, photoHeight);
                        
                    } catch (error) {
                        console.error('Error processing image:', error);
                        // Draw placeholder with rounded corners
                        pdf.setFillColor(200, 200, 200);
                        this.drawRoundedRect(pdf, currentX, currentY, photoWidth, photoHeight, 0.2);
                    }
                } else {
                    // Draw default avatar with rounded corners
                    pdf.setFillColor(230, 230, 230);
                    this.drawRoundedRect(pdf, currentX, currentY, photoWidth, photoHeight, 0.2);
                    
                    // Add emoji or initial
                    let avatarText = '?';
                    if (photo.gender === 'boy') {
                        avatarText = '👦';
                    } else if (photo.gender === 'girl') {
                        avatarText = '👧';
                    } else {
                        avatarText = '🧒';
                    }
                    
                    pdf.setFontSize(photoSize * 2);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(avatarText, currentX + photoWidth/2, currentY + photoHeight/2, { align: 'center' });
                }
                
                // Draw border if enabled (with rounded corners)
                if (this.settings.showBorders) {
                    const borderColor = this.hexToRgb(this.settings.borderColor);
                    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
                    pdf.setLineWidth(this.settings.borderWidth * 0.035); // Convert pt to cm
                    this.drawRoundedRect(pdf, currentX, currentY, photoWidth, photoHeight, 0.2, false);
                }
                
                // Draw name with first letter in contrasting color
                // jsPDF Y coordinate starts from top, so we need to add font size to position text correctly
                const nameY = this.settings.namePosition === 'above' ? 
                    currentY - 0.2 : // Position above photo
                    currentY + photoHeight + 0.3 + (this.settings.fontSize * 0.0352778); // Position below photo with proper spacing
                
                // Set font that supports accents and UTF-8
                pdf.setFont('times', 'bold');
                pdf.setFontSize(this.settings.fontSize);
                
                // Draw name with first letter in contrasting color
                this.drawNameWithColoredFirstLetter(pdf, photo.name, currentX, nameY, photoWidth, this.settings.borderColor);
                
                // Move to next position
                currentX += photoWidth + spacing;
                photosInCurrentRow++;
            }
            
            // Save PDF
            pdf.save('trombinoscope.pdf');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        } finally {
            this.setLoadingState(false);
        }
    }

    // Helper function to draw rounded rectangles using native jsPDF functions
    drawRoundedRect(pdf, x, y, width, height, radius, fill = true) {
        const style = fill ? 'FD' : 'S'; // FD = Fill and Draw, S = Stroke only
        pdf.roundedRect(x, y, width, height, radius, radius, style);
    }

    // Helper function to draw name with colored first letter
    drawNameWithColoredFirstLetter(pdf, name, x, y, width, firstLetterColor) {
        // Normalize the name to handle accents properly
        const normalizedName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const fullName = normalizedName.toUpperCase();
        const centerX = x + width / 2;
        
        // Calculate total text width to center it
        const totalWidth = pdf.getTextWidth(fullName);
        const startX = centerX - totalWidth / 2;
        
        // Draw first letter in contrasting color
        const firstLetter = fullName.charAt(0);
        const restOfName = fullName.slice(1);
        
        // Set color for first letter
        const color = this.hexToRgb(firstLetterColor);
        pdf.setTextColor(color.r, color.g, color.b);
        pdf.text(firstLetter, startX, y, { align: 'left' });
        
        // Draw rest of name in black
        const firstLetterWidth = pdf.getTextWidth(firstLetter);
        pdf.setTextColor(0, 0, 0);
        pdf.text(restOfName, startX + firstLetterWidth, y, { align: 'left' });
    }

    setLoadingState(isLoading) {
        const generateBtn = document.getElementById('generatePDF');
        const generateText = document.getElementById('generateText');
        const generateSpinner = document.getElementById('generateSpinner');
        
        if (isLoading) {
            generateBtn.disabled = true;
            if (generateText) {
                generateText.textContent = 'Génération en cours...';
            } else {
                generateBtn.textContent = 'Génération en cours...';
            }
            if (generateSpinner) {
                generateSpinner.style.display = 'inline';
            }
        } else {
            generateBtn.disabled = false;
            if (generateText) {
                generateText.textContent = 'Générer PDF';
            } else {
                generateBtn.textContent = 'Générer PDF';
            }
            if (generateSpinner) {
                generateSpinner.style.display = 'none';
            }
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

// Initialize the trombinoscope generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TrombinoscopeGenerator();
});
