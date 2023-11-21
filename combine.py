import fitz
import sys
import os

combined = fitz.open()

for i in range(2, len(sys.argv)):
    doc = fitz.open("./newspapers/" + sys.argv[i] + "-redacted.pdf")
    combined.insert_pdf(doc)
    doc.close()
    os.unlink("./newspapers/" + sys.argv[i] + "-redacted.pdf")

combined.save("./newspapers/" + sys.argv[1] + "-combined.pdf")
