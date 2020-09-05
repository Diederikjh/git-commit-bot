#!/bin/bash

# update code to AWS

rm function.zip
zip -r function.zip .
aws lambda update-function-code --function-name git-commit-bot --zip-file fileb://function.zip

