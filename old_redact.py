# imports
import fitz
import re
import sys
import asyncio
import requests
import io


class Redactor:

    # static methods work independent of class object
    @staticmethod
    def get_sensitive_data(text):
        """ Function to get all the lines """

        # regex
        # REGEX = r"([\w\.\d]+\@[\w\d]+\.[\w\d]+)"
        # (january)|(february)|(march)|(april)|(may)|(june)|(july)|(august)|(september)|(october)|(november)|(december)|(\bjan[.\b])|(\bfeb[.\b])|(\bmar[.\b])|(\bapr[.\b])|(\bmay[.\b])|(\bjun[.\b])|(\bjul[.\b])|(\baug[.\b])|(\bsep[.\b])|(\boct[.\b])|(\bnov[.\b])|(\bdec[.\b])
        simple_year = r"[1lIT][6-9ßb][0-9lITßbs][0-9lITßbs]"
        # simple_month = r"\bjanuary\b|\bfebruary\b|\bmarch\b|\bapril\b|\bmay\b|\bjune\b|\bjuly\b|\baugust\b|\bseptember\b|\boctober\b|\bnovember\b|\bdecember\b"
        abbreviated_month = r"\bjan[.\b]|\bfeb[.\b]|\bmar[.\b]|\bapr[.\b]|\bmay[.\b]|\bjun[.\b]|\bjul[.\b]|\baug[.\b]|\bsep[.\b]|\boct[.\b]|\bnov[.\b]|\bdec[.\b]"
        month_day = r"\bjanuary\s[1-3]?[0-9]?|\bfebruary\s[1-3]?[0-9]?|\bmarch\s[1-3]?[0-9]?|\bapril\s[1-3]?[0-9]?|\bmay\s[1-3]?[0-9]?|\bjune\s[1-3]?[0-9]?|\bjuly\s[1-3]?[0-9]?|\baugust\s[1-3]?[0-9]?|\bseptember\s[1-3]?[0-9]?|\boctober\s[1-3]?[0-9]?|\bnovember\s[1-3]?[0-9]?|\bdecember\s[1-3]?[0-9]?"

        REGEX = re.compile("(%s|%s|%s)" %
                           (simple_year, abbreviated_month, month_day), re.IGNORECASE)
        for match in re.finditer(REGEX, text):
            yield match.group(1)
        # for line in lines:

        #     # matching the regex to each line
        #     for match in re.finditer(REGEX)

        #     if re.search(REGEX, line, re.IGNORECASE):
        #         for match in re.finditer(REGEX)
        #         search = re.search(REGEX, line, re.IGNORECASE)

        #         # yields creates a generator
        #         # generator is used to return
        #         # values in between function iterations
        #         if (search and search.groups()):
        #             print(search.groups().len)
        #             yield search.group(1)

    # constructor
    def __init__(self, input, output):
        self.input = input
        self.output = output

    @staticmethod
    def redact_page(url):
        request = requests.get(url)
        filestream = io.BytesIO(request.content)
        doc = fitz.open(stream=filestream, filetype="pdf")
        for page in doc:
            page.wrap_contents()
            sensitive = Redactor.get_sensitive_data(page.get_text("text"))
            for data in sensitive:
                areas = page.search_for(data)
                # drawing outline over sensitive datas
                [page.add_redact_annot(area, fill=(0, 0, 0))
                 for area in areas]
            page.apply_redactions()
        return doc

    async def redaction(self, loop):
        pages = []

        for i in range(len(self.input)):
            pages.append(None)

        futures = []
        for i in range(len(self.input)):
            future = loop.run_in_executor(
                None, Redactor.redact_page, self.input[i])
            futures.append(future)
            pages[i] = await future

        await asyncio.gather(*futures)

        redacted = fitz.open()
        for page in pages:
            # redacted_page = fitz.open(page)
            redacted.insert_pdf(page)

        # for input in self.input:
        #     # opening the pdf
        #     doc = fitz.open(input)

        #     # iterating through pages
        #     for page in doc:
        #         # wrap contents is needed for fixing
        #         # alignment issues with rect boxes in some
        #         # cases where there is alignment issue
        #         page.wrap_contents()

        #         # getting the rect boxes which consists the matching regex
        #         sensitive = self.get_sensitive_data(page.get_text("text"))
        #         for data in sensitive:
        #             areas = page.search_for(data)
        #             # drawing outline over sensitive datas
        #             [page.add_redact_annot(area, fill=(0, 0, 0))
        #              for area in areas]

        #         # applying the redaction
        #         page.apply_redactions()

        #     redacted.insert_pdf(doc)

        # saving it to a new pdf
        redacted.save(self.output)
        print("Successfully redacted")

    def redactionfromfiles(self):

        redacted = fitz.open()

        for input in self.input:
            # opening the pdf
            doc = fitz.open(input)

            # iterating through pages
            for page in doc:
                # wrap contents is needed for fixing
                # alignment issues with rect boxes in some
                # cases where there is alignment issue
                page.wrap_contents()

                # getting the rect boxes which consists the matching regex
                sensitive = self.get_sensitive_data(page.get_text("text"))
                for data in sensitive:
                    areas = page.search_for(data)
                    # drawing outline over sensitive datas
                    [page.add_redact_annot(area, fill=(0, 0, 0))
                     for area in areas]

                # applying the redaction
                page.apply_redactions()

            redacted.insert_pdf(doc)

        # saving it to a new pdf
        redacted.save(self.output)
        print("Successfully redacted")


# driver code for testing
if __name__ == "__main__":

    # replace it with name of the pdf file
    output = sys.argv[1]
    input = []

    for i in range(2, len(sys.argv)):
        input.append(sys.argv[i])

    redactor = Redactor(input, output)

    redactor.redactionfromfiles()

    # loop = asyncio.new_event_loop()
    # asyncio.set_event_loop(loop)

    # try:
    #     loop.run_until_complete(redactor.redaction(loop=loop))
    # except KeyboardInterrupt:
    #     pass
