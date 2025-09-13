// Générateur de Grilles d'Objectifs - Maternelle
class ObjectivesGridGenerator {
    constructor() {
        this.loadSavedData();
        this.setupAutoSave();
        this.importedNames = [];
        this.initializeDate();
    }

    // Initialiser la date du jour
    initializeDate() {
        const today = new Date();
        const dateInput = document.getElementById('useDate');
        if (dateInput) {
            dateInput.value = today.toISOString().split('T')[0];
        }
    }

    // Générer le PDF
    generatePDF() {
        const learningDomain = document.getElementById('learningDomain').value;
        const objectiveGoal = document.getElementById('objectiveGoal').value.trim();
        const objectiveInstruction = document.getElementById('objectiveInstruction').value.trim();
        const previewMode = document.getElementById('previewMode').value;
        const useDate = document.getElementById('useDate').value;

        // Validation
        if (!learningDomain || !objectiveGoal || !objectiveInstruction) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Validation pour le mode CSV
        if (previewMode === 'csv' && this.importedNames.length === 0) {
            alert('Veuillez d\'abord importer un fichier CSV avec des prénoms.');
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
            const gridHeight = 50; // Hauteur d'une grille (4 lignes × 12.5mm)
            const gridSpacing = 5; // Espacement entre les grilles
            
            // Calculer le nombre maximum de grilles par page
            const availableHeight = pageHeight - (2 * margin);
            const maxGridsPerPage = Math.floor(availableHeight / (gridHeight + gridSpacing));
            
            // Générer les grilles selon le mode
            if (previewMode === 'csv') {
                this.generateWithNames(doc, learningDomain, objectiveGoal, objectiveInstruction, useDate, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing);
            } else {
                this.generateFullPage(doc, learningDomain, objectiveGoal, objectiveInstruction, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing, maxGridsPerPage);
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
            generateBtn.disabled = false;
            generateBtn.textContent = 'Générer le PDF';
        }
    }

    // Générer une page complète optimisée
    generateFullPage(doc, domain, goal, instruction, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing, maxGridsPerPage) {
        let yPosition = margin;
        
        // Générer toutes les grilles possibles sur la page
        for (let i = 0; i < maxGridsPerPage; i++) {
            // Créer le tableau simple
            this.createSimpleTable(doc, domain, goal, instruction, yPosition, contentWidth, margin);
            
            // Passer à la position suivante
            yPosition += gridHeight + gridSpacing;
        }
    }

    // Générer avec les prénoms importés
    generateWithNames(doc, domain, goal, instruction, useDate, pageWidth, pageHeight, margin, contentWidth, gridHeight, gridSpacing) {
        let yPosition = margin;
        let currentPage = 0;
        
        for (let i = 0; i < this.importedNames.length; i++) {
            // Vérifier si on a besoin d'une nouvelle page
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                yPosition = margin;
                currentPage++;
            }
            
            // Créer le tableau avec le prénom prérempli
            this.createTableWithName(doc, this.importedNames[i], useDate, domain, goal, instruction, yPosition, contentWidth, margin);
            
            // Passer à la position suivante
            yPosition += gridHeight + gridSpacing;
        }
    }

    // Créer un tableau avec prénom prérempli
    createTableWithName(doc, name, date, domain, goal, instruction, startY, tableWidth, margin) {
        const cellHeight = 12.5;
        const lineWidth = 0.2;
        
        // Ligne 1: Prénom et Date
        doc.setLineWidth(lineWidth);
        doc.line(margin, startY, margin + tableWidth, startY);
        doc.line(margin, startY + cellHeight, margin + tableWidth, startY + cellHeight);
        doc.line(margin + tableWidth/2, startY, margin + tableWidth/2, startY + cellHeight);
        
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
            const formattedDate = new Date(date).toLocaleDateString('fr-FR');
            doc.text(formattedDate, margin + tableWidth/2 + 25, startY + 8);
        }
        
        // Reste du tableau (domaine, objectif, consigne)
        this.addTableContent(doc, domain, goal, instruction, startY, tableWidth, margin, cellHeight, lineWidth);
    }

    // Créer un tableau simple
    createSimpleTable(doc, domain, goal, instruction, startY, tableWidth, margin) {
        const cellHeight = 12.5; // Optimisé pour les polices plus grandes
        const lineWidth = 0.2; // Lignes encore plus fines
        
        // Ligne 1: Nom et Date
        doc.setLineWidth(lineWidth);
        doc.line(margin, startY, margin + tableWidth, startY); // Ligne du haut
        doc.line(margin, startY + cellHeight, margin + tableWidth, startY + cellHeight); // Ligne du bas
        
        // Ligne verticale au milieu
        doc.line(margin + tableWidth/2, startY, margin + tableWidth/2, startY + cellHeight);
        
        // Texte dans les cellules
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Prénom :', margin + 3, startY + 8);
        doc.text('Date :', margin + tableWidth/2 + 3, startY + 8);
        
        // Ligne 2: Domaine de compétence
        const domainY = startY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, domainY, margin + tableWidth, domainY); // Ligne du haut
        doc.line(margin, domainY + cellHeight, margin + tableWidth, domainY + cellHeight); // Ligne du bas
        
        // Titre du domaine
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Domaine d\'apprentissage :', margin + 3, domainY + 6);
        
        // Texte du domaine
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const domainLines = doc.splitTextToSize(domain, tableWidth - 12);
        doc.text(domainLines, margin + 3, domainY + 10);
        
        // Ligne 3: Objectif
        const goalY = domainY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, goalY, margin + tableWidth, goalY); // Ligne du haut
        doc.line(margin, goalY + cellHeight, margin + tableWidth, goalY + cellHeight); // Ligne du bas
        
        // Titre de l'objectif
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Objectif :', margin + 3, goalY + 6);
        
        // Texte de l'objectif
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        doc.text(goalLines, margin + 3, goalY + 10);
        
        // Ligne 4: Consigne
        const instructionY = goalY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, instructionY, margin + tableWidth, instructionY); // Ligne du haut
        doc.line(margin, instructionY + cellHeight, margin + tableWidth, instructionY + cellHeight); // Ligne du bas
        
        // Titre de la consigne
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Consigne :', margin + 3, instructionY + 6);
        
        // Texte de la consigne
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        doc.text(instructionLines, margin + 3, instructionY + 10);
        
        // Bordures verticales
        doc.line(margin, startY, margin, instructionY + cellHeight); // Bordure gauche
        doc.line(margin + tableWidth, startY, margin + tableWidth, instructionY + cellHeight); // Bordure droite
    }

    // Ajouter le contenu du tableau (domaine, objectif, consigne)
    addTableContent(doc, domain, goal, instruction, startY, tableWidth, margin, cellHeight, lineWidth) {
        // Ligne 2: Domaine de compétence
        const domainY = startY + cellHeight;
        doc.setLineWidth(lineWidth);
        doc.line(margin, domainY, margin + tableWidth, domainY);
        doc.line(margin, domainY + cellHeight, margin + tableWidth, domainY + cellHeight);
        
        // Titre du domaine
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Domaine d\'apprentissage :', margin + 3, domainY + 6);
        
        // Texte du domaine
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const domainLines = doc.splitTextToSize(domain, tableWidth - 12);
        doc.text(domainLines, margin + 3, domainY + 10);
        
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
        doc.setFontSize(9);
        const goalLines = doc.splitTextToSize(goal, tableWidth - 12);
        doc.text(goalLines, margin + 3, goalY + 10);
        
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
        doc.setFontSize(9);
        const instructionLines = doc.splitTextToSize(instruction, tableWidth - 12);
        doc.text(instructionLines, margin + 3, instructionY + 10);
        
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
                
                // Restaurer les valeurs des champs
                if (data.learningDomain) {
                    document.getElementById('learningDomain').value = data.learningDomain;
                }
                if (data.objectiveGoal) {
                    document.getElementById('objectiveGoal').value = data.objectiveGoal;
                }
                if (data.objectiveInstruction) {
                    document.getElementById('objectiveInstruction').value = data.objectiveInstruction;
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données sauvegardées:', error);
            }
        }
    }

    // Sauvegarder les données actuelles
    saveCurrentData() {
        const data = {
            learningDomain: document.getElementById('learningDomain').value,
            objectiveGoal: document.getElementById('objectiveGoal').value,
            objectiveInstruction: document.getElementById('objectiveInstruction').value
        };
        
        localStorage.setItem('objectivesGridFormData', JSON.stringify(data));
    }

    // Configurer la sauvegarde automatique
    setupAutoSave() {
        const fields = ['learningDomain', 'objectiveGoal', 'objectiveInstruction'];
        
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
    }

    // Gérer l'import CSV (même format que badge generator)
    handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                this.parseCSV(csv);
                
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
        this.importedNames = [];

        lines.forEach((line, index) => {
            if (line.trim() && index > 0) { // Skip header
                const [firstName] = line.split(',').map(s => s.trim());
                if (firstName) {
                    this.importedNames.push(firstName);
                }
            }
        });
        
        if (this.importedNames.length === 0) {
            alert('Aucun prénom trouvé dans le CSV.');
            return;
        }
        
        // Mettre à jour l'interface
        const previewMode = document.getElementById('previewMode');
        previewMode.value = 'csv';
        
        this.showMessage(`${this.importedNames.length} prénom(s) importé(s) avec succès !`, 'success');
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