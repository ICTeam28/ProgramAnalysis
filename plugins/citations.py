from pelican import signals
from pelican import contents

def test(gen, metadata):
    print gen
    print dir(gen)
    print gen.context
    print metadata
    print dir(metadata)

def test2(*args):
    print "test2", args

def register():
    signals.content_object_init.connect(test)
    signals.initialized.connect(test2)
    signals.article_generator_context.connect(test)
