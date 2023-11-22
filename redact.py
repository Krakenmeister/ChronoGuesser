import re
import fitz
import os
import sys
from ocrmypdf.hocrtransform import HocrTransform

hocr = HocrTransform(
    hocr_filename="./processing/" + sys.argv[1] + "-hocr.xml",
    dpi=300
)

# step to obtain ocirized pdf
hocr.to_pdf(
    out_filename="./processing/" + sys.argv[1] + "-hocr.pdf",
    image_filename="./processing/" + sys.argv[1] + "-loc.jp2",
    show_bounding_boxes=False,
    interword_spaces=True,
    invisible_text=True,
)

os.unlink("./processing/" + sys.argv[1] + "-hocr.xml")

print("Wrote to pdf")


def get_sensitive_data(text):
    simple_year = r"[1lITf][35-9ßb:][0-9lITßbs:][0-9lITßbs:]"
    abbreviated_month = r"\bjan[,.\s]|\bfeb[,.\s]|\bmar[,.\s]|\bapr[,.\s]|\bmay[,.\s]|\bjun[,.\s]|\bjul[,.\s]|\baug[,.\s]|\bsep[t]?[,.\s]|\boct[,.\s]|\bnov[,.\s]|\bdec[,.\s]"
    month_day = r"\bjanuary\s[1-3]?[0-9]?|\bfebruary\s[1-3]?[0-9]?|\bmarch\s[1-3]?[0-9]?|\bapril\s[1-3]?[0-9]?|\bmay\s[1-3]?[0-9]?|\bjune\s[1-3]?[0-9]?|\bjuly\s[1-3]?[0-9]?|\baugust\s[1-3]?[0-9]?|\bseptember\s[1-3]?[0-9]?|\boctober\s[1-3]?[0-9]?|\bnovember\s[1-3]?[0-9]?|\bdecember\s[1-3]?[0-9]?"
    abbreviated_year = r"['][0-9][0-9]"

    REGEX = re.compile("(%s|%s|%s|%s)" %
                       (simple_year, abbreviated_month, month_day, abbreviated_year), re.IGNORECASE)
    for match in re.finditer(REGEX, text):
        yield match.group(1)


doc = fitz.open("./processing/" + sys.argv[1] + "-hocr.pdf")
# iterating through pages
for page in doc:
    # wrap contents is needed for fixing
    # alignment issues with rect boxes in some
    # cases where there is alignment issue
    page.wrap_contents()

    # getting the rect boxes which consists the matching regex
    sensitive = get_sensitive_data(page.get_text("text"))
    for data in sensitive:
        areas = page.search_for(data)
        # drawing outline over sensitive datas
        [page.add_redact_annot(area, fill=(0, 0, 0))
         for area in areas]

    # applying the redaction
    page.apply_redactions()

doc.set_metadata({"title": "Chronicling America Newspaper"})
doc.save("./newspapers/" + sys.argv[1] + ".pdf")
doc.close()

os.unlink("./processing/" + sys.argv[1] + "-loc.jpg")
os.unlink("./processing/" + sys.argv[1] + "-loc.jp2")
os.unlink("./processing/" + sys.argv[1] + "-hocr.pdf")

print("Redacted pdf")
