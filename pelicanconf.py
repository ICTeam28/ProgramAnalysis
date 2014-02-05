import sys
from markdown import Markdown
sys.path = ['./'] + sys.path

PLUGIN_PATH = './plugins'

TIMEZONE = 'Europe/London'

from plugins import citations
PLUGINS = [citations,]

SITEURL = 'http://output.dev'

DEFAULT_LANG = u'en'
DEFAULT_PAGINATION = False
ARTICLE_DIR = './summaries/'
PAGE_DIR = './pages/'
THEME = './theme'

RELATIVE_URLS = True

# TODO: Move these into their own files.

INTROS = {
    'general'       : 'This is the general introduction'
  , 'epiphanies'    : 'Epiphanies introduction'
  , 'thirdcategory' : 'Third category introduction'
}

md = Markdown()

INTROS = {k : md.convert(v) for k, v in INTROS.items()}
