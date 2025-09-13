// Générateur de Grilles d'Objectifs - Maternelle
class ObjectivesGridGenerator {
    constructor() {
        this.loadSavedData();
        this.setupAutoSave();
        this.importedNames = [];
        this.importedCsvs = []; // Stockage des CSV importés
        this.initializeDate();
        this.loadCsvData();
        this.setupCsvEventListeners();
    }

    // Initialiser la date du jour
    initializeDate() {
        const today = new Date();
        const dateInput = document.getElementById('useDate');
        if (dateInput) {
            dateInput.value = today.toISOString().split('T')[0];
        }
    }

    // Obtenir les domaines sélectionnés
    getSelectedDomains() {
        const checkboxes = document.querySelectorAll('.domain-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Obtenir le titre adapté selon le nombre de domaines
    getDomainTitle(domains) {
        if (domains.length === 1) {
            return 'Domaine d\'apprentissage :';
        } else {
            return 'Domaines d\'apprentissage :';
        }
    }

    // Calculer les hauteurs dynamiques des cellules
    calculateCellHeights(doc, domains, goal, instruction, tableWidth, baseHeight) {
        // Configurer la police pour les calculs
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11); // Augmenté de 9 à 11 pour une meilleure lisibilité
        
        // Obtenir la hauteur exacte d'une ligne de texte
        const fontSize = doc.getFontSize();
        const lineHeight = fontSize * 0.4; // Facteur plus précis pour jsPDF
        
        const titleHeight = 6;
        const textSpacing = 4; // Augmenté de 2 à 4 pour plus d'espace
        const minHeight = 10;
        const bottomMargin = 1.5;
        
        // Hauteur pour Nom/Date (fixe)
        const nameDateHeight = baseHeight;
        
        // Hauteur pour les domaines - calcul exact avec jsPDF
        const domainText = domains.join(' • ');
        const domainLines = doc.splitTextToSize(domainText, tableWidth - 12);
        const domainTextHeight = domainLines.length * lineHeight;
        const domainHeight = Math.max(minHeight, titleHeight + textSpacing + domainTextHeight + bottomMargin);
        
        // Hauteur pour l'objectif - calcul exact avec jsPDF
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        const goalTextHeight = goalLines.length * lineHeight;
        const goalHeight = Math.max(minHeight, titleHeight + textSpacing + goalTextHeight + bottomMargin);
        
        // Hauteur pour la consigne - calcul exact avec jsPDF
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        const instructionTextHeight = instructionLines.length * lineHeight;
        const instructionHeight = Math.max(minHeight, titleHeight + textSpacing + instructionTextHeight + bottomMargin);
        
        return {
            nameDate: nameDateHeight,
            domain: domainHeight,
            goal: goalHeight,
            instruction: instructionHeight
        };
    }

    // Générer le PDF
    generatePDF() {
        const selectedDomains = this.getSelectedDomains();
        const objectiveGoal = document.getElementById('objectiveGoal').value.trim();
        const objectiveInstruction = document.getElementById('objectiveInstruction').value.trim();
        const useDate = document.getElementById('useDate').value;
        const dateText = document.getElementById('dateText').value.trim();
        
        // Utiliser la date libre si fournie, sinon la date du calendrier
        const finalDate = dateText || useDate;

        // Validation
        if (selectedDomains.length === 0 || !objectiveGoal || !objectiveInstruction) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const generateBtn = document.getElementById('generatePDF');
        generateBtn.disabled = true;
        generateBtn.textContent = 'Génération en cours...';

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Paramètres de la page
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 8; // Marges très réduites pour maximiser l'espace
            const contentWidth = pageWidth - (2 * margin);
            
            // Calculer les dimensions d'une grille
            const gridHeight = 72; // Hauteur d'une grille (4 lignes × 18mm)
            const gridSpacing = 5; // Espacement entre les grilles
            
            // Calculer le nombre maximum de grilles par page
            const availableHeight = pageHeight - (2 * margin);
            const maxGridsPerPage = Math.floor(availableHeight / (gridHeight + gridSpacing));
            
            // Générer les grilles selon la sélection des CSV
            if (this.importedNames.length > 0) {
                this.generateWithNames(doc, selectedDomains, objectiveGoal, objectiveInstruction, finalDate, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing);
            } else {
                this.generateFullPage(doc, selectedDomains, objectiveGoal, objectiveInstruction, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing, maxGridsPerPage);
            }

            // Télécharger le PDF
            const fileName = `Grille_Objectifs_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            // Sauvegarder les données après génération
            this.saveCurrentData();

            this.showMessage('PDF généré avec succès !', 'success');

        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            this.showMessage('Erreur lors de la génération du PDF.', 'error');
        } finally {
            const generateBtn = document.getElementById('generatePDF');
            const printBtn = document.getElementById('printPDF');
            generateBtn.disabled = false;
            printBtn.disabled = false;
            generateBtn.textContent = 'Télécharger le PDF';
            printBtn.textContent = 'Imprimer le PDF';
        }
    }

    // Imprimer le PDF
    printPDF() {
        const selectedDomains = this.getSelectedDomains();
        const objectiveGoal = document.getElementById('objectiveGoal').value.trim();
        const objectiveInstruction = document.getElementById('objectiveInstruction').value.trim();
        const useDate = document.getElementById('useDate').value;
        const dateText = document.getElementById('dateText').value.trim();
        
        // Utiliser la date libre si fournie, sinon la date du calendrier
        const finalDate = dateText || useDate;

        // Validation
        if (selectedDomains.length === 0 || !objectiveGoal || !objectiveInstruction) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const printBtn = document.getElementById('printPDF');
        printBtn.disabled = true;
        printBtn.textContent = 'Génération en cours...';

        try {
            // Créer le document PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Paramètres de page
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 8; // Marges très réduites pour maximiser l'espace
            const contentWidth = pageWidth - (2 * margin);
            
            // Calculer les dimensions d'une grille
            const gridHeight = 72; // Hauteur d'une grille (4 lignes × 18mm)
            const gridSpacing = 5; // Espacement entre les grilles
            
            // Calculer le nombre maximum de grilles par page
            const availableHeight = pageHeight - (2 * margin);
            const maxGridsPerPage = Math.floor(availableHeight / (gridHeight + gridSpacing));
            
            // Générer les grilles selon la sélection des CSV
            if (this.importedNames.length > 0) {
                this.generateWithNames(doc, selectedDomains, objectiveGoal, objectiveInstruction, finalDate, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing);
            } else {
                this.generateFullPage(doc, selectedDomains, objectiveGoal, objectiveInstruction, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing, maxGridsPerPage);
            }

            // Créer un blob et l'imprimer directement
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Créer une fenêtre d'impression avec le PDF
            const printWindow = window.open(pdfUrl, '_blank');
            
            // Attendre que le PDF soit chargé puis imprimer
            if (printWindow) {
                printWindow.onload = function() {
                    setTimeout(function() {
                        printWindow.print();
                        // Nettoyer l'URL après impression
                        setTimeout(function() {
                            URL.revokeObjectURL(pdfUrl);
                        }, 1000);
                    }, 1000);
                };
            }

        } catch (error) {
            console.error('Erreur lors de l\'impression du PDF:', error);
            alert('Erreur lors de l\'impression du PDF. Veuillez réessayer.');
        } finally {
            const generateBtn = document.getElementById('generatePDF');
            const printBtn = document.getElementById('printPDF');
            generateBtn.disabled = false;
            printBtn.disabled = false;
            generateBtn.textContent = 'Télécharger le PDF';
            printBtn.textContent = 'Imprimer le PDF';
        }
    }

    // Générer une page complète optimisée
    generateFullPage(doc, domains, goal, instruction, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing, maxGridsPerPage) {
        let yPosition = margin;
        
        // Calculer la hauteur totale d'une grille UNE SEULE FOIS
        const heights = this.calculateCellHeights(doc, domains, goal, instruction, contentWidth, 12);
        const totalGridHeight = heights.nameDate + heights.domain + heights.goal + heights.instruction;
        
        // Générer toutes les grilles possibles sur la page
        for (let i = 0; i < maxGridsPerPage; i++) {
            // Vérifier si on a assez d'espace pour une grille complète
            if (yPosition + totalGridHeight > pageHeight - margin) {
                break;
            }
            
            // Créer le tableau simple avec les hauteurs pré-calculées
            this.createSimpleTableWithHeights(doc, domains, goal, instruction, yPosition, contentWidth, margin, heights);
            
            // Passer à la position suivante
            yPosition += totalGridHeight + gridSpacing;
        }
    }

    // Générer avec les prénoms importés
    generateWithNames(doc, domains, goal, instruction, useDate, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing) {
        let yPosition = margin;
        let currentPage = 0;
        
        // Calculer la hauteur totale d'une grille UNE SEULE FOIS
        const heights = this.calculateCellHeights(doc, domains, goal, instruction, contentWidth, 12);
        const totalGridHeight = heights.nameDate + heights.domain + heights.goal + heights.instruction;
        
        for (let i = 0; i < this.importedNames.length; i++) {
            // Vérifier si on a besoin d'une nouvelle page
            if (yPosition + totalGridHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
                currentPage++;
            }
            
            // Créer le tableau avec le prénom prérempli et hauteurs pré-calculées
            this.createTableWithNameAndHeights(doc, this.importedNames[i], useDate, domains, goal, instruction, yPosition, contentWidth, margin, heights);
            
            // Passer à la position suivante
            yPosition += totalGridHeight + gridSpacing;
        }
    }

    // Créer un tableau avec prénom prérempli et hauteurs pré-calculées
    createTableWithNameAndHeights(doc, name, date, domains, goal, instruction, startY, tableWidth, margin, heights) {
        const lineWidth = 0.2;
        
        // Ligne 1: Prénom et Date
        doc.setLineWidth(lineWidth);
        doc.line(margin, startY, margin + tableWidth, startY);
        doc.line(margin, startY + heights.nameDate, margin + tableWidth, startY + heights.nameDate);
        doc.line(margin + tableWidth/2, startY, margin + tableWidth/2, startY + heights.nameDate);
        
        // Texte dans les cellules
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Prénom :', margin + 3, startY + 8);
        doc.text('Date :', margin + tableWidth/2 + 3, startY + 8);
        
        // Prénom prérempli (majuscules, même style que le titre)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(name.toUpperCase(), margin + 25, startY + 8);
        
        // Date préremplie si fournie
        if (date) {
            // Vérifier si c'est une date valide ou du texte libre
            const dateObj = new Date(date);
            const isDateValid = !isNaN(dateObj.getTime()) && date.length > 0;
            
            if (isDateValid) {
                // C'est une date valide, la formater
                const formattedDate = dateObj.toLocaleDateString('fr-FR');
                doc.text(formattedDate, margin + tableWidth/2 + 25, startY + 8);
            } else {
                // C'est du texte libre, l'afficher tel quel
                doc.text(date, margin + tableWidth/2 + 25, startY + 8);
            }
        }
        
        // Reste du tableau (domaine, objectif, consigne)
        this.addTableContentDynamic(doc, domains, goal, instruction, startY, tableWidth, margin, heights, lineWidth);
    }

    // Créer un tableau simple (version avec calcul des hauteurs)
    createSimpleTable(doc, domains, goal, instruction, startY, tableWidth, margin) {
        const baseCellHeight = 12; // Hauteur de base pour les cellules simples
        const lineWidth = 0.2; // Lignes encore plus fines
        
        // Calculer les hauteurs dynamiques
        const heights = this.calculateCellHeights(doc, domains, goal, instruction, tableWidth, baseCellHeight);
        
        // Ligne 1: Nom et Date
        doc.setLineWidth(lineWidth);
        doc.line(margin, startY, margin + tableWidth, startY); // Ligne du haut
        doc.line(margin, startY + heights.nameDate, margin + tableWidth, startY + heights.nameDate); // Ligne du bas
        
        // Ligne verticale au milieu
        doc.line(margin + tableWidth/2, startY, margin + tableWidth/2, startY + heights.nameDate);
        
        // Texte dans les cellules
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Prénom :', margin + 3, startY + 8);
        doc.text('Date :', margin + tableWidth/2 + 3, startY + 8);
        
        // Ligne 2: Domaine(s) de compétence
        const domainY = startY + heights.nameDate;
        doc.setLineWidth(lineWidth);
        doc.line(margin, domainY, margin + tableWidth, domainY); // Ligne du haut
        doc.line(margin, domainY + heights.domain, margin + tableWidth, domainY + heights.domain); // Ligne du bas
        
        // Titre du domaine (adapté selon le nombre)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const domainTitle = this.getDomainTitle(domains);
        doc.text(domainTitle, margin + 3, domainY + 6);
        
        // Texte du/des domaine(s)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const domainText = domains.join(' • ');
        const domainLines = doc.splitTextToSize(domainText, tableWidth - 12);
        doc.text(domainLines, margin + 3, domainY + 12);
        
        // Ligne 3: Objectif
        const goalY = domainY + heights.domain;
        doc.setLineWidth(lineWidth);
        doc.line(margin, goalY, margin + tableWidth, goalY); // Ligne du haut
        doc.line(margin, goalY + heights.goal, margin + tableWidth, goalY + heights.goal); // Ligne du bas
        
        // Titre de l'objectif
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Objectif :', margin + 3, goalY + 6);
        
        // Texte de l'objectif
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        doc.text(goalLines, margin + 3, goalY + 12);
        
        // Ligne 4: Consigne
        const instructionY = goalY + heights.goal;
        doc.setLineWidth(lineWidth);
        doc.line(margin, instructionY, margin + tableWidth, instructionY); // Ligne du haut
        doc.line(margin, instructionY + heights.instruction, margin + tableWidth, instructionY + heights.instruction); // Ligne du bas
        
        // Titre de la consigne
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Consigne :', margin + 3, instructionY + 6);
        
        // Texte de la consigne
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        doc.text(instructionLines, margin + 3, instructionY + 12);
        
        // Bordures verticales
        doc.line(margin, startY, margin, instructionY + heights.instruction); // Bordure gauche
        doc.line(margin + tableWidth, startY, margin + tableWidth, instructionY + heights.instruction); // Bordure droite
    }

    // Créer un tableau simple avec hauteurs pré-calculées
    createSimpleTableWithHeights(doc, domains, goal, instruction, startY, tableWidth, margin, heights) {
        const lineWidth = 0.2; // Lignes encore plus fines
        
        // Ligne 1: Nom et Date
        doc.setLineWidth(lineWidth);
        doc.line(margin, startY, margin + tableWidth, startY); // Ligne du haut
        doc.line(margin, startY + heights.nameDate, margin + tableWidth, startY + heights.nameDate); // Ligne du bas
        
        // Ligne verticale au milieu
        doc.line(margin + tableWidth/2, startY, margin + tableWidth/2, startY + heights.nameDate);
        
        // Texte dans les cellules
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Prénom :', margin + 3, startY + 8);
        doc.text('Date :', margin + tableWidth/2 + 3, startY + 8);
        
        // Ligne 2: Domaine(s) de compétence
        const domainY = startY + heights.nameDate;
        doc.setLineWidth(lineWidth);
        doc.line(margin, domainY, margin + tableWidth, domainY); // Ligne du haut
        doc.line(margin, domainY + heights.domain, margin + tableWidth, domainY + heights.domain); // Ligne du bas
        
        // Titre du domaine (adapté selon le nombre)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const domainTitle = this.getDomainTitle(domains);
        doc.text(domainTitle, margin + 3, domainY + 6);
        
        // Texte du/des domaine(s)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const domainText = domains.join(' • ');
        const domainLines = doc.splitTextToSize(domainText, tableWidth - 12);
        doc.text(domainLines, margin + 3, domainY + 12);
        
        // Ligne 3: Objectif
        const goalY = domainY + heights.domain;
        doc.setLineWidth(lineWidth);
        doc.line(margin, goalY, margin + tableWidth, goalY); // Ligne du haut
        doc.line(margin, goalY + heights.goal, margin + tableWidth, goalY + heights.goal); // Ligne du bas
        
        // Titre de l'objectif
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Objectif :', margin + 3, goalY + 6);
        
        // Texte de l'objectif
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        doc.text(goalLines, margin + 3, goalY + 12);
        
        // Ligne 4: Consigne
        const instructionY = goalY + heights.goal;
        doc.setLineWidth(lineWidth);
        doc.line(margin, instructionY, margin + tableWidth, instructionY); // Ligne du haut
        doc.line(margin, instructionY + heights.instruction, margin + tableWidth, instructionY + heights.instruction); // Ligne du bas
        
        // Titre de la consigne
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Consigne :', margin + 3, instructionY + 6);
        
        // Texte de la consigne
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        doc.text(instructionLines, margin + 3, instructionY + 12);
        
        // Bordures verticales
        doc.line(margin, startY, margin, instructionY + heights.instruction); // Bordure gauche
        doc.line(margin + tableWidth, startY, margin + tableWidth, instructionY + heights.instruction); // Bordure droite
    }

    // Ajouter le contenu du tableau avec hauteurs dynamiques
    addTableContentDynamic(doc, domains, goal, instruction, startY, tableWidth, margin, heights, lineWidth) {
        // Ligne 2: Domaine(s) de compétence
        const domainY = startY + heights.nameDate;
        doc.setLineWidth(lineWidth);
        doc.line(margin, domainY, margin + tableWidth, domainY);
        doc.line(margin, domainY + heights.domain, margin + tableWidth, domainY + heights.domain);
        
        // Titre du domaine (adapté selon le nombre)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const domainTitle = this.getDomainTitle(domains);
        doc.text(domainTitle, margin + 3, domainY + 6);
        
        // Texte du/des domaine(s)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const domainText = domains.join(' • ');
        const domainLines = doc.splitTextToSize(domainText, tableWidth - 12);
        doc.text(domainLines, margin + 3, domainY + 12);
        
        // Ligne 3: Objectif
        const goalY = domainY + heights.domain;
        doc.setLineWidth(lineWidth);
        doc.line(margin, goalY, margin + tableWidth, goalY);
        doc.line(margin, goalY + heights.goal, margin + tableWidth, goalY + heights.goal);
        
        // Titre de l'objectif
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Objectif :', margin + 3, goalY + 6);
        
        // Texte de l'objectif
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        doc.text(goalLines, margin + 3, goalY + 12);
        
        // Ligne 4: Consigne
        const instructionY = goalY + heights.goal;
        doc.setLineWidth(lineWidth);
        doc.line(margin, instructionY, margin + tableWidth, instructionY);
        doc.line(margin, instructionY + heights.instruction, margin + tableWidth, instructionY + heights.instruction);
        
        // Titre de la consigne
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Consigne :', margin + 3, instructionY + 6);
        
        // Texte de la consigne
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        doc.text(instructionLines, margin + 3, instructionY + 12);
        
        // Bordures verticales
        doc.line(margin, startY, margin, instructionY + heights.instruction);
        doc.line(margin + tableWidth, startY, margin + tableWidth, instructionY + heights.instruction);
    }

    // Ajouter le contenu du tableau (domaine, objectif, consigne) - version statique
    addTableContent(doc, domains, goal, instruction, startY, tableWidth, margin, cellHeight, lineWidth) {
        // Ligne 2: Domaine(s) de compétence
        const domainY = startY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, domainY, margin + tableWidth, domainY);
        doc.line(margin, domainY + cellHeight, margin + tableWidth, domainY + cellHeight);
        
        // Titre du domaine (adapté selon le nombre)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const domainTitle = this.getDomainTitle(domains);
        doc.text(domainTitle, margin + 3, domainY + 6);
        
        // Texte du/des domaine(s)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const domainText = domains.join(' • ');
        const domainLines = doc.splitTextToSize(domainText, tableWidth - 12);
        
        // Calculer la hauteur nécessaire pour le texte
        const lineHeight = 4;
        const textHeight = domainLines.length * lineHeight;
        const titleHeight = 8; // Hauteur réservée au titre
        const availableHeight = cellHeight - titleHeight - 4; // Marge de sécurité
        
        // Ajuster la position Y du texte pour éviter le chevauchement avec le titre
        let textY = domainY + 10;
        if (textHeight > availableHeight) {
            textY = domainY + 8; // Commencer juste après le titre
        }
        
        doc.text(domainLines, margin + 3, textY);
        
        // Ligne 3: Objectif
        const goalY = domainY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, goalY, margin + tableWidth, goalY);
        doc.line(margin, goalY + cellHeight, margin + tableWidth, goalY + cellHeight);
        
        // Titre de l'objectif
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Objectif :', margin + 3, goalY + 6);
        
        // Texte de l'objectif
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        doc.text(goalLines, margin + 3, goalY + 12);
        
        // Ligne 4: Consigne
        const instructionY = goalY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, instructionY, margin + tableWidth, instructionY);
        doc.line(margin, instructionY + cellHeight, margin + tableWidth, instructionY + cellHeight);
        
        // Titre de la consigne
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Consigne :', margin + 3, instructionY + 6);
        
        // Texte de la consigne
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        doc.text(instructionLines, margin + 3, instructionY + 12);
        
        // Bordures verticales
        doc.line(margin, startY, margin, instructionY + cellHeight);
        doc.line(margin + tableWidth, startY, margin + tableWidth, instructionY + cellHeight);
    }

    // Charger les données sauvegardées
    loadSavedData() {
        const savedData = localStorage.getItem('objectivesGridFormData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Restaurer les domaines sélectionnés
                if (data.selectedDomains && Array.isArray(data.selectedDomains)) {
                    data.selectedDomains.forEach(domain => {
                        const checkbox = document.querySelector(`.domain-checkbox[value="${domain}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }
                
                // Restaurer les autres champs
                if (data.objectiveGoal) {
                    document.getElementById('objectiveGoal').value = data.objectiveGoal;
                }
                if (data.objectiveInstruction) {
                    document.getElementById('objectiveInstruction').value = data.objectiveInstruction;
                }
                if (data.useDate) {
                    document.getElementById('useDate').value = data.useDate;
                }
                if (data.dateText) {
                    document.getElementById('dateText').value = data.dateText;
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données sauvegardées:', error);
            }
        }
    }

    // Sauvegarder les données actuelles
    saveCurrentData() {
        const selectedDomains = this.getSelectedDomains();
        const data = {
            selectedDomains: selectedDomains,
            objectiveGoal: document.getElementById('objectiveGoal').value,
            objectiveInstruction: document.getElementById('objectiveInstruction').value,
            useDate: document.getElementById('useDate').value,
            dateText: document.getElementById('dateText').value
        };
        
        localStorage.setItem('objectivesGridFormData', JSON.stringify(data));
    }

    // Configurer la sauvegarde automatique
    setupAutoSave() {
        const fields = ['objectiveGoal', 'objectiveInstruction', 'useDate', 'dateText'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.saveCurrentData();
                });
                
                field.addEventListener('change', () => {
                    this.saveCurrentData();
                });
            }
        });

        // Sauvegarde pour les checkboxes de domaines
        const checkboxes = document.querySelectorAll('.domain-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.saveCurrentData();
            });
        });

        // Double-clic pour sélectionner un seul domaine
        const checkboxLabels = document.querySelectorAll('.checkbox-label');
        checkboxLabels.forEach(label => {
            label.addEventListener('dblclick', (e) => {
                e.preventDefault();
                const checkbox = label.querySelector('.domain-checkbox');
                if (checkbox) {
                    // Décocher tous les domaines
                    checkboxes.forEach(cb => cb.checked = false);
                    // Cocher seulement le domaine double-cliqué
                    checkbox.checked = true;
                    // Sauvegarder les changements
                    this.saveCurrentData();
                }
            });
        });
    }

    // Gérer l'import CSV (même format que badge generator)
    handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const names = this.parseCSV(csv);
                
                // Créer un objet CSV avec métadonnées
                const csvData = {
                    id: Date.now(), // ID unique
                    name: file.name.replace('.csv', ''), // Nom du fichier sans extension
                    names: names,
                    count: names.length,
                    date: new Date().toLocaleDateString('fr-FR')
                };
                
                // Ajouter à la liste des CSV importés
                this.importedCsvs.push(csvData);
                
                // Sauvegarder les CSV
                this.saveCsvData();
                
                // Mettre à jour l'affichage
                this.updateCsvDisplay();
                
                // Vider le champ file pour permettre la réimportation du même fichier
                event.target.value = '';
                
                this.showMessage(`CSV "${csvData.name}" importé avec succès ! (${names.length} prénoms)`, 'success');
            } catch (error) {
                console.error('Erreur lors de l\'import CSV:', error);
                this.showMessage('Erreur lors de l\'import du fichier CSV.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Parser CSV (même logique que badge generator)
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const names = [];

        lines.forEach((line, index) => {
            if (line.trim() && index > 0) { // Skip header
                const [firstName] = line.split(',').map(s => s.trim());
                if (firstName) {
                    names.push(firstName);
                }
            }
        });
        
        if (names.length === 0) {
            throw new Error('Aucun prénom trouvé dans le CSV.');
        }
        
        return names;
    }

    // Afficher un message
    showMessage(message, type = 'info') {
        // Créer un élément de message temporaire
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        // Couleur selon le type
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#48bb78';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#f56565';
                break;
            case 'info':
            default:
                messageDiv.style.backgroundColor = '#667eea';
                break;
        }

        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Supprimer après 3 secondes
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Sauvegarder les données CSV
    saveCsvData() {
        localStorage.setItem('objectivesGridCsvData', JSON.stringify(this.importedCsvs));
    }

    // Charger les données CSV
    loadCsvData() {
        const savedCsvs = localStorage.getItem('objectivesGridCsvData');
        if (savedCsvs) {
            try {
                this.importedCsvs = JSON.parse(savedCsvs);
                this.updateCsvDisplay();
            } catch (error) {
                console.error('Erreur lors du chargement des CSV:', error);
                this.importedCsvs = [];
            }
        }
    }

    // Mettre à jour l'affichage des CSV
    updateCsvDisplay() {
        const csvSelectionGroup = document.getElementById('csvSelectionGroup');
        const csvList = document.getElementById('csvList');
        const clearAllBtn = document.getElementById('clearAllCsv');

        if (this.importedCsvs.length === 0) {
            csvSelectionGroup.style.display = 'none';
            return;
        }

        csvSelectionGroup.style.display = 'block';
        clearAllBtn.style.display = this.importedCsvs.length > 1 ? 'block' : 'none';

        // Vider la liste
        csvList.innerHTML = '';

        // Ajouter chaque CSV
        this.importedCsvs.forEach(csvData => {
            const csvItem = document.createElement('div');
            csvItem.className = 'csv-item';
            csvItem.dataset.csvId = csvData.id;

            csvItem.innerHTML = `
                <input type="checkbox" class="csv-checkbox" id="csv-${csvData.id}">
                <div class="csv-info">
                    <div class="csv-name">${csvData.name}</div>
                    <div class="csv-count">${csvData.count} prénoms - Importé le ${csvData.date}</div>
                </div>
                <button type="button" class="csv-remove" onclick="objectivesGenerator.removeCsv(${csvData.id})">Supprimer</button>
            `;

            csvList.appendChild(csvItem);
        });

        // Ajouter les événements de clic et double-clic
        this.setupCsvItemEvents();
    }

    // Supprimer un CSV
    removeCsv(csvId) {
        this.importedCsvs = this.importedCsvs.filter(csv => csv.id !== csvId);
        this.saveCsvData();
        this.updateCsvDisplay();
        this.updateSelectedNames();
        this.showMessage('CSV supprimé', 'success');
    }

    // Effacer tous les CSV
    clearAllCsvs() {
        if (confirm('Êtes-vous sûr de vouloir supprimer tous les CSV importés ?')) {
            this.importedCsvs = [];
            this.saveCsvData();
            this.updateCsvDisplay();
            this.updateSelectedNames();
            this.showMessage('Tous les CSV ont été supprimés', 'success');
        }
    }

    // Mettre à jour les noms sélectionnés
    updateSelectedNames() {
        const selectedCsvs = this.importedCsvs.filter(csv => {
            const checkbox = document.getElementById(`csv-${csv.id}`);
            return checkbox && checkbox.checked;
        });

        this.importedNames = [];
        selectedCsvs.forEach(csv => {
            this.importedNames.push(...csv.names);
        });

        // Mettre à jour les styles visuels
        document.querySelectorAll('.csv-item').forEach(item => {
            const checkbox = item.querySelector('.csv-checkbox');
            if (checkbox) {
                this.updateCsvItemStyle(item, checkbox.checked);
            }
        });

        // Le mode est maintenant automatique basé sur la sélection des CSV
    }

    // Configurer les événements des éléments CSV
    setupCsvItemEvents() {
        const csvItems = document.querySelectorAll('.csv-item');
        csvItems.forEach(item => {
            // Clic simple pour sélectionner/désélectionner
            item.addEventListener('click', (e) => {
                // Ne pas déclencher si on clique sur le bouton supprimer
                if (e.target.classList.contains('csv-remove')) {
                    return;
                }
                
                const checkbox = item.querySelector('.csv-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.updateCsvItemStyle(item, checkbox.checked);
                    this.updateSelectedNames();
                }
            });

            // Double-clic pour sélectionner uniquement ce CSV
            item.addEventListener('dblclick', (e) => {
                e.preventDefault();
                const checkbox = item.querySelector('.csv-checkbox');
                if (checkbox) {
                    // Décocher tous les CSV
                    document.querySelectorAll('.csv-checkbox').forEach(cb => {
                        cb.checked = false;
                        const csvItem = cb.closest('.csv-item');
                        if (csvItem) {
                            this.updateCsvItemStyle(csvItem, false);
                        }
                    });
                    // Cocher seulement le CSV double-cliqué
                    checkbox.checked = true;
                    this.updateCsvItemStyle(item, true);
                    this.updateSelectedNames();
                }
            });
        });
    }

    // Mettre à jour le style d'un élément CSV
    updateCsvItemStyle(csvItem, isSelected) {
        if (isSelected) {
            csvItem.classList.add('selected');
        } else {
            csvItem.classList.remove('selected');
        }
    }

    // Configurer les événements CSV
    setupCsvEventListeners() {
        // Événement pour le bouton "Effacer tous les CSV"
        const clearAllBtn = document.getElementById('clearAllCsv');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllCsvs();
            });
        }

        // Événements pour les checkboxes CSV (délégation d'événements)
        const csvList = document.getElementById('csvList');
        if (csvList) {
            csvList.addEventListener('change', (e) => {
                if (e.target.classList.contains('csv-checkbox')) {
                    const csvItem = e.target.closest('.csv-item');
                    if (csvItem) {
                        this.updateCsvItemStyle(csvItem, e.target.checked);
                    }
                    this.updateSelectedNames();
                }
            });
        }
    }
}

// Initialiser l'application
let objectivesGenerator;

document.addEventListener('DOMContentLoaded', function() {
    objectivesGenerator = new ObjectivesGridGenerator();
    
    // Ajouter les styles d'animation pour les messages
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Fonction globale pour le bouton
function generatePDF() {
    objectivesGenerator.generatePDF();
}

// Fonction globale pour l'impression
function printPDF() {
    objectivesGenerator.printPDF();
}

// Fonction globale pour l'import CSV
function handleCSVImport(event) {
    objectivesGenerator.handleCSVImport(event);
}

// Gestion des raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter pour générer le PDF
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generatePDF();
    }
});