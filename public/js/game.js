// axios.post("/page", { type: "random" }).then((res) => {
//   console.log(res.data);
// });

axios.post("/page", {}).then((res) => {
  // Now I just need to download the base64String as a PDF.
  let base64String = res.data.slice(28);
  console.log(base64String);
  loadPDF(base64String);
});

async function loadPDF(base64String) {
  // // Decode the Base64 string
  // const pdfBuffer = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));

  // // Load a PDFDocument from the existing PDF bytes
  // const pdfDoc = await PDFDocument.load(pdfBuffer);

  // // Serialize the PDFDocument to bytes (a Uint8Array)
  // const pdfBytes = await pdfDoc.save();

  // // For this example, let's write it to a new file. In real-world scenarios, you'd probably
  // // want to send it to a server, display it in a viewer, etc.
  // const blob = new Blob([pdfBytes], { type: "application/pdf" });

  var binary = atob(base64String.replace(/\s/g, ""));
  var len = binary.length;
  var buffer = new ArrayBuffer(len);
  var view = new Uint8Array(buffer);
  for (var i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }

  // create the blob object with content-type "application/pdf"
  var blob = new Blob([view], { type: "application/pdf" });

  let blobUrl = URL.createObjectURL(blob);

  let newspaperPdf = document.createElement("embed");
  newspaperPdf.type = "application/pdf";
  newspaperPdf.src = `${blobUrl}#view=FitH`;
  newspaperPdf.id = "newspaperPdf";
  newspaperPdf.style.width = "100%";
  newspaperPdf.style.height = "100%";
  newspaperPdf.title = "Hello";

  document.getElementById("pdfWrapper").appendChild(newspaperPdf);

  console.log("loaded");
}
