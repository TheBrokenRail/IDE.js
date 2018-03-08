#!/bin/bash
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

cd build
git init
git add .
git commit -m "Deploy to Github Pages"
git push --force "https://${GITHUB_TOKEN}@$github.com/TheBrokenRail/IDE.js.git" master:gh-pages
