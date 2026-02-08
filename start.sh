#!/bin/sh
set -e

rm -f /var/run/chrony/chronyd.pid
mkdir -p /var/lib/chrony /var/run/chrony /var/log/chrony
chown -R chrony:chrony /var/lib/chrony /var/run/chrony /var/log/chrony

/usr/sbin/chronyd -d -f /etc/chrony/chrony.conf &
CHRONY_PID=$!

trap 'kill $CHRONY_PID' TERM INT EXIT

npm run start
