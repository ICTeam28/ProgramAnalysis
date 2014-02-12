GRAMMAR_PATH=app/script/mini.jison
PARSER_OUTPUT=app/script/mini.js
pip2 install -r requirements.txt
echo "Building parser"
jison $GRAMMAR_PATH -o $PARSER_OUTPUT
echo "Generating site"
make html

