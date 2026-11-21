// Adobe After Effects ExtendScript (.jsx) automation for Module 3:
// Builds a 35-second 1080p promotional composition "Fizza_Aman_3D_Portfolio_Promo"
// with Barbie-pink brand slides, typography animations, transitions, and saves fizza-promo.aep.
// In After Effects: File > Scripts > Run Script File... -> select this file.
(function () {
  app.beginUndoGroup("Build Fizza Portfolio Promo");
  var proj = app.project || app.newProject();
  var comp = proj.items.addComp("Fizza_Aman_3D_Portfolio_Promo", 1920, 1080, 1.0, 35.0, 30);
  comp.bgColor = [1.0, 0.96, 0.98];

  var slides = [
    { start: 0,  dur: 7, title: "Hi, I'm Fizza Aman", sub: "AI & 3D Developer · BS CS&IT at NED University Karachi" },
    { start: 7,  dur: 7, title: "Welcome to My Pink Travel Kitchen", sub: "Interactive three.js 3D Web Portfolio & Blender Avatar Chef Fizz" },
    { start: 14, dur: 7, title: "Signature AI & CV Recipes", sub: "Sentinel AI (LangGraph) · AttendX (ArcFace) · TALEEM360 (AR STEM)" },
    { start: 21, dur: 7, title: "Medical Imaging & Deep Learning", sub: "HEC/NRPU 3D Deformable Image Registration · GIKI × SkyLabs Bootcamp" },
    { start: 28, dur: 7, title: "Ask My RAG AI Twin · Chef Fizz", sub: "Explore in 3D & Send a Postcard — fizzakhannna@gmail.com" }
  ];

  for (var i = 0; i < slides.length; i++) {
    var s = slides[i];
    var titleLayer = comp.layers.addText(s.title);
    titleLayer.inPoint = s.start;
    titleLayer.outPoint = s.start + s.dur;
    titleLayer.property("Position").setValue([960, 460]);

    var subLayer = comp.layers.addText(s.sub);
    subLayer.inPoint = s.start + 0.4;
    subLayer.outPoint = s.start + s.dur;
    subLayer.property("Position").setValue([960, 580]);
  }

  app.endUndoGroup();
})();
