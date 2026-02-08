#!/bin/sh
rm -f /var/run/chrony/chronyd.pid
exec /usr/sbin/chronyd -d -f /etc/chrony/chrony.conf