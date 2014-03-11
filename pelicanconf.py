import sys
import os
from markdown import Markdown
import shutil

sys.path = ['./'] + sys.path

PLUGIN_PATH = './plugins'

TIMEZONE = 'Europe/London'

from plugins import citations, latex
PLUGINS = [citations,latex]

SITENAME = 'Program Analysis: Analysis'
SITEURL = 'http://www.doc.ic.ac.uk/project/2013/163/g12163xx/web/'
DEFAULT_LANG = u'en'
DEFAULT_PAGINATION = False
ARTICLE_DIR = './summaries/'
PAGE_DIR = './pages/'
OUTPUT_DIR = './output/'
INTRODUCTION_DIR = './introductions/'
THEME = './theme'

APP_DIR = './app/'

# TODO: REFACTOR ALL THIS
DEPENDENCY_DIR_JS = './script'
DEPENDENCY_DIR_CSS = './style'
DEPENDENCY_DIR_IMAGES = './images'

shutil.copytree(APP_DIR, OUTPUT_DIR + APP_DIR)
shutil.copytree(DEPENDENCY_DIR_JS, OUTPUT_DIR + DEPENDENCY_DIR_JS)
shutil.copytree(DEPENDENCY_DIR_CSS, OUTPUT_DIR + DEPENDENCY_DIR_CSS)
shutil.copytree(DEPENDENCY_DIR_IMAGES, OUTPUT_DIR + DEPENDENCY_DIR_IMAGES)

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
            INTROS[category.strip().lower()] = md.convert(f.read())

