#!/bin/bash
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

mkdir gh-pages
cd build
dir
tar -czf ../gh-pages/win64.tar.gz ./IDE.js/win64
tar -czf ../gh-pages/win32.tar.gz ./IDE.js/win32
tar -czf ../gh-pages/linux64.tar.gz ./IDE.js/linux64
tar -czf ../gh-pages/linux32.tar.gz ./IDE.js/linux32
tar -czf ../gh-pages/osx64.tar.gz ./IDE.js/osx64
cd ../
cd gh-pages
git init
git add .
git commit --quiet -m "Deploy to Github Pages"
git push --force "https://${GITHUB_TOKEN}@github.com/TheBrokenRail/IDE.js.git" master:gh-pages
