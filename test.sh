#!/usr/bin/env bash
echo "Starting npm start"
npm start&
PID=$(echo $!)
nohup sleep 10 > /dev/null
echo "Started"
echo "Running mocha..."
mocha
RESULT=$(echo $?)
kill -9 $PID
echo "Finished"
exit $RESULT