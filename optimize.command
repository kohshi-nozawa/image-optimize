#!/bin/sh
cd `dirname $0`
npx gulp
osascript -e 'tell application "Terminal" to quit' &
exit