#!/bin/sh

USER="nguy4477"
MACHINE="csel-kh4250-10.cselabs.umn.edu"
DIRECTORY=".www/MazeDemo/"

#uncomment these lines if you add assets to the project
rm -rf dist/assets
cp -r public/assets dist/assets
rsync -avr --delete --chmod=D701,F644 dist/ "$USER"@"$MACHINE":"$DIRECTORY"