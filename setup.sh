GRAMMAR_PATH=script/mini.jison
PARSER_OUTPUT=script/mini.js
pip install -r requirements.txt
echo "Building parser"
jison $GRAMMAR_PATH -o $PARSER_OUTPUT
echo "Generating site"
make html

