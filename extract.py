import docx

doc = docx.Document('ranjith_content_intern.docx')
with open('sample_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join([p.text for p in doc.paragraphs]))
