# 🎖️ Badge Generator

A simple, modern web application for generating printable badges in PDF format. Perfect for events, conferences, workshops, and any occasion where you need to create personalized name badges.

## ✨ Features

- **Customizable Badge Sizes**: Configure width and height in centimeters
- **Beautiful Borders**: Colorful, rounded borders with customizable colors and radius
- **Individual Picture Control**: Show/hide pictures for each badge independently
- **Per-Row Gender Settings**: Set boy/girl emoji for each badge individually
- **Smart Fallbacks**: Cute boy/girl emojis when pictures are hidden or unavailable
- **Typography**: Easy-to-read fonts with first letter highlighting in contrasting colors
- **Real-time Preview**: See how your badges will look before generating the PDF
- **CSV Import**: Bulk import names from CSV files
- **Data Persistence**: All data is automatically saved and restored when refreshing the page
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **PDF Generation**: High-quality PDF output ready for printing with proper image ratios

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download or clone this repository
2. Open `index.html` in your web browser
3. That's it! The application is ready to use

## 📖 How to Use

### 1. Configure Badge Settings
- **Badge Size**: Set width and height in centimeters
- **Border Color**: Choose any color for the badge borders
- **Border Radius**: Adjust the roundness of the corners

### 2. Add Badge Data
- **Manual Entry**: Type names and upload pictures one by one
- **Individual Picture Control**: Use the checkbox in each row to show/hide pictures independently
- **Per-Row Gender Settings**: Choose boy or girl emoji for each badge individually
- **Add Rows**: Click "+ Add Row" to add more badges
- **Remove Rows**: Use the "Remove" button to delete unwanted entries
- **CSV Import**: Import a list of names from a CSV file
- **Auto-Save**: All data is automatically saved and will be restored when you refresh the page

### 3. Preview and Generate
- **Live Preview**: See your badges update in real-time
- **Generate PDF**: Click the button to create a printable PDF
- **Print Ready**: The PDF is optimized for printing with proper spacing

## 📁 File Structure

```
BadgeGenerator/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## 🎨 Customization Options

### Badge Dimensions
- **Width**: 5cm to 15cm (adjustable in 0.5cm increments)
- **Height**: 4cm to 12cm (adjustable in 0.5cm increments)

### Visual Elements
- **Border Colors**: Any hex color value
- **Border Radius**: 5px to 30px for corner roundness
- **Typography**: Clean, readable fonts with first letter emphasis
- **Layout**: Centered design with proper spacing

### Content Options
- **Pictures**: Individual photos for each person
- **Default Avatars**: Cute emoji placeholders (👦 for boys, 👧 for girls)
- **Names**: Automatically converted to uppercase with first letter highlighting

## 📊 CSV Import Format

To import names from a CSV file:

1. Create a CSV file with the following format:
```csv
FirstName
John
Jane
Mike
Sarah
```

2. Click "Import CSV" and select your file
3. The names will be automatically loaded into the badge table
4. You can then add pictures individually for each person

## 🖨️ Printing Tips

- **Paper Size**: The PDF is generated in A4 format
- **Margins**: 1cm margins on all sides for optimal printing
- **Badge Layout**: Badges are automatically arranged to fit the page
- **Page Breaks**: New pages are added automatically when needed
- **Print Quality**: Use high-quality settings for best results

## 🔧 Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript
- **PDF Generation**: Uses jsPDF library for PDF creation
- **Image Processing**: html2canvas for converting badges to images
- **Responsive**: CSS Grid and Flexbox for modern layouts
- **Browser Support**: Works in all modern browsers

## 🐛 Troubleshooting

### Common Issues

**PDF Generation Fails**
- Ensure you have at least one badge with a name
- Check that your browser supports the required features
- Try refreshing the page and generating again

**Pictures Not Loading**
- Make sure the image files are valid (JPG, PNG, etc.)
- Check that the files aren't too large
- Try using different image formats

**Badge Preview Not Updating**
- Refresh the page
- Check the browser console for any error messages
- Ensure all required fields are filled

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Not supported

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure you're using a supported browser
4. Try refreshing the page and starting over

---

**Happy Badge Making! 🎉**
