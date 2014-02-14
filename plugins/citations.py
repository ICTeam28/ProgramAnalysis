from pelican import signals
from pelican import contents
from pelican.utils import pelican_open
from pelican.readers import MarkdownReader
import re
import logging

try:
    from markdown import Markdown
except ImportError:
    Markdown = False


HIGHLIGHT = 'cite-highlight'

citationScript = '''
<script>
(function (document){
var root = window.location.href.replace(window.location.hash, '')
  , links = document.querySelectorAll('a')
  , lastClicked = null;

for (var i=0; i<links.length; i++){
  var item = links[i];
  if (item.href.indexOf(root + '#cite_') != -1){
    item.addEventListener('click', (function (e){
      if (lastClicked != null){
        lastClicked.classList.remove('%s');
      }
      var ref = document.getElementById(e.target.hash.substr(1));
      ref.classList.add('%s')
      lastClicked = ref;
    }));
  }
}

})(document);
</script>
''' % (HIGHLIGHT, HIGHLIGHT)


logger = logging.getLogger(__name__)

class MarkdownCitationReader(MarkdownReader):

    enabled = bool(Markdown)

    BOUND_LINK = '\[{}(?: ([\'"])(.*?)\\1)?\]\:\s*((?:ht|f)tps?\:.*)'
    RE_CITE = re.compile('\[(@\w+)\](?!\s*\:)')

    def __init__(self, *args, **kwargs):
        super(MarkdownCitationReader, self).__init__(*args, **kwargs)

    @staticmethod
    def process_citations(text):
        '''Finds citations in the text and formats them
        according to the Vancover schema'''

        citations = MarkdownCitationReader.RE_CITE.finditer(text)
        cite_id = 0
        first_reference_start = len(text)
        last_reference_end = 0
        references = []
        offset = 0
        for citation_match in citations:
            RE_BOUND_LINK = re.compile(
                MarkdownCitationReader.BOUND_LINK.format(citation_match.group(1))
            )
            bound_link = RE_BOUND_LINK.search(text)
            if not bound_link:
                logger.debug(
                    'Unbound citation : {}'.format(citation_match.group(1))
                )
                continue

            cite_id += 1
            cite_start = citation_match.start() + offset
            cite_end   = citation_match.end() + offset
            repl = '[[{0}]](#cite_{0})'.format(cite_id)
            offset += len(repl) - (cite_end - cite_start)

            text = text[:cite_start]\
                    + '[[{0}]](#cite_{0})'.format(cite_id)\
                    + text[cite_end:]
            
            bound_link = RE_BOUND_LINK.search(text)

            link_start = bound_link.start()
            link_end   = bound_link.end()
            link_title = bound_link.group(2)
            link_url   = bound_link.group(3)

            references.insert(cite_id,
                '<p>[{0}] {1} <a name="cite_{0}" id="cite_{0}" class="reference" href="{2}">{2}</a></p>'\
                .format(cite_id, link_title or '', link_url))

            first_reference_start = min(link_start, first_reference_start)


        if first_reference_start == len(text):
            # No references
            return text

        text = text[:first_reference_start] + '\n'.join(references)
        return text

    @staticmethod
    def reduce_heading_tag_size(html, n=1):
        return re.sub('<h(\d)([^>]*)>', 
                lambda m: '<h{0}{1}>'.format(int(m.group(1))+n, m.group(2)),
                html)

    @staticmethod
    def bootstrap_tables(html):
        ''' Adds the 'table' class to all tables'''
        return re.sub('<table>', '<table class="table table-condensed">',
                html)

    def read(self, source_path):
        self._md = Markdown(extensions=self.extensions)

        with pelican_open(source_path) as text:
            text = MarkdownCitationReader.process_citations(text)
            content = self._md.convert(text)

        content = MarkdownCitationReader.reduce_heading_tag_size(content)
        content = MarkdownCitationReader.bootstrap_tables(content)


        metadata = self._parse_metadata(self._md.Meta)

        if not 'citation' in metadata.keys():
            metadata['citation'] = citationScript
        
        return content, metadata

def add_reader(readers):
    readers.reader_classes[u'md'] = MarkdownCitationReader
    readers.reader_classes[u'mkd'] = MarkdownCitationReader
    readers.reader_classes[u'mdown'] = MarkdownCitationReader
    readers.reader_classes[u'markdown'] = MarkdownCitationReader

def register():
    signals.readers_init.connect(add_reader)
