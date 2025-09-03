class BadgeGenerator {
    constructor() {
        this.badges = [];
        this.settings = {
            width: 8,
            height: 6,
            borderColor: '#4CAF50',
            borderRadius: 15,
            borderWidth: 10,
            fontSize: 18,
            firstLetterColor: '#667eea',
            firstLetterSizeRatio: 1.2,
            picturePosition: 'top',
            pictureDiameter: 80
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
                badgeData: 'Données des Badges',
                clearAll: 'Tout Effacer',
                importCSV: 'Importer CSV',
                firstName: 'Prénom',
                picture: 'Image',
                showPicture: 'Afficher l\'Image',
                gender: 'Genre',
                actions: 'Actions',
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
                badgeData: 'Badge Data',
                clearAll: 'Clear All',
                importCSV: 'Import CSV',
                firstName: 'First Name',
                picture: 'Picture',
                showPicture: 'Show Picture',
                gender: 'Gender',
                actions: 'Actions',
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
            this.settings.picturePosition = e.target.value;
            this.saveData();
            this.updatePreview();
        });

        document.getElementById('pictureDiameter').addEventListener('change', (e) => {
            this.settings.pictureDiameter = parseInt(e.target.value);
            this.saveData();
            this.updatePreview();
        });

        // Button events
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('importCSV').addEventListener('click', () => this.importCSV());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDF());

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
        
        // Update picture position options
        const picturePositionSelect = document.getElementById('picturePosition');
        picturePositionSelect.options[0].text = t.picturePositionTop;
        picturePositionSelect.options[1].text = t.picturePositionLeft;
        
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
            <td><button class="btn btn-danger remove-row">${t.remove}</button></td>
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

    restorePictureData(row, pictureData) {
        // Store the picture data in the row for later use
        row.dataset.picture = pictureData;
        
        // Show image preview if picture data exists
        if (pictureData) {
            const previewDiv = row.querySelector('.image-preview');
            if (previewDiv) {
                previewDiv.innerHTML = `<img src="${pictureData}" alt="Aperçu">`;
                previewDiv.classList.add('has-image');
            }
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
                <td><button class="btn btn-danger remove-row">${t.remove}</button></td>
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
                        <td><button class="btn btn-danger remove-row">${t.remove}</button></td>
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
            const showPicture = showPictureCheckbox.checked;
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
    }

    createBadgeHTML(badge) {
        const { name, picture, showPicture, gender } = badge;
        const formattedName = this.formatName(name);
        
        // Calculate required width based on name length and font size
        const requiredWidth = this.calculateRequiredWidth(name, this.settings.fontSize, this.settings.picturePosition, this.settings.pictureDiameter);
        const badgeWidth = Math.max(this.settings.width, requiredWidth);
        
        let imageHTML = '';
        if (showPicture && picture) {
            // Show the actual image when checkbox is checked and image exists
            imageHTML = `<img src="${picture}" alt="Photo de ${name}" class="badge-image" style="width: ${this.settings.pictureDiameter}px; height: ${this.settings.pictureDiameter}px; object-fit: cover; border-radius: 50%; border: 2px solid ${this.settings.borderColor};">`;
        } else if (showPicture && !picture) {
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
            
            imageHTML = `<div class="default-avatar" style="background-color: ${this.settings.borderColor}; border-color: ${this.settings.borderColor}; width: ${this.settings.pictureDiameter}px; height: ${this.settings.pictureDiameter}px; font-size: ${this.settings.pictureDiameter * 0.5}px;">${avatarEmoji}</div>`;
        } else {
            // No image display when checkbox is unchecked (but image data is preserved)
            imageHTML = '';
        }
        
        const badgeStyle = `
            width: ${badgeWidth}cm;
            height: ${this.settings.height}cm;
            border: ${this.settings.borderWidth}px solid ${this.settings.borderColor};
            border-radius: ${this.settings.borderRadius}px;
            font-size: ${this.settings.fontSize}px;
        `;
        
        if (this.settings.picturePosition === 'left') {
            return `
                <div class="badge badge-horizontal" style="${badgeStyle}">
                    <div class="badge-image-container">
                        ${imageHTML}
                    </div>
                    <div class="badge-content-horizontal">
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

    calculateRequiredWidth(name, fontSize, picturePosition, pictureDiameter) {
        // Estimate character width based on font size (rough approximation)
        const charWidth = fontSize * 0.6; // pixels per character
        const nameLength = name.length;
        const estimatedNameWidth = nameLength * charWidth;
        
        // Convert pixels to cm (96 DPI)
        const nameWidthCm = estimatedNameWidth / 37.7952755906;
        
        // Add padding and margins
        const padding = 2; // 2cm total padding (1cm on each side)
        const imageSpace = picturePosition === 'left' ? (pictureDiameter / 37.7952755906) + 1 : 0; // 1cm gap for left position
        
        const requiredWidth = nameWidthCm + padding + imageSpace;
        
        console.log('Width calculation:', {
            name,
            nameLength,
            fontSize,
            charWidth,
            estimatedNameWidth,
            nameWidthCm,
            padding,
            imageSpace,
            requiredWidth,
            minWidth: this.settings.width
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
                currentLanguage: this.currentLanguage,
                badges: this.getBadgeData()
            };
            
            // Log the data being saved for debugging
            console.log('Saving data:', {
                settingsCount: Object.keys(data.settings).length,
                badgesCount: data.badges.length,
                badgesWithImages: data.badges.filter(b => b.picture).length,
                totalSize: JSON.stringify(data).length
            });
            
            const jsonData = JSON.stringify(data);
            
            // Check if data is too large for localStorage
            if (jsonData.length > 5000000) { // 5MB limit
                console.warn('Data is very large, some images might not be saved:', jsonData.length, 'bytes');
            }
            
            localStorage.setItem('badgeGeneratorData', jsonData);
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Could not save data to localStorage:', error);
            
            // If it's a QuotaExceededError, try to save without images
            if (error.name === 'QuotaExceededError') {
                console.log('localStorage quota exceeded, trying to save without images...');
                try {
                    const dataWithoutImages = {
                        settings: this.settings,
                        currentLanguage: this.currentLanguage,
                        badges: this.getBadgeData().map(badge => ({
                            ...badge,
                            picture: null // Remove images to save space
                        }))
                    };
                    localStorage.setItem('badgeGeneratorData', JSON.stringify(dataWithoutImages));
                    console.log('Data saved without images');
                } catch (retryError) {
                    console.error('Could not save data even without images:', retryError);
                }
            }
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
                    document.getElementById('borderColor').value = this.settings.borderColor;
                    document.getElementById('borderRadius').value = this.settings.borderRadius;
                    document.getElementById('borderWidth').value = this.settings.borderWidth;
                    document.getElementById('fontSize').value = this.settings.fontSize;
                    document.getElementById('firstLetterColor').value = this.settings.firstLetterColor;
                    document.getElementById('firstLetterSizeRatio').value = this.settings.firstLetterSizeRatio;
                    document.getElementById('picturePosition').value = this.settings.picturePosition;
                    document.getElementById('pictureDiameter').value = this.settings.pictureDiameter;
                }

                // Load language preference
                if (data.currentLanguage) {
                    this.currentLanguage = data.currentLanguage;
                }

                // Load badges
                if (data.badges && data.badges.length > 0) {
                    this.loadBadgesFromData(data.badges);
                }
                
                // Apply language after loading data
                this.updateLanguage();
                
                // Ensure there's exactly one empty row available
                this.removeEmptyRows();
            }
        } catch (error) {
            console.log('Could not load data from localStorage:', error);
        }
    }

    loadBadgesFromData(badges) {
        const tbody = document.getElementById('badgeTableBody');
        tbody.innerHTML = '';
        
        badges.forEach(badge => {
            const t = this.translations[this.currentLanguage];
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" class="name-input" value="${badge.name || ''}"></td>
                <td>
                    <div class="image-input-container">
                        <input type="checkbox" class="show-picture-checkbox" ${badge.showPicture ? 'checked' : ''}>
                        <input type="file" class="picture-input" accept="image/*">
                        <div class="image-preview"></div>
                    </div>
                </td>
                <td><select class="gender-select"><option value="genderless" ${badge.gender === 'genderless' ? 'selected' : ''}>${t.genderless}</option><option value="boy" ${badge.gender === 'boy' ? 'selected' : ''}>${t.boy}</option><option value="girl" ${badge.gender === 'girl' ? 'selected' : ''}>${t.girl}</option></select></td>
                <td><button class="btn btn-danger remove-row">${t.remove}</button></td>
            `;
            tbody.appendChild(newRow);
            this.bindRowEvents(newRow);
            
            // If there's picture data, restore it
            if (badge.picture) {
                this.restorePictureData(newRow, badge.picture);
            }
        });
        
        this.updatePreview();
        this.updateCounts();
    }

    async generatePDF() {
        const badges = this.getBadgeData();
        
        if (badges.length === 0) {
            alert('Please add at least one badge before generating PDF.');
            return;
        }

        try {
            // Create a temporary container for PDF generation
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            pdfContainer.style.top = '0';
            pdfContainer.style.width = `${this.settings.width}cm`;
            pdfContainer.style.height = `${this.settings.height}cm`;
            pdfContainer.style.background = 'white';
            pdfContainer.style.boxSizing = 'border-box';
            pdfContainer.style.overflow = 'hidden';
            document.body.appendChild(pdfContainer);

            // Generate all badges
            for (let i = 0; i < badges.length; i++) {
                const badge = badges[i];
                const badgeElement = document.createElement('div');
                badgeElement.innerHTML = this.createBadgeHTML(badge);
                badgeElement.style.textAlign = 'center';
                badgeElement.style.verticalAlign = 'middle';
                // badgeElement.style.background = 'white';
                badgeElement.style.width = '100%';
                badgeElement.style.height = '100%';
                badgeElement.style.boxSizing = 'border-box';
                
                // Get the calculated width from the badge element
                const calculatedWidth = this.calculateRequiredWidth(badge.name, this.settings.fontSize, this.settings.picturePosition, this.settings.pictureDiameter);
                const badgeWidth = Math.max(this.settings.width, calculatedWidth);
                badgeElement.style.width = `${badgeWidth}cm`;
                
                pdfContainer.appendChild(badgeElement);
            }

            // Generate PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'cm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const badgeWidth = this.settings.width;
            const badgeHeight = this.settings.height;

            let currentY = 1;
            let currentX = 1;

            for (let i = 0; i < badges.length; i++) {
                if (currentY + badgeHeight > pageHeight - 1) {
                    pdf.addPage();
                    currentY = 1;
                    currentX = 1;
                }

                const badge = badges[i];
                const badgeElement = pdfContainer.children[i];
                
                // Calculate the actual width needed for this badge
                const calculatedWidth = this.calculateRequiredWidth(badge.name, this.settings.fontSize, this.settings.picturePosition, this.settings.pictureDiameter);
                const badgeWidth = Math.max(this.settings.width, calculatedWidth);

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
                    const canvas = await html2canvas(badgeElement, {
                        scale: 2,
                        backgroundColor: 'white',
                        width: badgeWidth * 37.7952755906, // Convert cm to pixels (96 DPI)
                        height: badgeHeight * 37.7952755906,
                        useCORS: true,
                        allowTaint: true
                    });

                    const imgData = canvas.toDataURL('image/png');
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
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
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
    new BadgeGenerator();
});
