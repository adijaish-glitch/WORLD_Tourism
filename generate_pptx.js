const PptxGenJS = require("pptxgenjs");

let pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addText("TIMS", { x: 1.5, y: 1.5, w: 7, fontSize: 48, bold: true, align: "center", color: "363636" });
slide1.addText("Tourism Information Management System", { x: 1.5, y: 2.5, w: 7, fontSize: 24, align: "center", color: "666666" });
slide1.addText("An integrated platform for travel and destination management.", { x: 1.5, y: 3.5, w: 7, fontSize: 18, align: "center", color: "888888" });

// Slide 2: The Problem
let slide2 = pptx.addSlide();
slide2.addText("The Problem", { x: 0.5, y: 0.5, fontSize: 36, bold: true, color: "363636" });
slide2.addText([
    { text: "Scattered information about destinations and travel packages.", options: { bullet: true } },
    { text: "Inefficient tools for administrators to manage bookings and packages.", options: { bullet: true } },
    { text: "Poor user experience in discovering new travel opportunities.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 8.5, h: 3, fontSize: 24, color: "555555" });

// Slide 3: Our Solution
let slide3 = pptx.addSlide();
slide3.addText("Our Solution", { x: 0.5, y: 0.5, fontSize: 36, bold: true, color: "363636" });
slide3.addText("A comprehensive, full-stack web application designed to streamline the travel management process for both administrators and end-users.", { x: 0.5, y: 2, w: 8.5, fontSize: 28, color: "555555", align: "center" });

// Slide 4: Key Features
let slide4 = pptx.addSlide();
slide4.addText("Key Features", { x: 0.5, y: 0.5, fontSize: 36, bold: true, color: "363636" });
slide4.addText([
    { text: "Interactive Destinations: Explore curated travel spots.", options: { bullet: true } },
    { text: "Dynamic Packages: Browse and book customizable travel packages.", options: { bullet: true } },
    { text: "Admin Dashboard: Centralized control for managing content, users, and bookings.", options: { bullet: true } },
    { text: "Seamless Experience: Responsive design and fast loading times.", options: { bullet: true } }
], { x: 0.5, y: 1.5, w: 8.5, h: 3, fontSize: 24, color: "555555" });

// Slide 5: Technology Stack
let slide5 = pptx.addSlide();
slide5.addText("Technology Stack", { x: 0.5, y: 0.5, fontSize: 36, bold: true, color: "363636" });
slide5.addText("Frontend:\nReact.js\nVite", { x: 1, y: 2, w: 2.5, fontSize: 24, align: "center" });
slide5.addText("Backend:\nNode.js\nExpress", { x: 3.5, y: 2, w: 2.5, fontSize: 24, align: "center" });
slide5.addText("Database:\nSQL / ORM\n(Migrations & Seeding)", { x: 6, y: 2, w: 3, fontSize: 24, align: "center" });

// Slide 6: Q&A
let slide6 = pptx.addSlide();
slide6.addText("Thank You!", { x: 0.5, y: 1.5, w: 9, fontSize: 48, bold: true, align: "center", color: "363636" });
slide6.addText("We are ready to revolutionize travel management.", { x: 0.5, y: 2.5, w: 9, fontSize: 24, align: "center", color: "666666" });
slide6.addText("Any Questions?", { x: 0.5, y: 3.5, w: 9, fontSize: 36, bold: true, align: "center", color: "0052cc" });

pptx.writeFile({ fileName: "TIMS_Expo_Presentation.pptx" }).then(() => {
    console.log("PPTX created successfully.");
});
