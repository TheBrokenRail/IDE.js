#!/bin/bash
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

mkdir gh-pages
cd build
dir
zip -r ../gh-pages/win64.zip ./IDE.js/win64
zip -r ../gh-pages/win32.zip ./IDE.js/win32
zip -r ../gh-pages/linux64.zip ./IDE.js/linux64
zip -r ../gh-pages/linux32.zip ./IDE.js/linux32
zip -r ../gh-pages/osx64.zip ./IDE.js/osx64
cd ../
cd gh-pages
git init
git add .
git commit --quiet -m "Deploy to Github Pages"
git push --force "https://${GITHUB_TOKEN}@github.com/TheBrokenRail/IDE.js.git" master:gh-pages
