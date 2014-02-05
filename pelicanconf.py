import sys
import os
from markdown import Markdown
sys.path = ['./'] + sys.path

PLUGIN_PATH = './plugins'

TIMEZONE = 'Europe/London'

from plugins import citations
PLUGINS = [citations,]

SITENAME = 'Program Analysis: Analysis'
SITEURL = 'http://output.dev'
DEFAULT_LANG = u'en'
DEFAULT_PAGINATION = False
ARTICLE_DIR = './summaries/'
PAGE_DIR = './pages/'
INTRODUCTION_DIR = './introductions/'
THEME = './theme'

RELATIVE_URLS = True

# TODO: Move these into their own files.

INTROS = {}

md = Markdown()

for root, _, files in os.walk(INTRODUCTION_DIR):
    for name in files:
        category, ext = os.path.splitext(name)
        if ext != '.md':
            raise IOError('Introdutions must all be markdown.')
        with open(os.path.join(root, name), 'r') as f:
            INTROS[category.lower()] = md.convert(f.read())
