#!/bin/bash
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

cd build
zip -r ../gh-pages/win64.zip win64
zip -r ../gh-pages/win32.zip win32
zip -r ../gh-pages/linux64.zip linux64
zip -r ../gh-pages/linux32.zip linux32
zip -r ../gh-pages/osx64.zip osx64
cd ../
mkdir gh-pages
cd gh-pages
git init
git add .
git commit --quiet -m "Deploy to Github Pages"
git push --force "https://${GITHUB_TOKEN}@github.com/TheBrokenRail/IDE.js.git" master:gh-pages
