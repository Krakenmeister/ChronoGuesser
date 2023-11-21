import re
import fitz
import os
import sys
from ocrmypdf.hocrtransform import HocrTransform
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from google.cloud.documentai_toolbox import document


PROJECT_ID = "112216068324"
LOCATION = "us"  # Format is 'us' or 'eu'
PROCESSOR_ID = "83a7966a2733926b"  # Create processor in Cloud Console
PROCESSOR_VERSION = "pretrained-ocr-v2.0-2023-06-02"

# The local file in your current working directory
# FILE_PATH = "./newspapers/" + sys.argv[1] + "-loc.pdf"
FILE_PATH = "./newspapers/highdef.jpg"
# Refer to https://cloud.google.com/document-ai/docs/file-types
# for supported file types
MIME_TYPE = "application/pdf"

# Instantiates a client
docai_client = documentai.DocumentProcessorServiceClient(
    client_options=ClientOptions(
        api_endpoint=f"{LOCATION}-documentai.googleapis.com")
)

# The full resource name of the processor, e.g.:
# projects/project-id/locations/location/processor/processor-id
# You must create new processors in the Cloud Console first
RESOURCE_NAME = docai_client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
# RESOURCE_NAME = docai_client.processor_version_path(
# PROJECT_ID, LOCATION, PROCESSOR_ID, PROCESSOR_VERSION)

# Read the file into memory
with open(FILE_PATH, "rb") as image:
    image_content = image.read()

# Load Binary Data into Document AI RawDocument Object
raw_document = documentai.RawDocument(
    content=image_content, mime_type=MIME_TYPE)

# Configure the process request
request = documentai.ProcessRequest(
    name=RESOURCE_NAME, raw_document=raw_document)

# Use the Document AI client to process the sample form
result = docai_client.process_document(request=request)

document_object = result.document
print("Document processing complete.")
# print(f"Text: {document_object.text}")

wrapped_document = document.Document.from_documentai_document(document_object)

print("Converted to documentai object")

hocr_string = wrapped_document.export_hocr_str(title="Test")

print("Converted to HOCR string")

hocr_file = ""
for i in range(len(hocr_string)):
    if hocr_string[i] == "<":
        requiresEscape = True
        if i == 0:
            requiresEscape = False
        else:
            closeRight = False
            for j in range(i+1, len(hocr_string), 1):
                if hocr_string[j] == ">":
                    closeRight = True
                    break
                elif hocr_string[j] == "<":
                    closeRight = False
                    break
            if closeRight:
                requiresEscape = False
            else:
                requiresEscape = True
        if requiresEscape:
            hocr_file += "&lt;"
        else:
            hocr_file += hocr_string[i]
    elif hocr_string[i] == ">":
        requiresEscape = True
        if i == len(hocr_string) - 1:
            requiresEscape = False
        else:
            openLeft = False
            for j in range(i-1, -1, -1):
                if hocr_string[j] == "<":
                    openLeft = True
                    break
                elif hocr_string[j] == ">":
                    openLeft = False
                    break
            if openLeft:
                requiresEscape = False
            else:
                requiresEscape = True
        if requiresEscape:
            hocr_file += "&gt;"
        else:
            hocr_file += hocr_string[i]
    elif hocr_string[i] == "&":
        hocr_file += "&amp;"
    else:
        hocr_file += hocr_string[i]

with open("./newspapers/" + sys.argv[1] + "-hocr.xml", "w", encoding="utf-8") as file:
    file.write(hocr_file)
    file.close()
